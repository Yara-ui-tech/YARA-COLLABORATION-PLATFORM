import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Building2, 
  MapPin, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Check, 
  X,
  Crown,
  GraduationCap,
  Filter
} from 'lucide-react';
import { CompetitionTeam, CompetitionTeamMember } from '../../types/competition';
import { evaluateTeamEligibility } from '../../utils/teamValidation';
import { supabase } from '../../lib/supabase';

// Mock initial data in case database is not populated yet
const MOCK_TEAMS: CompetitionTeam[] = [
  {
    id: 'team_01',
    competition_id: 'comp_01',
    team_name: 'Apex Robotics',
    school_organization: 'Soweto STEM Academy',
    category: 'Pan-African Youth Robotics Grand Prix 2026',
    province: 'Gauteng',
    mentor_name: 'Ms. Thandi Ndlovu',
    mentor_email: 'mentor@sowetostem.co.za',
    is_eligible: true,
    status: 'pending',
    members: [
      { full_name: 'Kabo Dlamini', gender: 'boy', is_captain: true },
      { full_name: 'Sipho Zulu', gender: 'boy', is_captain: false },
      { full_name: 'Lerato Molefe', gender: 'girl', is_captain: false },
      { full_name: 'Zinhle Khumalo', gender: 'girl', is_captain: false }
    ]
  },
  {
    id: 'team_02',
    competition_id: 'comp_01',
    team_name: 'Titan Mechanics',
    school_organization: 'East London High',
    category: 'Pan-African Youth Robotics Grand Prix 2026',
    province: 'Eastern Cape',
    mentor_name: 'Mr. Pieter Coetzee',
    mentor_email: 'pieter@eastlondon.edu.za',
    is_eligible: false,
    status: 'pending',
    members: [
      { full_name: 'David Botha', gender: 'boy', is_captain: true },
      { full_name: 'Mark Taylor', gender: 'boy', is_captain: false },
      { full_name: 'Jason Reed', gender: 'boy', is_captain: false },
      { full_name: 'Sarah Jenkins', gender: 'girl', is_captain: false }
    ]
  }
];

