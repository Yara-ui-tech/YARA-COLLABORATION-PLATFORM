import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Medal, Award, Crown, Waves, Compass, Lightbulb, 
  Search, ShieldCheck, Sparkles, Filter, Layers, CheckCircle2, UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChampionshipTeamStanding } from '../../types/yaraCompetition';
import { computeChampionshipStandings } from '../../services/yaraCompetitionService';
import { COMPETITION_AWARDS } from '../../constants/yaraCompetitionData';

interface CompetitionLeaderboardProps {
  isPublished?: boolean;
}

export default function CompetitionLeaderboard({ isPublished = true }: CompetitionLeaderboardProps) {
  const [standings, setStandings] = useState<ChampionshipTeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overall' | 'underwater_drone' | 'autonomous_maze' | 'innovation_pitch' | 'awards'>('overall');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      const data = await computeChampionshipStandings();
      setStandings(data);
      setLoading(false);
    };
    fetchStandings();
  }, []);

  const filteredStandings = standings.filter(s => {
    const matchesSearch = 
      s.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.school_organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.province.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'overall') return true;
    if (activeTab === 'underwater_drone') return s.selected_categories.includes('underwater_drone');
    if (activeTab === 'autonomous_maze') return s.selected_categories.includes('autonomous_maze');
    if (activeTab === 'innovation_pitch') return s.selected_categories.includes('innovation_pitch');
    return true;
  });

  // Calculate sorted rankings depending on category
  const sortedStandings = [...filteredStandings].sort((a, b) => {
    if (activeTab === 'underwater_drone') {
      return (b.underwater_score || 0) - (a.underwater_score || 0);
    }
    if (activeTab === 'autonomous_maze') {
      return (b.maze_score || 0) - (a.maze_score || 0);
    }
    if (activeTab === 'innovation_pitch') {
      return (b.pitch_score || 0) - (a.pitch_score || 0);
    }
    return b.overall_championship_score - a.overall_championship_score;
  });

  if (!isPublished) {
    return (
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Trophy className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Leaderboard Scoring in Progress</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Judges are currently recording scores across the arena mission tanks and pitch sessions. Standings will be published by the YARA Technical Committee.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overall' as const, label: '🏆 Overall Championship (35/35/30)', icon: Crown },
            { id: 'underwater_drone' as const, label: '🌊 Underwater Drone', icon: Waves },
            { id: 'autonomous_maze' as const, label: '⚡ Autonomous Maze', icon: Compass },
            { id: 'innovation_pitch' as const, label: '💡 Innovation Pitch', icon: Lightbulb },
            { id: 'awards' as const, label: '🎖️ Special Awards', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2",
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search teams or schools..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* AWARDS DIRECTORY TAB */}
      {activeTab === 'awards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMPETITION_AWARDS.map(award => (
            <div key={award.title} className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{award.badge}</span>
                <h4 className="font-bold text-sm text-slate-900">{award.title}</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{award.description}</p>
            </div>
          ))}
        </div>
      ) : (
        /* LEADERBOARD TABLE */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Team & School</th>
                  <th className="py-3.5 px-4">Province</th>
                  {activeTab === 'overall' && (
                    <>
                      <th className="py-3.5 px-3 text-center">Underwater (35%)</th>
                      <th className="py-3.5 px-3 text-center">Maze (35%)</th>
                      <th className="py-3.5 px-3 text-center">Pitch (30%)</th>
                      <th className="py-3.5 px-4 text-right">Grand Total</th>
                    </>
                  )}
                  {activeTab === 'underwater_drone' && (
                    <th className="py-3.5 px-4 text-right">Underwater Score (/100)</th>
                  )}
                  {activeTab === 'autonomous_maze' && (
                    <th className="py-3.5 px-4 text-right">Maze Score (/100)</th>
                  )}
                  {activeTab === 'innovation_pitch' && (
                    <th className="py-3.5 px-4 text-right">Pitch Score (/100)</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStandings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No registered teams found matching your query.
                    </td>
                  </tr>
                ) : (
                  sortedStandings.map((team, idx) => {
                    const rank = idx + 1;
                    return (
                      <tr key={team.team_id} className={cn("hover:bg-slate-50/80 transition-colors", rank === 1 ? "bg-amber-50/30" : "")}>
                        <td className="py-3.5 px-4 text-center font-bold">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black shadow-sm">
                              1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black">
                              2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/30 text-amber-900 font-black">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-500">{rank}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{team.team_name}</div>
                          <div className="text-[11px] text-slate-500">{team.school_organization}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">{team.province}</td>

                        {activeTab === 'overall' && (
                          <>
                            <td className="py-3.5 px-3 text-center font-mono">
                              {team.underwater_score !== undefined ? `${team.underwater_score}` : '—'}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono">
                              {team.maze_score !== undefined ? `${team.maze_score}` : '—'}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono">
                              {team.pitch_score !== undefined ? `${team.pitch_score}` : '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black font-mono text-xs">
                                {team.overall_championship_score} pts
                              </span>
                            </td>
                          </>
                        )}

                        {activeTab === 'underwater_drone' && (
                          <td className="py-3.5 px-4 text-right font-black font-mono text-blue-700">
                            {team.underwater_score !== undefined ? `${team.underwater_score} / 100` : 'Not Entered'}
                          </td>
                        )}

                        {activeTab === 'autonomous_maze' && (
                          <td className="py-3.5 px-4 text-right font-black font-mono text-amber-700">
                            {team.maze_score !== undefined ? `${team.maze_score} / 100` : 'Not Entered'}
                          </td>
                        )}

                        {activeTab === 'innovation_pitch' && (
                          <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-700">
                            {team.pitch_score !== undefined ? `${team.pitch_score} / 100` : 'Not Entered'}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
