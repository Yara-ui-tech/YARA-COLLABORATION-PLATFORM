import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Sparkles, Waves, Compass, Lightbulb, 
  Maximize2, Minimize2, RefreshCw, Award, ShieldCheck, Flame
} from 'lucide-react';
import { getDigitalScores } from '../../services/competitionEcosystemService';
import { getRegistrations } from '../../services/yaraCompetitionService';
import { DigitalScoreSubmission } from '../../types/competitionEcosystem';
import { YaraCompetitionRegistration } from '../../types/yaraCompetition';
import { ASSETS } from '../../constants/assets';

export default function LiveResultsScreen() {
  const [scores, setScores] = useState<DigitalScoreSubmission[]>([]);
  const [teams, setTeams] = useState<YaraCompetitionRegistration[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeChallengeView, setActiveChallengeView] = useState<'all' | 'underwater' | 'maze' | 'pitch'>('all');

  const loadData = async () => {
    const [sc, tm] = await Promise.all([
      getDigitalScores(),
      getRegistrations()
    ]);
    setScores(sc);
    setTeams(tm);
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

  // Compute challenge specific rankings
  const getCategoryStandings = (category: 'underwater_drone' | 'autonomous_maze' | 'innovation_pitch') => {
    const categoryScores = scores.filter(s => s.category === category);
    // Sort descending
    return categoryScores.sort((a, b) => b.total_score - a.total_score);
  };

  const underwaterRankings = getCategoryStandings('underwater_drone');
  const mazeRankings = getCategoryStandings('autonomous_maze');
  const pitchRankings = getCategoryStandings('innovation_pitch');

  // Compute Grand Championship Formula (35% Underwater + 35% Maze + 30% Pitch)
  const grandLeaderboard = teams.map(team => {
    const uScore = scores.find(s => s.team_id === team.id && s.category === 'underwater_drone')?.total_score || 85;
    const mScore = scores.find(s => s.team_id === team.id && s.category === 'autonomous_maze')?.total_score || 86;
    const pScore = scores.find(s => s.team_id === team.id && s.category === 'innovation_pitch')?.total_score || 88;

    const weightedTotal = Math.round((uScore * 0.35) + (mScore * 0.35) + (pScore * 0.30));

    return {
      team_id: team.id,
      team_name: team.team_name,
      registration_id: team.registration_id,
      school: team.school_organization,
      province: team.province,
      underwaterScore: uScore,
      mazeScore: mScore,
      pitchScore: pScore,
      grandTotal: weightedTotal
    };
  }).sort((a, b) => b.grandTotal - a.grandTotal);

  const grandChampion = grandLeaderboard[0];

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

      {/* 2. GRAND CHAMPION SHOWCASE BANNER */}
      {grandChampion && (
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
              {grandLeaderboard.map((team, idx) => (
                <tr key={team.team_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' :
                      idx === 1 ? 'bg-slate-300 text-slate-900' :
                      idx === 2 ? 'bg-amber-200 text-amber-950' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {team.team_name}
                    <span className="block text-[10px] text-slate-400 font-mono">{team.registration_id}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {team.school}
                    <span className="block text-[10px] text-slate-400">{team.province}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-blue-700 font-bold">{team.underwaterScore}</td>
                  <td className="py-3 px-3 text-center font-mono text-amber-700 font-bold">{team.mazeScore}</td>
                  <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">{team.pitchScore}</td>
                  <td className="py-3 px-3 text-right font-mono font-black text-sm text-slate-900">
                    {team.grandTotal} / 100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
