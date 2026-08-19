import React, { useState } from 'react';
import { 
  X, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Crown, 
  UserCheck, 
  GraduationCap, 
  Building2, 
  MapPin, 
  Send,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompetitionTeamMember } from '../../types/competition';
import { evaluateTeamEligibility, SOUTH_AFRICAN_PROVINCES, AFRICAN_COUNTRIES } from '../../utils/teamValidation';
import { supabase } from '../../lib/supabase';

interface TeamRegistrationModalProps {
  competitionId: string;
  competitionTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TeamRegistrationModal({
  competitionId,
  competitionTitle,
  isOpen,
  onClose,
  onSuccess
}: TeamRegistrationModalProps) {
  // General Info
  const [teamName, setTeamName] = useState('');
  const [schoolOrg, setSchoolOrg] = useState('');
  const [category, setCategory] = useState('Autonomous Robotics');
  const [country, setCountry] = useState('South Africa');
  const [province, setProvince] = useState(SOUTH_AFRICAN_PROVINCES[2]); // Gauteng default
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');


  // Mentor / Teacher (Excluded from 4-member count)
  const [mentorName, setMentorName] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorPhone, setMentorPhone] = useState('');

  // Team Members
  const [members, setMembers] = useState<CompetitionTeamMember[]>([
    { full_name: '', gender: 'boy', is_captain: true },
    { full_name: '', gender: 'boy', is_captain: false },
    { full_name: '', gender: 'girl', is_captain: false },
    { full_name: '', gender: 'girl', is_captain: false }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const eligibility = evaluateTeamEligibility(members.filter(m => m.full_name.trim() !== ''));

  const handleMemberChange = (index: number, field: keyof CompetitionTeamMember, value: any) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };

    // If setting captain, unset for others
    if (field === 'is_captain' && value === true) {
      updated.forEach((m, idx) => {
        if (idx !== index) m.is_captain = false;
      });
    }
    setMembers(updated);
  };

  const addMember = () => {
    setMembers(prev => [...prev, { full_name: '', gender: 'boy', is_captain: false }]);
  };

  const removeMember = (index: number) => {
    if (members.length <= 4) {
      alert('A minimum of 4 team members must be listed in the registration form.');
      return;
    }
    const wasCaptain = members[index].is_captain;
    const updated = members.filter((_, i) => i !== index);
    if (wasCaptain && updated.length > 0) {
      updated[0].is_captain = true;
    }
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!teamName.trim() || !schoolOrg.trim()) {
      setErrorMsg('Please complete Team Name and School/Organization fields.');
      return;
    }

    const validMembers = members.filter(m => m.full_name.trim() !== '');
    const currentEligibility = evaluateTeamEligibility(validMembers);

