import React, { useState, useEffect } from 'react';
import { Trophy, School, MapPin, Search, Filter, ShieldCheck, Users, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CompetitionTeam } from '../../types/competition';
import { getRegistrations } from '../../services/yaraCompetitionService';

interface PublicTeamsListProps {
  competitionId?: string;
  onRegisterClick?: () => void;
}

export default function PublicTeamsList({ competitionId, onRegisterClick }: PublicTeamsListProps) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');

  useEffect(() => {
    fetchTeams();
  }, [competitionId]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      // 1. Fetch YARA 2026 teams
      const yaraRegistrations = await getRegistrations();
      const mappedYara = yaraRegistrations.map(r => ({
        id: r.id,
        registration_id: r.registration_id,
        team_name: r.team_name,
        school_organization: r.school_organization,
        province: r.province,
        district: r.district,
        competition_title: 'YARA Educational Robotics Competition 2026',
        competition_category: r.selected_categories.join(', '),
        status: r.status,
        created_at: r.created_at,
        boys_count: r.boys_count,
        girls_count: r.girls_count,
        total_members: r.total_members
      }));

      // 2. Fetch generic competition_teams table
      let query = supabase
        .from('competition_teams')
        .select('id, competition_id, competition_title, competition_category, team_name, school_organization, province, status, created_at')
        .order('created_at', { ascending: false });

      if (competitionId) {
        query = query.eq('competition_id', competitionId);
      }

      const { data } = await query;
      const combined = [...mappedYara, ...(data || [])];
      
      // Deduplicate by team_name + school
      const seen = new Set();
      const unique = combined.filter(item => {
        const key = `${item.team_name}-${item.school_organization}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setTeams(unique);
    } catch (e) {
      console.warn('Error fetching public teams:', e);
      const yaraRegistrations = await getRegistrations();
      setTeams(yaraRegistrations);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = 
      team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.school_organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.competition_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = selectedProvince === 'All' || team.province === selectedProvince;
    return matchesSearch && matchesProvince;
  });

  const provinces = ['All', ...Array.from(new Set(teams.map(t => t.province).filter(Boolean)))];

  return (
    <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-xl shadow-indigo-50/40 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
            <Trophy className="w-4 h-4" />
            <span>Public Registered Teams</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Registered Contender Teams
          </h3>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Public registry of qualified student cohorts competing across national & regional challenges.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 w-48 md:w-56"
            />
          </div>

          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            {provinces.map(p => (
              <option key={p} value={p}>{p === 'All' ? 'All Provinces' : p}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-medium">
          Loading contenders...
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-bold text-sm">No Registered Teams Found</p>
          <p className="text-slate-400 text-xs mt-1 mb-4">Be the first to register a qualified team (minimum 2 boys & 2 girls)!</p>
          {onRegisterClick && (
            <button
              onClick={onRegisterClick}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Team Now</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-3.5">Team Name</th>
                <th className="px-6 py-3.5">School / Organization</th>
                <th className="px-6 py-3.5">Competition Category</th>
                <th className="px-6 py-3.5">Province</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0">
                        {team.team_name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{team.team_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      <span>{team.school_organization}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                      {team.competition_category || 'Robotics & STEM'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{team.province}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {team.status === 'approved' ? 'Approved Entry' : 'Registered'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
