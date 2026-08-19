import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Trophy, ShieldCheck, Search, Users } from 'lucide-react';
import { CompetitionTeam } from '../../types/competition';
import { supabase } from '../../lib/supabase';

const INITIAL_PUBLIC_TEAMS: Partial<CompetitionTeam>[] = [
  {
    id: 'team_01',
    team_name: 'RoboKnights SA',
    school_organization: 'Pretoria Technical High',
    category: 'Pan-African Youth Robotics Grand Prix',
    province: 'Gauteng',
    status: 'approved'
  },
  {
    id: 'team_02',
    team_name: 'Cape Innovators',
    school_organization: 'Rondebosch Boys & Girls Tech Club',
    category: 'Autonomous Mobile Rover Circuit Sprint',
    province: 'Western Cape',
    status: 'approved'
  },
  {
    id: 'team_03',
    team_name: 'Durban CyberGrid',
    school_organization: 'KZN Youth Robotics Academy',
    category: 'Smart Agricultural IoT & Drone Hackathon',
    province: 'KwaZulu-Natal',
    status: 'approved'
  }
];

export default function PublicTeamsList() {
  const [teams, setTeams] = useState<Partial<CompetitionTeam>[]>(INITIAL_PUBLIC_TEAMS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('competition_teams')
        .select('id, team_name, school_organization, category, province, status')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setTeams(data);
      }
    } catch (err) {
      console.error('Error fetching public team list:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = 
      team.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.school_organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince = selectedProvince === 'all' || team.province === selectedProvince;
    return matchesSearch && matchesProvince;
  });

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
        <span>
          <strong>Public Privacy Standard:</strong> Only public team credentials (<code className="text-slate-200">Team Name | School/Organization | Category | Province</code>) are displayed below. Personal participant details, emails, and gender profiles are protected.
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search teams or schools..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedProvince}
          onChange={e => setSelectedProvince(e.target.value)}
          className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Provinces</option>
          <option value="Gauteng">Gauteng</option>
          <option value="Western Cape">Western Cape</option>
          <option value="KwaZulu-Natal">KwaZulu-Natal</option>
          <option value="Eastern Cape">Eastern Cape</option>
          <option value="Free State">Free State</option>
          <option value="Limpopo">Limpopo</option>
          <option value="Mpumalanga">Mpumalanga</option>
          <option value="North West">North West</option>
          <option value="Northern Cape">Northern Cape</option>
        </select>
      </div>

      {/* Public Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 font-bold">Team Name</th>
                <th className="py-4 px-6 font-bold">School / Organization</th>
                <th className="py-4 px-6 font-bold">Competition Category</th>
                <th className="py-4 px-6 font-bold">Province</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                    No approved teams match your filter.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team, idx) => (
                  <tr key={team.id || idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6 font-bold text-white flex items-center space-x-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>{team.team_name}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-medium">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span>{team.school_organization}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Trophy className="w-3 h-3 mr-1.5" />
                        {team.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{team.province}</span>
                      </div>
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