    if (!currentEligibility.isEligible) {
      setErrorMsg('Your team must include at least 2 boys and 2 girls across at least 4 members before registration can be submitted.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Insert team
      const { data: teamData, error: teamErr } = await supabase
        .from('competition_teams')
        .insert([{
          competition_id: competitionId,
          team_name: teamName.trim(),
          school_organization: schoolOrg.trim(),
          category,
          country,
          province,
          district: district.trim() || null,
          city: city.trim() || null,
          mentor_name: mentorName.trim() || null,
          mentor_email: mentorEmail.trim() || null,
          mentor_phone: mentorPhone.trim() || null,
          is_eligible: true,
          status: 'pending'
        }])

        .select()
        .single();

      if (teamErr) throw teamErr;

      // 2. Insert members
      const membersToInsert = validMembers.map(m => ({
        team_id: teamData.id,
        full_name: m.full_name.trim(),
        gender: m.gender,
        is_captain: m.is_captain || false
      }));

      const { error: membersErr } = await supabase
        .from('competition_team_members')
        .insert(membersToInsert);

      if (membersErr) throw membersErr;

      alert(`🎉 Team "${teamName}" registered successfully! Your team meets all composition criteria and is pending final admin approval.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error submitting team registration:', err);
      setErrorMsg(err.message || 'Failed to submit team registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Team Registration</h2>
              <p className="text-xs font-medium text-slate-400">{competitionTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Eligibility Status Banner */}
        <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          eligibility.isEligible 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <div>
            <div className="flex items-center space-x-2 font-bold text-sm">
              {eligibility.isEligible ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 uppercase tracking-wide">ELIGIBLE TO CONTINUE</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="text-amber-300 uppercase tracking-wide">Team Not Yet Eligible</span>
                </>
              )}
            </div>
            {!eligibility.isEligible && (
              <p className="text-xs text-amber-200/80 mt-1">
                Your team must include at least 2 boys and 2 girls before registration can be submitted.
              </p>
            )}
          </div>

          {/* Counters */}
          <div className="flex items-center space-x-3 text-xs font-bold">
            <div className={`px-3 py-1.5 rounded-lg border ${
              eligibility.hasMinBoys 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}>
              Boys: {eligibility.boysCount}/2 {eligibility.hasMinBoys ? '✓' : '⚠'}
            </div>
            <div className={`px-3 py-1.5 rounded-lg border ${
              eligibility.hasMinGirls 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}>
              Girls: {eligibility.girlsCount}/2 {eligibility.hasMinGirls ? '✓' : '⚠'}
            </div>
            <div className={`px-3 py-1.5 rounded-lg border ${
              eligibility.hasMinMembers 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}>
              Total: {eligibility.totalMembers}/4 {eligibility.hasMinMembers ? '✓' : '⚠'}
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Team & Location Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Team & Organization Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Team Name *</label>
                <input 
                  type="text" 
                  required 
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. AlgoRhythm Innovators"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">School / Organization *</label>
                <input 
                  type="text" 
                  required 
                  value={schoolOrg}
                  onChange={e => setSchoolOrg(e.target.value)}
                  placeholder="e.g. Pretoria High School for Girls / Tech Academy"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-2">Select Competition Challenges *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'underwater', name: 'Underwater Drone Mission' },
                    { id: 'maze', name: 'Autonomous Maze Solving' },
                    { id: 'pitch', name: 'Innovation Pitch Challenge' }
                  ].map(ch => (
                    <label key={ch.id} className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 p-3 rounded-xl cursor-pointer hover:border-indigo-500 transition">
                      <input 
                        type="checkbox"
                        checked={category.includes(ch.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCategory(prev => prev === 'Autonomous Robotics' ? ch.name : `${prev}, ${ch.name}`);
                          } else {
                            const updated = category.split(', ').filter(c => c !== ch.name).join(', ');
                            setCategory(updated || 'Autonomous Robotics');
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs font-bold text-slate-200">{ch.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Country *</label>
                <select 
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {AFRICAN_COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">State / Province / Region *</label>
                {country === 'South Africa' ? (
                  <select 
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {SOUTH_AFRICAN_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text"
                    required
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    placeholder="e.g. Lagos State / Nairobi County"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">District / Sub-region</label>
                <input 
                  type="text" 
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="e.g. Tshwane District / Ikeja"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Town / City *</label>
                <input 
                  type="text" 
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Pretoria / Nairobi / Accra"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>



          <hr className="border-slate-800" />

          {/* Section 2: Teacher / Coach / Mentor (Excluded from minimum 4 members requirement) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Mentor / Teacher / Coach</span>
              </h3>
              <span className="text-[11px] text-slate-400 italic">Separate entry — does not count toward 4-member total</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mentor Full Name</label>
                <input 
                  type="text" 
                  value={mentorName}
                  onChange={e => setMentorName(e.target.value)}
                  placeholder="e.g. Mr. John Mokoena"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mentor Email</label>
                <input 
                  type="email" 
                  value={mentorEmail}
                  onChange={e => setMentorEmail(e.target.value)}
                  placeholder="mentor@school.edu.za"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mentor Phone Number</label>
                <input 
                  type="tel" 
                  value={mentorPhone}
                  onChange={e => setMentorPhone(e.target.value)}
                  placeholder="+27 82 123 4567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section 3: Mandatory Team Composition Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Team Members (Minimum 4: 2 Boys & 2 Girls)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select one participant as Team Captain. Extra members beyond 4 are permitted provided gender balance rules are preserved.
                </p>
              </div>
              <button 
                type="button" 
                onClick={addMember}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-xs font-bold transition border border-indigo-500/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-3">
              {members.map((member, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-2xl border transition flex flex-col md:flex-row items-center gap-3 ${
                    member.is_captain 
                      ? 'bg-indigo-950/40 border-indigo-500/40 shadow-inner' 
                      : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {idx + 1}
                    </span>
                    <input 
                      type="text" 
                      required
                      placeholder={`Participant #${idx + 1} Full Name`}
                      value={member.full_name}
                      onChange={e => handleMemberChange(idx, 'full_name', e.target.value)}
                      className="flex-1 md:w-64 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Gender Selector */}
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <label className="text-xs font-semibold text-slate-400">Gender:</label>
                    <select
                      value={member.gender}
                      onChange={e => handleMemberChange(idx, 'gender', e.target.value as 'boy' | 'girl')}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="boy">Boy 👦</option>
                      <option value="girl">Girl 👧</option>
                    </select>
                  </div>

                  {/* Captain Nomination */}
                  <button
                    type="button"
                    onClick={() => handleMemberChange(idx, 'is_captain', true)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      member.is_captain 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Crown className={`w-3.5 h-3.5 ${member.is_captain ? 'text-amber-400 fill-amber-400' : ''}`} />
                    <span>{member.is_captain ? 'Team Captain' : 'Nominate Captain'}</span>
                  </button>

                  {/* Delete button */}
                  {members.length > 4 && (
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition ml-auto"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!eligibility.isEligible || submitting}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition ${
                eligibility.isEligible && !submitting
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Team...' : 'Submit Registration'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
