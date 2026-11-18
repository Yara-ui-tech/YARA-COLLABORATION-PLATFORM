import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Waves, Compass, Lightbulb, Zap, Flag,
  Maximize2, Minimize2, RefreshCw, Award, ShieldCheck, Flame, 
  AlertCircle, Sparkles, Users, MapPin, Calendar, ChevronDown, 
  ExternalLink, ArrowRight
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { getCompetitions } from '../../services/competitionsService';
import { getDigitalScores } from '../../services/competitionEcosystemService';
import { getScoreSheets } from '../../services/yaraCompetitionService';
import { Competition } from '../../types/competition';
import { DigitalScoreSubmission } from '../../types/competitionEcosystem';
import { CategoryScoreSheet } from '../../types/yaraCompetition';
import { supabase } from '../../lib/supabase';

interface UnifiedTeam {
  id: string;
  competition_id?: string;
  team_name: string;
  registration_id: string;
  school_organization: string;
  province: string;
  members_count: number;
}

interface ChallengeConfig {
  id: string;
  title: string;
  weight: number;
  iconType: 'compass' | 'waves' | 'lightbulb' | 'trophy' | 'zap' | 'flag';
}

function pickIconType(title: string): ChallengeConfig['iconType'] {
  const lower = title.toLowerCase();
  if (lower.includes('water') || lower.includes('rov') || lower.includes('ocean') || lower.includes('marine')) return 'waves';
  if (lower.includes('pitch') || lower.includes('innov') || lower.includes('concept') || lower.includes('design')) return 'lightbulb';
  if (lower.includes('race') || lower.includes('speed') || lower.includes('line')) return 'zap';
  if (lower.includes('soccer') || lower.includes('football') || lower.includes('combat') || lower.includes('fight')) return 'flag';
  return 'compass';
}

function renderChallengeIcon(type: ChallengeConfig['iconType'], className?: string) {
  if (type === 'waves') return <Waves className={className} />;
  if (type === 'lightbulb') return <Lightbulb className={className} />;
  if (type === 'zap') return <Zap className={className} />;
  if (type === 'flag') return <Flag className={className} />;
  return <Compass className={className} />;
}