export default function TeamAdminTab() {
  const [teams, setTeams] = useState<CompetitionTeam[]>(MOCK_TEAMS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data: teamsData, error: teamsErr } = await supabase
        .from('competition_teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (teamsErr) throw teamsErr;

      if (teamsData && teamsData.length > 0) {
        // Fetch members for each team
        const { data: membersData } = await supabase
          .from('competition_team_members')
          .select('*');

        const populated = teamsData.map(team => {
          const teamMembers = membersData?.filter(m => m.team_id === team.id) || [];
          return {
            ...team,
            members: teamMembers
          };
        });
        setTeams(populated);
      }
    } catch (err) {
      console.error('Error fetching admin competition teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (team: CompetitionTeam, newStatus: 'approved' | 'rejected') => {
    const members = team.members || [];
    const check = evaluateTeamEligibility(members);

    if (newStatus === 'approved' && !check.isEligible) {
      alert(`❌ CANNOT APPROVE TEAM: Team "${team.team_name}" is NOT ELIGIBLE. It requires at least 4 members with a minimum of 2 boys and 2 girls.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('competition_teams')
        .update({ 
          status: newStatus,
          is_eligible: check.isEligible 
        })
        .eq('id', team.id);

      if (error) throw error;

      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: newStatus, is_eligible: check.isEligible } : t));
      alert(`Team "${team.team_name}" status updated to ${newStatus.toUpperCase()}.`);
    } catch (err: any) {
      console.error('Error updating team status:', err);
      alert(err.message || 'Failed to update team status.');
    }
  };

  const filteredTeams = teams.filter(t => {
    const matchesSearch = 
      t.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.school_organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Team Composition & Eligibility Validation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enforce mandatory 4-member minimum (2 boys + 2 girls) registration policies. Ineligible teams are blocked from approval.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search team or school..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {filteredTeams.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            No competition teams registered matching filter.
          </div>
        ) : (
          filteredTeams.map(team => {
            const members = team.members || [];
            const check = evaluateTeamEligibility(members);
            const isExpanded = expandedTeamId === team.id;

            return (
              <div 
                key={team.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg transition hover:border-slate-700"
              >
                {/* Team Header Summary Card */}
                <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    {/* Eligibility Badge */}
                    <div className={`px-3 py-2 rounded-2xl border flex items-center space-x-1.5 font-bold text-xs ${
                      check.isEligible 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                      <span className="text-base">{check.isEligible ? '🟢' : '🔴'}</span>
                      <span>{check.isEligible ? 'Eligible' : 'Not Eligible'}</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-white">{team.team_name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          team.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                          team.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {team.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>{team.school_organization}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-semibold">{team.category}</span>
                        <span>•</span>
                        <span>{team.province}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Actions & Composition Pill */}
                  <div className="flex items-center space-x-3 ml-auto">
                    <div className="text-right hidden md:block text-xs">
                      <div className="font-bold text-slate-300">
                        {check.boysCount} Boys / {check.girlsCount} Girls ({check.totalMembers} total)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {check.isEligible ? 'Meets 2B + 2G rule' : 'Fails composition check'}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition flex items-center space-x-1 text-xs font-bold"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Eligibility Check'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Admin Approval Guards */}
                    {team.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(team, 'approved')}
                        disabled={!check.isEligible}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                          check.isEligible
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                            : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                        }`}
                        title={!check.isEligible ? 'Team must meet 2 boys + 2 girls minimum to be approved' : 'Approve Team'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {team.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(team, 'rejected')}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition border border-rose-500/20 flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Detailed Breakdown Matrix */}
                {isExpanded && (
                  <div className="p-6 bg-slate-950/60 border-t border-slate-800 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Eligibility Audit Checklist */}
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Eligibility Check Breakdown
                        </h4>

                        <div className="space-y-2 text-xs font-semibold">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/60">
                            <span className="text-slate-300">Minimum 4 members:</span>
                            <span className={check.hasMinMembers ? 'text-emerald-400' : 'text-rose-400'}>
                              {check.totalMembers} / 4 {check.hasMinMembers ? '✓' : '✗'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/60">
                            <span className="text-slate-300">Minimum 2 boys:</span>
                            <span className={check.hasMinBoys ? 'text-emerald-400' : 'text-rose-400'}>
                              {check.boysCount} / 2 {check.hasMinBoys ? '✓' : '✗'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/60">
                            <span className="text-slate-300">Minimum 2 girls:</span>
                            <span className={check.hasMinGirls ? 'text-emerald-400' : 'text-rose-400'}>
                              {check.girlsCount} / 2 {check.hasMinGirls ? '✓' : '✗'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30">
                            <span className="text-indigo-200 uppercase font-bold">Overall Eligibility:</span>
                            <span className={`font-black uppercase tracking-wider ${
                              check.isEligible ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {check.isEligible ? 'ELIGIBLE ✓' : 'NOT ELIGIBLE ✗'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mentor / Coach Details */}
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                          <GraduationCap className="w-4 h-4 text-indigo-400" />
                          <span>Mentor / Teacher Information</span>
                        </h4>

                        {team.mentor_name ? (
                          <div className="space-y-1.5 text-slate-300">
                            <p><strong className="text-slate-400">Name:</strong> {team.mentor_name}</p>
                            {team.mentor_email && <p><strong className="text-slate-400">Email:</strong> {team.mentor_email}</p>}
                            {team.mentor_phone && <p><strong className="text-slate-400">Phone:</strong> {team.mentor_phone}</p>}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No mentor recorded for this team.</p>
                        )}
                      </div>
                    </div>

                    {/* Member Roster */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Registered Team Members ({members.length})
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {members.map((m, idx) => (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-2xl border text-xs space-y-1 ${
                              m.is_captain 
                                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' 
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{m.full_name || `Member #${idx + 1}`}</span>
                              {m.is_captain && (
                                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" title="Team Captain" />
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Gender: <strong className="text-slate-200 capitalize">{m.gender}</strong></span>
                              {m.is_captain && <span className="text-amber-400 font-bold">Captain</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
