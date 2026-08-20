import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, CheckCircle2, AlertCircle, ShieldCheck, 
  Crown, School, MapPin, Search, Filter, Loader2, ChevronDown, 
  ChevronUp, Trash2, Check, X, MessageSquare, AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { CompetitionTeam, TeamMember } from '../../types/competition';
import { computeTeamCompositionStatus } from '../../lib/teamValidation';

export default function CompetitionTeamsAdminTab() {
  const [teams, setTeams] = useState<CompetitionTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'ineligible'>('all');
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected' | 'pending_revision'>('all');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('competition_teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to local storage
        const localTeams = JSON.parse(localStorage.getItem('yaria_competition_teams') || '[]');
        setTeams(localTeams);
      } else if (data) {
        setTeams(data as CompetitionTeam[]);
      }
    } catch (e) {
      console.warn('Error fetching teams:', e);
      const localTeams = JSON.parse(localStorage.getItem('yaria_competition_teams') || '[]');
      setTeams(localTeams);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (team: CompetitionTeam, newStatus: 'approved' | 'rejected' | 'pending_revision', notes?: string) => {
    const composition = computeTeamCompositionStatus(team.members || []);
    
    // STRICT VALIDATION: Prevent approving ineligible teams!
    if (newStatus === 'approved' && !composition.isEligible) {
      setActionMessage({
        type: 'error',
        text: 'Cannot approve team: The team is NOT ELIGIBLE because it does not meet the mandatory composition (minimum 4 members, 2 boys, and 2 girls).'
      });
      setTimeout(() => setActionMessage(null), 5000);
      return;
    }

    setActionLoadingId(team.id);
    try {
      const { error } = await supabase
        .from('competition_teams')
        .update({
          status: newStatus,
          admin_notes: notes || team.admin_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', team.id);

      if (error) {
        // Fallback to local storage
        const localTeams: CompetitionTeam[] = JSON.parse(localStorage.getItem('yaria_competition_teams') || '[]');
        const updated = localTeams.map(t => t.id === team.id ? { ...t, status: newStatus, admin_notes: notes || t.admin_notes } : t);
        localStorage.setItem('yaria_competition_teams', JSON.stringify(updated));
        setTeams(updated);
      } else {
        setTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: newStatus, admin_notes: notes || t.admin_notes } : t));
      }

      setActionMessage({
        type: 'success',
        text: `Team "${team.team_name}" marked as ${newStatus.toUpperCase()}.`
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to update team status.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team registration?')) return;
    setActionLoadingId(id);
    try {
      const { error } = await supabase.from('competition_teams').delete().eq('id', id);
      if (error) {
        const localTeams: CompetitionTeam[] = JSON.parse(localStorage.getItem('yaria_competition_teams') || '[]');
        const updated = localTeams.filter(t => t.id !== id);
        localStorage.setItem('yaria_competition_teams', JSON.stringify(updated));
        setTeams(updated);
      } else {
        setTeams(prev => prev.filter(t => t.id !== id));
      }
      setActionMessage({ type: 'success', text: 'Team registration removed.' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to delete.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTeams = teams.filter(team => {
    const composition = computeTeamCompositionStatus(team.members || []);
    const matchesSearch = 
      team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.school_organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.province.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEligibility = 
      statusFilter === 'all' ||
      (statusFilter === 'eligible' && composition.isEligible) ||
      (statusFilter === 'ineligible' && !composition.isEligible);

    const matchesApproval = 
      approvalFilter === 'all' || team.status === approvalFilter;

    return matchesSearch && matchesEligibility && matchesApproval;
  });

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
            <Trophy className="w-4 h-4" />
            <span>Team Compliance & Composition Hub</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Competition Teams & Mandatory Composition (2 Boys + 2 Girls)
          </h3>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Strict verification: Every team must have at least 4 participants with at least 2 boys and 2 girls. Ineligible teams cannot be approved.
          </p>
        </div>

        <button
          onClick={fetchTeams}
          disabled={loading}
          className="self-start md:self-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center space-x-2"
        >
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className={cn(
          "p-4 rounded-2xl border flex items-center space-x-3 text-xs font-bold transition-all",
          actionMessage.type === 'success' 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        )}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by team, school, leader or province..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligibility:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="all">All Teams</option>
            <option value="eligible">🟢 Eligible Only (2B + 2G + 4M)</option>
            <option value="ineligible">🔴 Ineligible Only</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="pending_revision">Pending Revision</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Teams List */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-xs font-bold">Loading registered competition teams...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="py-16 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-slate-800 font-bold text-base">No Matching Teams Found</h4>
          <p className="text-slate-400 text-xs mt-1">Adjust your search or filter parameters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeams.map((team) => {
            const composition = computeTeamCompositionStatus(team.members || []);
            const isExpanded = expandedTeamId === team.id;
            const captain = (team.members || []).find(m => m.is_captain);

            return (
              <div
                key={team.id}
                className={cn(
                  "bg-white rounded-2xl md:rounded-3xl border transition-all overflow-hidden",
                  composition.isEligible ? "border-slate-200" : "border-amber-300 shadow-sm shadow-amber-50"
                )}
              >
                {/* Team Card Main Row */}
                <div className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base md:text-lg font-black text-slate-900">{team.team_name}</span>
                      
                      {/* Live Eligibility Tag */}
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center space-x-1.5",
                        composition.isEligible 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                      )}>
                        <span className={cn("w-2 h-2 rounded-full", composition.isEligible ? "bg-emerald-500" : "bg-red-500")} />
                        <span>{composition.isEligible ? "🟢 Eligible" : "🔴 Not Eligible"}</span>
                      </span>

                      {/* Approval Status Tag */}
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                        team.status === 'approved' ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                        team.status === 'pending_revision' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        team.status === 'rejected' ? "bg-red-50 text-red-700 border border-red-200" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {team.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Metadata Subtitle */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                      <div className="flex items-center space-x-1">
                        <School className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700">{team.school_organization}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{team.province}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold text-slate-800">{team.competition_title}</span>
                      </div>
                    </div>

                    {/* Quick Metric Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold border",
                        composition.hasMinBoys ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-red-50 border-red-200 text-red-800"
                      )}>
                        👦 Boys: {composition.boysCount}/2 {composition.hasMinBoys ? "✓" : "✗"}
                      </span>

                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold border",
                        composition.hasMinGirls ? "bg-pink-50 border-pink-200 text-pink-800" : "bg-red-50 border-red-200 text-red-800"
                      )}>
                        👧 Girls: {composition.girlsCount}/2 {composition.hasMinGirls ? "✓" : "✗"}
                      </span>

                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold border",
                        composition.hasMinTotal ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                      )}>
                        👥 Total: {composition.totalCount}/4 {composition.hasMinTotal ? "✓" : "✗"}
                      </span>

                      {captain && (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-800 flex items-center space-x-1">
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span>Captain: {captain.name} ({captain.gender})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Approve Button (Only allowed if isEligible is true) */}
                    <button
                      onClick={() => handleUpdateStatus(team, 'approved')}
                      disabled={actionLoadingId === team.id || !composition.isEligible}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm",
                        composition.isEligible 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      )}
                      title={composition.isEligible ? "Approve this team" : "Cannot approve: Team is not eligible (needs at least 2 boys and 2 girls)"}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{team.status === 'approved' ? 'Approved' : 'Approve Team'}</span>
                    </button>

                    {/* Request Revision */}
                    <button
                      onClick={() => {
                        const note = prompt('Enter revision instructions for team leader:', 'Please update your roster to ensure at least 2 boys and 2 girls.');
                        if (note) handleUpdateStatus(team, 'pending_revision', note);
                      }}
                      disabled={actionLoadingId === team.id}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all flex items-center space-x-1"
                      title="Request team composition revision"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Revision</span>
                    </button>

                    {/* Toggle Expand */}
                    <button
                      onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                      title="View roster & compliance details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      disabled={actionLoadingId === team.id}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete team entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-100 p-6 space-y-6">
                    {/* Detailed Eligibility Checklist */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200">
                      <h5 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Mandatory Composition Compliance Verification</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                        <div className={cn(
                          "p-3 rounded-xl border flex items-center justify-between",
                          composition.hasMinTotal ? "bg-emerald-50/50 border-emerald-200 text-emerald-900" : "bg-red-50/50 border-red-200 text-red-900 font-bold"
                        )}>
                          <span>Minimum 4 Members:</span>
                          <span className="font-bold">{composition.hasMinTotal ? `✓ (${composition.totalCount}/4)` : `✗ (${composition.totalCount}/4)`}</span>
                        </div>

                        <div className={cn(
                          "p-3 rounded-xl border flex items-center justify-between",
                          composition.hasMinBoys ? "bg-emerald-50/50 border-emerald-200 text-emerald-900" : "bg-red-50/50 border-red-200 text-red-900 font-bold"
                        )}>
                          <span>Minimum 2 Boys:</span>
                          <span className="font-bold">{composition.hasMinBoys ? `✓ (${composition.boysCount}/2)` : `✗ (${composition.boysCount}/2)`}</span>
                        </div>

                        <div className={cn(
                          "p-3 rounded-xl border flex items-center justify-between",
                          composition.hasMinGirls ? "bg-emerald-50/50 border-emerald-200 text-emerald-900" : "bg-red-50/50 border-red-200 text-red-900 font-bold"
                        )}>
                          <span>Minimum 2 Girls:</span>
                          <span className="font-bold">{composition.hasMinGirls ? `✓ (${composition.girlsCount}/2)` : `✗ (${composition.girlsCount}/2)`}</span>
                        </div>

                        <div className={cn(
                          "p-3 rounded-xl border flex items-center justify-between",
                          composition.isEligible ? "bg-emerald-600 text-white font-black" : "bg-red-600 text-white font-black"
                        )}>
                          <span>Overall Status:</span>
                          <span>{composition.isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}</span>
                        </div>
                      </div>

                      {!composition.isEligible && composition.reasons.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 font-medium">
                          <strong>Ineligibility Reason(s):</strong>
                          <ul className="list-disc list-inside mt-1 space-y-0.5">
                            {composition.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Contacts: Leader & Mentor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Leader Contact */}
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registration Administrator / Leader</span>
                        <p className="font-bold text-slate-900 text-sm">{team.leader_name}</p>
                        <p className="text-xs text-slate-600">{team.leader_email}</p>
                        {team.leader_phone && <p className="text-xs text-slate-500">Phone: {team.leader_phone}</p>}
                      </div>

                      {/* Mentor / Coach */}
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Mentor / Teacher</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Separate from 4-member count</span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{team.mentor_name || 'No mentor listed'}</p>
                        {team.mentor_email && <p className="text-xs text-slate-600">{team.mentor_email}</p>}
                        {team.mentor_phone && <p className="text-xs text-slate-500">Phone: {team.mentor_phone}</p>}
                      </div>
                    </div>

                    {/* Member Roster */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                      <h5 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Registered Team Members Roster ({team.members?.length || 0} participants)</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(team.members || []).map((m: TeamMember, idx: number) => (
                          <div
                            key={m.id || idx}
                            className={cn(
                              "p-3 rounded-xl border flex items-center justify-between text-xs",
                              m.is_captain ? "bg-amber-50/50 border-amber-200" : "bg-slate-50/70 border-slate-200"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-white text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-200">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-bold text-slate-900 flex items-center space-x-1">
                                  <span>{m.name}</span>
                                  {m.is_captain && (
                                    <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase">
                                      Captain
                                    </span>
                                  )}
                                </p>
                                {m.grade_or_level && (
                                  <p className="text-[11px] text-slate-500">{m.grade_or_level}</p>
                                )}
                              </div>
                            </div>

                            <span className={cn(
                              "px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center space-x-1",
                              m.gender === 'boy' ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                            )}>
                              <span>{m.gender === 'boy' ? '👦 Boy' : '👧 Girl'}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
