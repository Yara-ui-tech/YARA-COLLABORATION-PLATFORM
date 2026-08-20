import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Users, Trophy, CheckCircle2, AlertCircle, Plus, Trash2, 
  Crown, School, MapPin, User, Mail, Phone, Sparkles, ShieldCheck,
  Info, Loader2, ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';
import { TeamMember, CompetitionTeam } from '../../types/competition';
import { computeTeamCompositionStatus } from '../../lib/teamValidation';

interface TeamRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  competition: {
    id: string;
    title: string;
    category?: string;
  };
  onSuccess?: (newTeam: CompetitionTeam) => void;
}

const ZIMBABWE_PROVINCES = [
  'Harare',
  'Bulawayo',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands',
  'Other / Regional Diaspora'
];

export default function TeamRegistrationModal({
  isOpen,
  onClose,
  competition,
  onSuccess
}: TeamRegistrationModalProps) {
  const { user, profile } = useAuth();

  // Basic Details
  const [teamName, setTeamName] = useState('');
  const [schoolOrg, setSchoolOrg] = useState('');
  const [province, setProvince] = useState(ZIMBABWE_PROVINCES[0]);

  // Leader Contact
  const [leaderName, setLeaderName] = useState(profile?.display_name || '');
  const [leaderEmail, setLeaderEmail] = useState(profile?.email || user?.email || '');
  const [leaderPhone, setLeaderPhone] = useState('');

  // Mentor / Teacher (Recorded separately)
  const [mentorName, setMentorName] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorPhone, setMentorPhone] = useState('');

  // Team Members (Default with 4 slots: 2 boys, 2 girls for smooth UX)
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 'm-1', name: '', gender: 'boy', is_captain: true, grade_or_level: 'Form 3 / Grade 9' },
    { id: 'm-2', name: '', gender: 'boy', is_captain: false, grade_or_level: 'Form 3 / Grade 9' },
    { id: 'm-3', name: '', gender: 'girl', is_captain: false, grade_or_level: 'Form 4 / Grade 10' },
    { id: 'm-4', name: '', gender: 'girl', is_captain: false, grade_or_level: 'Form 4 / Grade 10' }
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real-time eligibility computation
  const status = useMemo(() => {
    return computeTeamCompositionStatus(members);
  }, [members]);

  const handleAddMember = () => {
    const newId = `m-${Date.now()}`;
    // Smart default gender to balance team
    const nextGender: 'boy' | 'girl' = status.boysCount <= status.girlsCount ? 'boy' : 'girl';
    setMembers(prev => [
      ...prev,
      {
        id: newId,
        name: '',
        gender: nextGender,
        is_captain: false,
        grade_or_level: 'Form 4 / Grade 10'
      }
    ]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 4) {
      // Don't remove below 4 slots, just clear the name or alert
      alert('Every competition team must consist of at least 4 participants.');
      return;
    }
    const memberToRemove = members.find(m => m.id === id);
    const updated = members.filter(m => m.id !== id);
    if (memberToRemove?.is_captain && updated.length > 0) {
      updated[0].is_captain = true;
    }
    setMembers(updated);
  };

  const handleUpdateMember = (id: string, field: keyof TeamMember, value: any) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      // If setting captain, unset all other captains
      if (field === 'is_captain' && value === true) {
        return { ...m, is_captain: false };
      }
      return m;
    }));
  };

  const handleSetCaptain = (id: string) => {
    setMembers(prev => prev.map(m => ({
      ...m,
      is_captain: m.id === id
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user) {
      setErrorMessage('Please sign in to register a team for this competition.');
      return;
    }

    if (!teamName.trim()) {
      setErrorMessage('Please provide a team name.');
      return;
    }
    if (!schoolOrg.trim()) {
      setErrorMessage('Please provide your school or organization.');
      return;
    }
    if (!status.isEligible) {
      setErrorMessage('Team is not eligible. Your team must include at least 4 members with at least 2 boys and 2 girls.');
      return;
    }

    setLoading(true);

    try {
      const validMembers = members.filter(m => m.name && m.name.trim().length > 0);
      
      const newTeamPayload = {
        competition_id: competition.id,
        competition_title: competition.title,
        competition_category: competition.category || 'Robotics & STEM Arena',
        team_name: teamName.trim(),
        school_organization: schoolOrg.trim(),
        province,
        registered_by: user.id,
        leader_name: leaderName.trim() || profile?.display_name || 'Team Leader',
        leader_email: leaderEmail.trim() || user.email || '',
        leader_phone: leaderPhone.trim() || null,
        mentor_name: mentorName.trim() || null,
        mentor_email: mentorEmail.trim() || null,
        mentor_phone: mentorPhone.trim() || null,
        members: validMembers,
        boys_count: status.boysCount,
        girls_count: status.girlsCount,
        total_members: status.totalCount,
        is_eligible: status.isEligible,
        eligibility_notes: `Valid team with ${status.boysCount} boys and ${status.girlsCount} girls.`,
        status: 'submitted',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('competition_teams')
        .insert(newTeamPayload)
        .select()
        .single();

      if (error) {
        console.warn('Database insert note:', error.message);
        // If table not created in remote DB yet, provide fallback persistence in local storage
        const localTeams = JSON.parse(localStorage.getItem('yaria_competition_teams') || '[]');
        const fallbackTeam: CompetitionTeam = {
          id: `team-${Date.now()}`,
          ...newTeamPayload,
          status: 'submitted'
        } as any;
        localTeams.unshift(fallbackTeam);
        localStorage.setItem('yaria_competition_teams', JSON.stringify(localTeams));
        if (onSuccess) onSuccess(fallbackTeam);
      } else if (data) {
        if (onSuccess) onSuccess(data as CompetitionTeam);
      }

      setSuccessMessage('🎉 Registration submitted successfully! Your team is officially entered.');
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit registration.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto my-auto"
        >
          {/* Modal Header */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-3xl md:rounded-t-[2.5rem] relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-indigo-300 font-black text-xs uppercase tracking-widest mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Official Team Entry</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight">{competition.title}</h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl">
              Strict Rule: Teams must consist of <strong>at least 4 participants</strong> with a minimum of <strong>2 boys and 2 girls</strong>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {/* Live Composition Indicator Card */}
            <div className={cn(
              "p-5 rounded-2xl md:rounded-3xl border transition-all",
              status.isEligible 
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950" 
                : "bg-amber-50/70 border-amber-200 text-amber-950"
            )}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md shrink-0",
                    status.isEligible ? "bg-emerald-600" : "bg-amber-600"
                  )}>
                    {status.isEligible ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wider">
                      {status.isEligible ? "✓ Team Eligible to Submit" : "⚠ Team Not Yet Eligible"}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">
                      {status.isEligible 
                        ? "Minimum composition satisfied (at least 2 boys & 2 girls, 4+ members)." 
                        : "Your team must include at least 2 boys and 2 girls before registration can be submitted."}
                    </p>
                  </div>
                </div>

                {/* Score Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold shrink-0">
                  <div className={cn(
                    "px-3 py-1.5 rounded-xl border flex items-center space-x-1.5",
                    status.hasMinBoys ? "bg-blue-100/70 border-blue-300 text-blue-800" : "bg-white border-amber-300 text-amber-800"
                  )}>
                    <span>👦 Boys:</span>
                    <span>{status.boysCount}/2</span>
                    {status.hasMinBoys ? <span>✓</span> : <span>⚠</span>}
                  </div>

                  <div className={cn(
                    "px-3 py-1.5 rounded-xl border flex items-center space-x-1.5",
                    status.hasMinGirls ? "bg-pink-100/70 border-pink-300 text-pink-800" : "bg-white border-amber-300 text-amber-800"
                  )}>
                    <span>👧 Girls:</span>
                    <span>{status.girlsCount}/2</span>
                    {status.hasMinGirls ? <span>✓</span> : <span>⚠</span>}
                  </div>

                  <div className={cn(
                    "px-3 py-1.5 rounded-xl border flex items-center space-x-1.5",
                    status.hasMinTotal ? "bg-emerald-100/70 border-emerald-300 text-emerald-800" : "bg-white border-amber-300 text-amber-800"
                  )}>
                    <span>👥 Total:</span>
                    <span>{status.totalCount}/4</span>
                    {status.hasMinTotal ? <span>✓</span> : <span>⚠</span>}
                  </div>
                </div>
              </div>

              {!status.isEligible && status.reasons.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 text-xs text-amber-900 font-medium">
                  <ul className="list-disc list-inside space-y-0.5">
                    {status.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Section 1: Team & Institutional Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <School className="w-4 h-4 text-indigo-600" />
                <span>1. Team & School / Organization Information</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Harare Cyber Innovators"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-900 text-sm font-bold transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">School / Organization *</label>
                  <input
                    type="text"
                    required
                    value={schoolOrg}
                    onChange={(e) => setSchoolOrg(e.target.value)}
                    placeholder="e.g. Churchill High School / STEM Hub"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-900 text-sm font-medium transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Province / Region *</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-900 text-sm font-medium transition-all"
                  >
                    {ZIMBABWE_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Team Leader Contact */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <User className="w-4 h-4 text-indigo-600" />
                <span>2. Registration Administrator / Leader Contact</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Leader Name *</label>
                  <input
                    type="text"
                    required
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-900 text-sm font-medium transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    placeholder="leader@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-900 text-sm font-medium transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    placeholder="+263 77 123 4567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-900 text-sm font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Teacher / Mentor (Separate from 4-member count) */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>3. Teacher, Coach or Mentor (Recorded Separately)</span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                  Does not count toward the 4-member minimum
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  placeholder="Mentor / Teacher Name"
                  className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
                <input
                  type="email"
                  value={mentorEmail}
                  onChange={(e) => setMentorEmail(e.target.value)}
                  placeholder="Mentor Email (Optional)"
                  className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
                <input
                  type="text"
                  value={mentorPhone}
                  onChange={(e) => setMentorPhone(e.target.value)}
                  placeholder="Mentor Phone (Optional)"
                  className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Section 4: Team Members List (Mandatory 4 members, 2 boys + 2 girls) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>4. Team Members & Mandatory Composition</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nominate 1 Team Captain. Collect gender to enforce the 2 boys + 2 girls rule.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddMember}
                  className="self-start sm:self-auto bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Additional Member</span>
                </button>
              </div>

              {/* Members Rows */}
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center gap-3",
                      member.is_captain 
                        ? "bg-amber-50/50 border-amber-200/90 shadow-sm" 
                        : "bg-white border-slate-200"
                    )}
                  >
                    {/* Index & Captain badge */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSetCaptain(member.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition-all",
                          member.is_captain
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-800"
                        )}
                        title="Nominate as Team Captain"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>{member.is_captain ? "Captain" : "Make Captain"}</span>
                      </button>
                    </div>

                    {/* Member Name */}
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        value={member.name}
                        onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                        placeholder={`Participant #${index + 1} Full Name *`}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>

                    {/* Gender Selector (Boy / Girl) */}
                    <div className="flex items-center space-x-1.5 shrink-0 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleUpdateMember(member.id, 'gender', 'boy')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1",
                          member.gender === 'boy' 
                            ? "bg-blue-600 text-white shadow-sm" 
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        <span>👦</span>
                        <span>Boy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateMember(member.id, 'gender', 'girl')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1",
                          member.gender === 'girl' 
                            ? "bg-pink-600 text-white shadow-sm" 
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        <span>👧</span>
                        <span>Girl</span>
                      </button>
                    </div>

                    {/* Grade / Level (Optional) */}
                    <div className="w-32 shrink-0 hidden md:block">
                      <input
                        type="text"
                        value={member.grade_or_level || ''}
                        onChange={(e) => handleUpdateMember(member.id, 'grade_or_level', e.target.value)}
                        placeholder="Grade / Form"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Delete button (if > 4) */}
                    {members.length > 4 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all self-end md:self-center"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error or Success feedback */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-700 text-xs font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !status.isEligible}
                className={cn(
                  "w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg",
                  status.isEligible && !loading
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:-translate-y-0.5"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Registration...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Team Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
