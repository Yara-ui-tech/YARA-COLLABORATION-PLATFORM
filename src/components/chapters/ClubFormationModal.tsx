import React, { useState } from 'react';
import { 
  X, Users, Cpu, Rocket, CheckCircle2, AlertCircle, Building2, 
  Calendar, MapPin, Shield, Plus, Check, Star, BookOpen, 
  Award, Sparkles, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chapter, ChapterClub, ChapterMember } from '../../types/chapters';
import { submitClubFormationRequest } from '../../services/chaptersService';
import { cn } from '../../lib/utils';

interface ClubFormationModalProps {
  isOpen: boolean;
  chapter: Chapter;
  currentUserEmail?: string;
  currentUserName?: string;
  onClose: () => void;
  onSuccess: (club: ChapterClub) => void;
}

const SPECIALIZATIONS = [
  'Autonomous Rovers & AGVs',
  'Drones, UAVs & Aerial Robotics',
  'AgriTech & Environmental Robotics',
  'Industrial Automation & IoT',
  'Artificial Intelligence & Computer Vision',
  'Combat Robotics & Electronics',
  'Girls in STEM & Maker Hardware',
  'Biomedical & Assistive Robotics',
  'Renewable Energy & Solar Automation',
  'General Robotics & Hardware Innovation'
];