// Dynamically parse challenges from any uploaded competition
function parseChallengesFromCompetition(comp?: Competition | null): ChallengeConfig[] {
  if (!comp) {
    return [
      { id: 'autonomous_arena', title: 'Autonomous Arena Rounds', weight: 40, iconType: 'compass' },
      { id: 'speed_maneuver', title: 'Speed & Obstacle Navigation', weight: 35, iconType: 'zap' },
      { id: 'technical_pitch', title: 'Engineering & Innovation Pitch', weight: 25, iconType: 'lightbulb' }
    ];
  }

  // 1. Explicit categories array on competition object
  if (Array.isArray((comp as any).categories) && (comp as any).categories.length > 0) {
    const cats: any[] = (comp as any).categories;
    const defaultWt = Math.floor(100 / cats.length);
    return cats.map((c, i) => ({
      id: c.id || `challenge_${i}`,
      title: c.title || c.name || `Challenge ${i + 1}`,
      weight: c.weight_percentage || (i === cats.length - 1 ? 100 - defaultWt * (cats.length - 1) : defaultWt),
      iconType: pickIconType(c.title || c.id || '')
    }));
  }

  // 2. Extract from tags or rules_summary
  const candidates: string[] = [];
  if (Array.isArray(comp.tags)) {
    comp.tags.forEach(t => {
      if (typeof t === 'string') {
        if (t.includes(',')) {
          t.split(',').forEach(sub => {
            const cleaned = sub.trim().replace(/^["']|["']$/g, '');
            if (cleaned.length > 2 && !['Robotics', 'Innovation', 'STEM', 'Flagship'].includes(cleaned)) {
              candidates.push(cleaned);
            }
          });
        } else if (!['Robotics', 'Innovation', 'STEM', 'Flagship'].includes(t.trim())) {
          candidates.push(t.trim());
        }
      }
    });
  }

  if (candidates.length === 0 && comp.rules_summary) {
    if (comp.rules_summary.includes(',')) {
      comp.rules_summary.split(',').forEach(r => {
        const cleaned = r.trim().replace(/^\+.*$/, '').trim();
        if (cleaned.length > 3 && cleaned.length < 40 && !candidates.includes(cleaned)) {
          candidates.push(cleaned);
        }
      });
    }
  }

  if (candidates.length > 0) {
    const top = candidates.slice(0, 4);
    const equalWt = Math.floor(100 / top.length);
    return top.map((title, i) => {
      const formattedTitle = title
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      return {
        id,
        title: formattedTitle,
        weight: i === top.length - 1 ? 100 - equalWt * (top.length - 1) : equalWt,
        iconType: pickIconType(title)
      };
    });
  }

  // 3. Fallback based on category
  if (comp.category === 'underwater_rov') {
    return [
      { id: 'underwater_drone', title: 'Underwater Drone Mission', weight: 40, iconType: 'waves' },
      { id: 'telemetry_buoyancy', title: 'Submerged Course Navigation', weight: 35, iconType: 'compass' },
      { id: 'technical_pitch', title: 'Engineering & Innovation Pitch', weight: 25, iconType: 'lightbulb' }
    ];
  }

  return [
    { id: 'autonomous_rounds', title: 'Autonomous Arena Rounds', weight: 40, iconType: 'compass' },
    { id: 'speed_maneuver', title: 'Speed & Obstacle Navigation', weight: 35, iconType: 'zap' },
    { id: 'technical_pitch', title: 'Engineering & Innovation Pitch', weight: 25, iconType: 'lightbulb' }
  ];
}

export default function LiveResultsScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);

  const [scores, setScores] = useState<DigitalScoreSubmission[]>([]);
  const [scoreSheets, setScoreSheets] = useState<CategoryScoreSheet[]>([]);
  const [teams, setTeams] = useState<UnifiedTeam[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Load Competitions catalog
  useEffect(() => {
    async function init() {
      setLoading(true);
      const allComps = await getCompetitions();
      setCompetitions(allComps);

      const targetId = searchParams.get('id') || searchParams.get('comp');
      if (targetId) {
        const found = allComps.find(c => c.id === targetId || c.slug === targetId);
        if (found) {
          setSelectedComp(found);
        } else if (allComps.length > 0) {
          setSelectedComp(allComps[0]);
        }
      } else if (allComps.length > 0) {
        // Default to featured or active tournament
        const active = allComps.find(c => c.is_featured) || allComps.find(c => c.status === 'active') || allComps[0];
        setSelectedComp(active);
      }
      setLoading(false);
    }
    init();
  }, []);

  // Synchronize teams and scores for the active competition
  const loadData = async () => {
    if (!selectedComp) return;

    try {
      const [sc, sheets] = await Promise.all([
        getDigitalScores(),
        getScoreSheets()
      ]);
      setScores(sc || []);
      setScoreSheets(sheets || []);

      // Load registered teams specifically for this uploaded competition
      const teamList: UnifiedTeam[] = [];

      // 1. Supabase competition_teams
      try {
        const { data, error } = await supabase.from('competition_teams').select('*');
        if (!error && data) {
          data.forEach(t => {
            const isMatch = t.competition_id === selectedComp.id || 
              (t.competition_title && t.competition_title.toLowerCase().trim() === selectedComp.title.toLowerCase().trim());
            if (isMatch) {
              teamList.push({
                id: t.id,
                competition_id: t.competition_id,
                team_name: t.team_name,
                registration_id: t.id ? (t.id.startsWith('YARA-') ? t.id : `TEAM-${t.id.substring(0, 6).toUpperCase()}`) : 'TEAM',
                school_organization: t.school_organization || t.school || 'Community Team',
                province: t.province || 'Harare',
                members_count: Array.isArray(t.members) ? t.members.length : (t.total_members || 4)
              });
            }
          });
        }
      } catch (err) {
        console.warn('DB teams fetch notice:', err);
      }

      // 2. Local storage competition teams
      try {
        const raw = localStorage.getItem('yara_competition_teams') || localStorage.getItem('yaria_competition_teams');
        if (raw) {
          const parsed: any[] = JSON.parse(raw);
          parsed.forEach(t => {
            const isMatch = t.competition_id === selectedComp.id || 
              (t.competition_title && t.competition_title.toLowerCase().trim() === selectedComp.title.toLowerCase().trim());
            if (isMatch && !teamList.some(item => item.id === t.id)) {
              teamList.push({
                id: t.id,
                competition_id: t.competition_id,
                team_name: t.team_name,
                registration_id: t.id ? (t.id.startsWith('YARA-') ? t.id : `TEAM-${t.id.substring(0, 6).toUpperCase()}`) : 'TEAM',
                school_organization: t.school_organization || 'Community Team',
                province: t.province || 'Harare',
                members_count: Array.isArray(t.members) ? t.members.length : 4
              });
            }
          });
        }
      } catch (e) {}

      // 3. Yara competition registrations (if applicable)
      try {
        const { data } = await supabase.from('yara_competition_registrations').select('*');
        if (data) {
          data.forEach(t => {
            const isMatch = (t as any).competition_id === selectedComp.id || selectedComp.slug === 'yara-2026';
            if (isMatch && !teamList.some(item => item.id === t.id)) {
              teamList.push({
                id: t.id,
                competition_id: (t as any).competition_id,
                team_name: t.team_name,
                registration_id: t.registration_id,
                school_organization: t.school_organization,
                province: t.province,
                members_count: Array.isArray(t.members) ? t.members.length : 4
              });
            }
          });
        }
      } catch (e) {}

      setTeams(teamList);
      setLastUpdated(new Date());
    } catch (e) {
      console.warn('Live data sync notice:', e);
    }
  };

  useEffect(() => {
    if (selectedComp) {
      loadData();
      const interval = setInterval(loadData, 10000); // auto refresh every 10s
      return () => clearInterval(interval);
    }
  }, [selectedComp]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.log(e));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(e => console.log(e));
      }
      setIsFullscreen(false);
    }
  };

  // Dynamically configured challenges for current tournament
  const challenges = useMemo(() => {
    return parseChallengesFromCompetition(selectedComp);
  }, [selectedComp]);

  // Extract score for a specific team and challenge ID
  const getTeamChallengeScore = (teamId: string, regId: string, challengeId: string): number | null => {
    const dig = scores.find(s => 
      (s.team_id === teamId || s.team_id === regId) && 
      (s.category === challengeId || (s as any).challenge_id === challengeId)
    );
    if (dig && typeof dig.total_score === 'number') {
      return dig.total_score;
    }

    const sheet = scoreSheets.find(s => 
      (s.team_id === teamId || s.registration_id === regId) && 
      (s.category === challengeId || (s as any).challenge_id === challengeId)
    );
    if (sheet && typeof sheet.final_category_score === 'number') {
      return sheet.final_category_score;
    }

    return null;
  };

  // Compute Grand Championship Leaderboard strictly from uploaded scores
  const grandLeaderboard = useMemo(() => {
    return teams.map(team => {
      let weightedSum = 0;
      let hasAnyScore = false;
      let completedChallenges = 0;

      const challengeScores: Record<string, number | null> = {};

      challenges.forEach(ch => {
        const s = getTeamChallengeScore(team.id, team.registration_id, ch.id);
        challengeScores[ch.id] = s;
        if (s !== null) {
          hasAnyScore = true;
          completedChallenges++;
          weightedSum += s * (ch.weight / 100);
        }
      });

      const grandTotal = hasAnyScore ? Math.round(weightedSum) : null;

      return {
        team_id: team.id,
        team_name: team.team_name,
        registration_id: team.registration_id,
        school: team.school_organization,
        province: team.province,
        members_count: team.members_count,
        challengeScores,
        hasAnyScore,
        completedChallenges,
        grandTotal
      };
    }).sort((a, b) => {
      if (a.hasAnyScore && !b.hasAnyScore) return -1;
      if (!a.hasAnyScore && b.hasAnyScore) return 1;
      if (a.hasAnyScore && b.hasAnyScore) {
        return (b.grandTotal ?? 0) - (a.grandTotal ?? 0);
      }
      return a.team_name.localeCompare(b.team_name);
    });
  }, [teams, challenges, scores, scoreSheets]);

  // Grand champion is ONLY declared if there are real competition trial scores uploaded
  const grandChampion = grandLeaderboard.find(t => t.hasAnyScore && t.grandTotal !== null);

  if (loading && !selectedComp) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 pb-16 ${isFullscreen ? 'p-8 bg-slate-950 min-h-screen text-white' : ''}`}>
      {/* 1. ARENA LIVE BROADCAST HEADER (DYNAMICALLY FROM UPLOADED COMPETITION) */}
      <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="px-3.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider">
                LIVE ARENA BROADCAST FEED
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Auto-syncing every 10s • Last: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
              {selectedComp ? selectedComp.title : 'Official Robotics Championship Arena'}
            </h1>

            {selectedComp && (
              <div className="space-y-1">
                {(selectedComp.theme || selectedComp.subtitle || selectedComp.description) && (
                  <p className="text-amber-400 text-sm font-bold">
                    Theme: “{selectedComp.theme || selectedComp.subtitle || selectedComp.description}”
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  {(selectedComp.location || selectedComp.venue) && (
                    <span className="flex items-center space-x-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{selectedComp.location || selectedComp.venue}</span>
                    </span>
                  )}
                  {selectedComp.start_date && (
                    <span className="flex items-center space-x-1.5 font-medium text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Tournament Date: {new Date(selectedComp.start_date).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Screen Controls & Tournament Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {competitions.length > 1 && (
              <div className="relative">
                <select
                  value={selectedComp?.id || ''}
                  onChange={e => {
                    const found = competitions.find(c => c.id === e.target.value);
                    if (found) {
                      setSelectedComp(found);
                      setSearchParams({ id: found.id });
                    }
                  }}
                  className="px-4 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-2xl text-xs font-bold focus:outline-none focus:border-amber-400 pr-8 cursor-pointer shadow-md"
                >
                  {competitions.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={loadData}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white text-xs font-bold flex items-center space-x-2 cursor-pointer transition"
              title="Refresh Leaderboard"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg cursor-pointer transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isFullscreen ? 'Exit Stage Mode' : 'Projector / Fullscreen'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. GRAND CHAMPION SHOWCASE BANNER OR AWAITING SCORES BANNER */}
      {grandChampion ? (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-amber-300">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3.5 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-widest inline-block shadow-sm">
              🏆 PROJECTED OVERALL GRAND CHAMPION
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {grandChampion.team_name}
            </h2>
            <p className="text-sm font-bold text-slate-900">
              {grandChampion.school} • {grandChampion.province} Province
            </p>
          </div>

          <div className="text-center bg-slate-950 text-white p-5 rounded-2xl border border-amber-400/40 shadow-xl">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block">
              Grand Weighted Score
            </span>
            <span className="text-5xl font-black font-mono text-white">
              {grandChampion.grandTotal}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">out of 100 max</span>
          </div>
        </div>
      ) : (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="px-3 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-black uppercase tracking-widest inline-block mb-1">
                Official Live Standings
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Awaiting Arena Trial Scores {selectedComp ? `• ${selectedComp.title}` : ''}
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Official scores will be displayed here in real time as judges record and upload trial evaluations for {challenges.map(c => c.title).join(', ')}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center px-6 py-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Registered Teams
              </span>
              <span className="text-3xl font-black font-mono text-amber-400">
                {teams.length}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Ready on Roster</span>
            </div>
            {selectedComp && (
              <Link
                to={`/competitions?register=${selectedComp.id}`}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl transition flex items-center space-x-1.5 shadow-md"
              >
                <Users className="w-4 h-4" />
                <span>Register Team</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 3. DYNAMIC LIVE CHALLENGE LEADERBOARDS (DERIVED FROM UPLOADED TOURNAMENT) */}
      <div className={`grid grid-cols-1 ${challenges.length === 2 ? 'md:grid-cols-2' : challenges.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
        {challenges.map(ch => {
          const rankings = teams
            .map(t => ({
              id: t.id,
              team_name: t.team_name,
              score: getTeamChallengeScore(t.id, t.registration_id, ch.id)
            }))
            .filter(t => t.score !== null)
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

          return (
            <div key={ch.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                    {renderChallengeIcon(ch.iconType, "w-4 h-4")}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 truncate" title={ch.title}>
                    {ch.title}
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0">
                  {ch.weight}% Wt
                </span>
              </div>

              <div className="space-y-2.5">
                {rankings.length > 0 ? (
                  rankings.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-2xl flex items-center justify-between border ${
                        idx === 0
                          ? 'bg-amber-50 border-amber-300 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold truncate">{entry.team_name}</span>
                      </div>
                      <span className="text-base font-black font-mono text-slate-900 ml-2 shrink-0">
                        {entry.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Awaiting {ch.title.toLowerCase()} trials...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. FULL CHAMPIONSHIP STANDINGS TABLE (DYNAMIC CHALLENGE COLUMNS) */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Full Grand Championship Standings ({selectedComp ? selectedComp.title : 'All Teams'})</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">
            Weighting Formula: {challenges.map(c => `${c.weight}% ${c.title}`).join(' + ')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Team Name</th>
                <th className="py-3 px-3">School / Province</th>
                {challenges.map(ch => (
                  <th key={ch.id} className="py-3 px-3 text-center">
                    {ch.title} ({ch.weight}%)
                  </th>
                ))}
                <th className="py-3 px-3 text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grandLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4 + challenges.length} className="py-12 text-center text-slate-400 text-xs">
                    <p className="font-semibold text-slate-600 mb-1">
                      No registered competition teams found for {selectedComp ? selectedComp.title : 'this tournament'}.
                    </p>
                    <p className="text-slate-400 text-[11px] mb-4">
                      Teams registered on the platform will appear automatically on this live arena broadcast.
                    </p>
                    {selectedComp && (
                      <Link
                        to={`/competitions?register=${selectedComp.id}`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 shadow transition"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Register a Team Now</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                grandLeaderboard.map((team, idx) => (
                  <tr key={team.team_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold">
                      {team.hasAnyScore ? (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' :
                          idx === 1 ? 'bg-slate-300 text-slate-900' :
                          idx === 2 ? 'bg-amber-200 text-amber-950' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          #{idx + 1}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {team.team_name}
                      <span className="block text-[10px] text-slate-400 font-mono">{team.registration_id}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {team.school}
                      <span className="block text-[10px] text-slate-400">{team.province}</span>
                    </td>
                    {challenges.map(ch => {
                      const score = team.challengeScores[ch.id];
                      return (
                        <td key={ch.id} className="py-3 px-3 text-center">
                          {score !== null ? (
                            <span className="font-mono text-indigo-700 font-bold">{score}</span>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-right">
                      {team.grandTotal !== null ? (
                        <span className="font-mono font-black text-sm text-slate-900">
                          {team.grandTotal} / 100
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">Awaiting Trials</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
