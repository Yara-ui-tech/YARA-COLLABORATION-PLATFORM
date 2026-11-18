import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Waves, Compass, Lightbulb, 
  Maximize2, Minimize2, RefreshCw, Award, ShieldCheck, Flame, AlertCircle, Sparkles
} from 'lucide-react';
import { getDigitalScores } from '../../services/competitionEcosystemService';
import { getRegistrations, getScoreSheets } from '../../services/yaraCompetitionService';
import { DigitalScoreSubmission } from '../../types/competitionEcosystem';
import { YaraCompetitionRegistration, CategoryScoreSheet } from '../../types/yaraCompetition';
import { ASSETS } from '../../constants/assets';

export default function LiveResultsScreen() {
  const [scores, setScores] = useState<DigitalScoreSubmission[]>([]);
  const [scoreSheets, setScoreSheets] = useState<CategoryScoreSheet[]>([]);
  const [teams, setTeams] = useState<YaraCompetitionRegistration[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeChallengeView, setActiveChallengeView] = useState<'all' | 'underwater' | 'maze' | 'pitch'>('all');

  const loadData = async () => {
    const [sc, tm, sheets] = await Promise.all([
      getDigitalScores(),
      getRegistrations(),
      getScoreSheets()
    ]);
    setScores(sc || []);
    setTeams(tm || []);
    setScoreSheets(sheets || []);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // auto refresh every 10s on live stage
    return () => clearInterval(interval);
  }, []);

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

  // Helper to extract official uploaded score for a specific team in a category
  const getTeamCategoryScore = (teamId: string, regId: string, category: 'underwater_drone' | 'autonomous_maze' | 'innovation_pitch'): number | null => {
    // 1. Digital judge score submissions
    const dig = scores.find(s => (s.team_id === teamId || s.team_id === regId) && s.category === category);
    if (dig && typeof dig.total_score === 'number') {
      return dig.total_score;
    }
    // 2. Score sheets submitted
    const sheet = scoreSheets.find(s => (s.team_id === teamId || s.registration_id === regId) && s.category === category);
    if (sheet && typeof sheet.final_category_score === 'number') {
      return sheet.final_category_score;
    }
    return null;
  };

  // Challenge specific rankings: ONLY teams with verified uploaded competition scores
  const getCategoryStandings = (category: 'underwater_drone' | 'autonomous_maze' | 'innovation_pitch') => {
    const standings: { id: string; team_name: string; total_score: number; school?: string; province?: string }[] = [];

    // Registered teams with verified scores
    teams.forEach(team => {
      const score = getTeamCategoryScore(team.id, team.registration_id, category);
      if (score !== null) {
        standings.push({
          id: team.id,
          team_name: team.team_name,
          total_score: score,
          school: team.school_organization,
          province: team.province
        });
      }
    });

    // Also include any digital score submissions where team might be referenced directly
    scores.filter(s => s.category === category).forEach(s => {
      if (!standings.some(item => item.id === s.team_id)) {
        standings.push({
          id: s.team_id || s.id,
          team_name: s.team_name,
          total_score: s.total_score
        });
      }
    });

    return standings.sort((a, b) => b.total_score - a.total_score);
  };

  const underwaterRankings = getCategoryStandings('underwater_drone');
  const mazeRankings = getCategoryStandings('autonomous_maze');
  const pitchRankings = getCategoryStandings('innovation_pitch');

  // Compute Grand Championship Formula (35% Underwater + 35% Maze + 30% Pitch)
  // Strictly calculated ONLY from real competition scores uploaded by judges
  const grandLeaderboard = teams.map(team => {
    const uScore = getTeamCategoryScore(team.id, team.registration_id, 'underwater_drone');
    const mScore = getTeamCategoryScore(team.id, team.registration_id, 'autonomous_maze');
    const pScore = getTeamCategoryScore(team.id, team.registration_id, 'innovation_pitch');

    const hasAnyScore = uScore !== null || mScore !== null || pScore !== null;
    const trialsCompleted = (uScore !== null ? 1 : 0) + (mScore !== null ? 1 : 0) + (pScore !== null ? 1 : 0);

    // Weighted Grand Total from officially scored trials
    const weightedTotal = hasAnyScore
      ? Math.round(((uScore ?? 0) * 0.35) + ((mScore ?? 0) * 0.35) + ((pScore ?? 0) * 0.30))
      : null;

    return {
      team_id: team.id,
      team_name: team.team_name,
      registration_id: team.registration_id,
      school: team.school_organization,
      province: team.province,
      underwaterScore: uScore,
      mazeScore: mScore,
      pitchScore: pScore,
      hasAnyScore,
      trialsCompleted,
      grandTotal: weightedTotal
    };
  }).sort((a, b) => {
    // Teams with uploaded scores rank first, ordered descending by grand total
    if (a.hasAnyScore && !b.hasAnyScore) return -1;
    if (!a.hasAnyScore && b.hasAnyScore) return 1;
    if (a.hasAnyScore && b.hasAnyScore) {
      return (b.grandTotal ?? 0) - (a.grandTotal ?? 0);
    }
    return a.team_name.localeCompare(b.team_name);
  });

  // Grand Champion is ONLY declared if there are real competition trial scores uploaded
  const grandChampion = grandLeaderboard.find(t => t.hasAnyScore && t.grandTotal !== null);

  return (
    <div className={`space-y-8 pb-16 ${isFullscreen ? 'p-8 bg-slate-950 min-h-screen text-white' : ''}`}>
      {/* 1. ARENA LIVE HEADER */}
      <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="px-3.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider">
                LIVE ARENA BROADCAST FEED
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Auto-syncing every 10s • Last: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight flex items-center space-x-3">
              <span>YARA ROBOTICS CHAMPIONSHIP 2026</span>
            </h1>
            <p className="text-amber-400 text-sm font-bold">
              Theme: “Engineering Opportunity: Robotics & Innovation for Underserved Youth”
            </p>
          </div>

          {/* Screen Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white text-xs font-bold flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isFullscreen ? 'Exit Stage Mode' : 'Projector / Fullscreen'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. GRAND CHAMPION SHOWCASE BANNER / AWAITING SCORES BANNER */}
      {grandChampion ? (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-amber-300">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3.5 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-widest inline-block shadow-sm">
              🏆 PROJECTED OVERALL GRAND CHAMPION 2026
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
                Awaiting Arena Trial Scores
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Official scores will be displayed here in real time as judges record and upload trial evaluations for Underwater Drone, Autonomous Maze, and Innovation Pitch.
              </p>
            </div>
          </div>
          <div className="text-center px-6 py-4 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Registered Teams
            </span>
            <span className="text-3xl font-black font-mono text-amber-400">
              {teams.length}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Ready on Roster</span>
          </div>
        </div>
      )}

      {/* 3. 3-COLUMN LIVE CHALLENGE LEADERBOARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Underwater Drone Leaderboard */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Waves className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900">🌊 Underwater Drone</h3>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">35% Wt</span>
          </div>

          <div className="space-y-2.5">
            {underwaterRankings.length > 0 ? (
              underwaterRankings.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-2xl flex items-center justify-between border ${
                    idx === 0
                      ? 'bg-amber-50 border-amber-300 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold truncate">{entry.team_name}</span>
                  </div>
                  <span className="text-base font-black font-mono text-slate-900 ml-2">
                    {entry.total_score}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Awaiting tank trials...</p>
            )}
          </div>
        </div>

        {/* 2. Autonomous Maze Leaderboard */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900">🤖 Autonomous Maze</h3>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">35% Wt</span>
          </div>

          <div className="space-y-2.5">
            {mazeRankings.length > 0 ? (
              mazeRankings.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-2xl flex items-center justify-between border ${
                    idx === 0
                      ? 'bg-amber-50 border-amber-300 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold truncate">{entry.team_name}</span>
                  </div>
                  <span className="text-base font-black font-mono text-slate-900 ml-2">
                    {entry.total_score}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Awaiting maze trials...</p>
            )}
          </div>
        </div>

        {/* 3. Innovation Pitch Leaderboard */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900">💡 Innovation Pitch</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">30% Wt</span>
          </div>

          <div className="space-y-2.5">
            {pitchRankings.length > 0 ? (
              pitchRankings.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-2xl flex items-center justify-between border ${
                    idx === 0
                      ? 'bg-amber-50 border-amber-300 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold truncate">{entry.team_name}</span>
                  </div>
                  <span className="text-base font-black font-mono text-slate-900 ml-2">
                    {entry.total_score}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Awaiting pitch defense...</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. FULL CHAMPIONSHIP STANDINGS TABLE */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Full Grand Championship Standings (All Registered Teams)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Team Name</th>
                <th className="py-3 px-3">School / Province</th>
                <th className="py-3 px-3 text-center">Underwater (35%)</th>
                <th className="py-3 px-3 text-center">Maze (35%)</th>
                <th className="py-3 px-3 text-center">Pitch (30%)</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grandLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No registered competition teams found. Teams will appear here once officially registered.
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
                    <td className="py-3 px-3 text-center">
                      {team.underwaterScore !== null ? (
                        <span className="font-mono text-blue-700 font-bold">{team.underwaterScore}</span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {team.mazeScore !== null ? (
                        <span className="font-mono text-amber-700 font-bold">{team.mazeScore}</span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {team.pitchScore !== null ? (
                        <span className="font-mono text-emerald-700 font-bold">{team.pitchScore}</span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      )}
                    </td>
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