export default function ClubFormationModal({
  isOpen,
  chapter,
  currentUserEmail,
  currentUserName,
  onClose,
  onSuccess
}: ClubFormationModalProps) {
  const [clubName, setClubName] = useState('');
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [description, setDescription] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('Every Friday 14:00 - 17:00');
  const [labLocation, setLabLocation] = useState('University Innovation & Mechatronics Lab');
  
  // Leadership
  const [chairpersonName, setChairpersonName] = useState(currentUserName || '');
  const [chairpersonEmail, setChairpersonEmail] = useState(currentUserEmail || '');
  const [chairpersonPhone, setChairpersonPhone] = useState('');
  const [secretaryName, setSecretaryName] = useState('');
  const [secretaryEmail, setSecretaryEmail] = useState('');
  const [patronName, setPatronName] = useState('');
  const [patronEmail, setPatronEmail] = useState('');

  // Selected University Members
  const [selectedMemberNames, setSelectedMemberNames] = useState<string[]>(
    currentUserName ? [currentUserName] : []
  );
  const [additionalMembersText, setAdditionalMembersText] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successClub, setSuccessClub] = useState<ChapterClub | null>(null);

  if (!isOpen) return null;

  const universityMembers = chapter.members || [];

  const toggleMemberSelection = (name: string) => {
    setSelectedMemberNames(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleSelectAllMembers = () => {
    if (selectedMemberNames.length === universityMembers.length) {
      setSelectedMemberNames([]);
    } else {
      setSelectedMemberNames(universityMembers.map(m => m.name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim()) {
      setErrorMsg('Please enter a name for the proposed club.');
      return;
    }
    if (!chairpersonName.trim() || !chairpersonEmail.trim()) {
      setErrorMsg('Please provide the club chairperson or lead name and email.');
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      setErrorMsg('Please provide a description of the club mission and planned activities (at least 20 characters).');
      return;
    }

    // Combine selected members and manual text
    const extraNames = additionalMembersText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const allFoundingNames = Array.from(new Set([...selectedMemberNames, ...extraNames]));

    if (allFoundingNames.length === 0) {
      if (chairpersonName.trim()) {
        allFoundingNames.push(chairpersonName.trim());
      } else {
        setErrorMsg('Please select or specify at least one founding member from this university section.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await submitClubFormationRequest({
        parent_chapter_id: chapter.id,
        parent_chapter_name: chapter.name,
        club_name: clubName.trim(),
        specialization,
        description: description.trim(),
        meeting_schedule: meetingSchedule.trim(),
        lab_location: labLocation.trim(),
        chairperson_name: chairpersonName.trim(),
        chairperson_email: chairpersonEmail.trim(),
        chairperson_phone: chairpersonPhone.trim(),
        secretary_name: secretaryName.trim() || undefined,
        secretary_email: secretaryEmail.trim() || undefined,
        patron_name: patronName.trim() || undefined,
        patron_email: patronEmail.trim() || undefined,
        founding_member_names: allFoundingNames
      });

      setSuccessClub(result.club);
      onSuccess(result.club);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit club formation request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[2.5rem] max-w-3xl w-full shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 md:p-8 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
            <Rocket className="w-4 h-4" />
            <span>University Club & Society Formation</span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white">
            Form a Club at {chapter.institution_or_community || chapter.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Propose a specialized robotics society, competitive rover squad, or hardware lab team using registered members from this university section.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-xs">
          {successClub ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  🎉 Club Formation Request Submitted!
                </h3>
                <p className="text-slate-600 max-w-md mx-auto font-medium">
                  <strong>{successClub.club_name}</strong> has been officially chartered under{' '}
                  <strong>{chapter.name}</strong>. Founding members have been associated with this new robotics society.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Specialization:</span>
                  <span className="font-bold text-slate-900">{successClub.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Chairperson:</span>
                  <span className="font-bold text-slate-900">{successClub.chairperson_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Founding Members:</span>
                  <span className="font-bold text-indigo-600">{successClub.founding_member_names.length} Members</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                >
                  Return to Chapter Portal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Basic Club Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Proposed Club Identity</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Proposed Club Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Autonomous Rover Development Society"
                      value={clubName}
                      onChange={e => setClubName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Full Charter: YARA {chapter.institution_or_community || chapter.name} - {clubName || 'Club Name'}
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Club Focus / Specialization *</label>
                    <select
                      value={specialization}
                      onChange={e => setSpecialization(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      {SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mission & Purpose Statement *</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what projects this club will build, competitions targeted, and how it empowers university students..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* 2. University Members Roster Selection */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>2. Select Founding Members from University Section</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Check members registered in {chapter.name} who are co-founding this club.
                    </p>
                  </div>

                  {universityMembers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllMembers}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      {selectedMemberNames.length === universityMembers.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                {universityMembers.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-center">
                    No individual roster members pre-loaded for this chapter yet. You can type founding member names below.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    {universityMembers.map((mem, idx) => {
                      const isSelected = selectedMemberNames.includes(mem.name);
                      return (
                        <div
                          key={mem.id || idx}
                          onClick={() => toggleMemberSelection(mem.name)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors border text-xs",
                            isSelected 
                              ? "bg-indigo-50 border-indigo-200 text-indigo-950 font-bold" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={cn(
                              "w-5 h-5 rounded-md flex items-center justify-center border transition-colors",
                              isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                            )}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <span className="block">{mem.name}</span>
                              {mem.role && (
                                <span className="text-[10px] font-normal text-slate-400">{mem.role}</span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-400 font-mono">
                            {mem.student_or_staff_id || 'Student Member'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Additional Founding Members (one name per line, optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter additional university student names..."
                    value={additionalMembersText}
                    onChange={e => setAdditionalMembersText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Total Founding Members Selected: {selectedMemberNames.length + additionalMembersText.split('\n').filter(s => s.trim()).length}
                  </span>
                </div>
              </div>

              {/* 3. Leadership & Logistics */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3. Leadership & Meeting Logistics</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Chairperson / Lead *</label>
                    <input
                      type="text"
                      placeholder="Student Lead Name"
                      value={chairpersonName}
                      onChange={e => setChairpersonName(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lead Email *</label>
                    <input
                      type="email"
                      placeholder="lead@university.ac.zw"
                      value={chairpersonEmail}
                      onChange={e => setChairpersonEmail(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lead Phone</label>
                    <input
                      type="tel"
                      placeholder="+263 77..."
                      value={chairpersonPhone}
                      onChange={e => setChairpersonPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Club Secretary / Comms Lead</label>
                    <input
                      type="text"
                      placeholder="Secretary Name"
                      value={secretaryName}
                      onChange={e => setSecretaryName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Faculty Patron / Senior Advisor</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. K. Moyo (Mechatronics Dept)"
                      value={patronName}
                      onChange={e => setPatronName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Meeting Schedule</label>
                    <input
                      type="text"
                      placeholder="e.g. Every Wednesday 15:00 - 17:30"
                      value={meetingSchedule}
                      onChange={e => setMeetingSchedule(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lab / Workshop Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Engineering Block B, Lab 4"
                      value={labLocation}
                      onChange={e => setLabLocation(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{loading ? 'Chartering Club...' : 'Submit Club Formation Request'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

