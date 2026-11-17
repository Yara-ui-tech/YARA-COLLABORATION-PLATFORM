import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, X, Save, Shield, Users, MapPin, Calendar, Mail, Phone, Award } from 'lucide-react';
import { Chapter, ChapterClub } from '../../types/chapters';

interface AdminClubEditModalProps {
  isOpen: boolean;
  club?: ChapterClub | null;
  chapter?: Chapter;
  availableChapters?: Chapter[];
  onClose: () => void;
  onSave: (clubData: Partial<ChapterClub>, selectedChapterId?: string) => Promise<void>;
}

export default function AdminClubEditModal({
  isOpen,
  club,
  chapter,
  availableChapters,
  onClose,
  onSave
}: AdminClubEditModalProps) {
  const isEditing = Boolean(club);

  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    chapter?.id || club?.chapter_id || availableChapters?.[0]?.id || ''
  );

  const [form, setForm] = useState({
    club_name: '',
    specialization: 'Autonomous Rovers & Mobile Robotics',
    description: '',
    chairperson_name: '',
    chairperson_email: '',
    chairperson_phone: '',
    secretary_name: '',
    secretary_email: '',
    patron_name: '',
    patron_email: '',
    lab_location: 'Campus Engineering Lab / Innovation Hub',
    meeting_schedule: 'Every Wednesday & Friday 4:00 PM',
    status: 'chartered' as 'active' | 'forming' | 'chartered',
    founding_members_str: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (club) {
      setSelectedChapterId(club.chapter_id);
      setForm({
        club_name: club.club_name || '',
        specialization: club.specialization || 'Autonomous Rovers & Mobile Robotics',
        description: club.description || '',
        chairperson_name: club.chairperson_name || '',
        chairperson_email: club.chairperson_email || '',
        chairperson_phone: club.chairperson_phone || '',
        secretary_name: club.secretary_name || '',
        secretary_email: club.secretary_email || '',
        patron_name: club.patron_name || '',
        patron_email: club.patron_email || '',
        lab_location: club.lab_location || 'Campus Engineering Lab / Innovation Hub',
        meeting_schedule: club.meeting_schedule || 'Every Wednesday & Friday 4:00 PM',
        status: club.status || 'chartered',
        founding_members_str: (club.founding_member_names || []).join(', ')
      });
    } else {
      setSelectedChapterId(chapter?.id || availableChapters?.[0]?.id || '');
      setForm({
        club_name: '',
        specialization: 'Autonomous Rovers & Mobile Robotics',
        description: '',
        chairperson_name: '',
        chairperson_email: '',
        chairperson_phone: '',
        secretary_name: '',
        secretary_email: '',
        patron_name: '',
        patron_email: '',
        lab_location: 'Campus Engineering Lab / Innovation Hub',
        meeting_schedule: 'Every Wednesday & Friday 4:00 PM',
        status: 'chartered',
        founding_members_str: ''
      });
    }
    setError(null);
  }, [club, chapter, availableChapters, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.club_name.trim()) {
      setError('Please provide a club name.');
      return;
    }
    if (!form.chairperson_name.trim() || !form.chairperson_email.trim()) {
      setError('Chairperson name and email are required.');
      return;
    }

    const foundingList = form.founding_members_str
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(Boolean);

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        club_name: form.club_name.trim(),
        specialization: form.specialization.trim(),
        description: form.description.trim(),
        chairperson_name: form.chairperson_name.trim(),
        chairperson_email: form.chairperson_email.trim(),
        chairperson_phone: form.chairperson_phone.trim(),
        secretary_name: form.secretary_name.trim(),
        secretary_email: form.secretary_email.trim(),
        patron_name: form.patron_name.trim(),
        patron_email: form.patron_email.trim(),
        lab_location: form.lab_location.trim(),
        meeting_schedule: form.meeting_schedule.trim(),
        status: form.status,
        founding_member_names: foundingList
      }, selectedChapterId);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save club.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Rocket className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                    Administrator Control
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {isEditing ? 'Edit Club Record' : 'Charter New Club'}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-xl">
                  {isEditing ? `Edit ${club?.club_name}` : 'Charter Robotics Club / Society'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSaving}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Parent Chapter Selection if available */}
            {availableChapters && availableChapters.length > 0 && !chapter && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900">Parent University / Chapter *</label>
                <select
                  value={selectedChapterId}
                  onChange={e => setSelectedChapterId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                >
                  {availableChapters.map(ch => (
                    <option key={ch.id} value={ch.id} className="text-slate-900">
                      {ch.name} ({ch.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Club Name & Specialization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900">Club Name *</label>
                <input
                  type="text"
                  placeholder="e.g. CUT Autonomous Rovers Squad"
                  value={form.club_name}
                  onChange={e => setForm({ ...form, club_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900">Specialization / Domain *</label>
                <select
                  value={form.specialization}
                  onChange={e => setForm({ ...form, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="Autonomous Rovers & Mobile Robotics">Autonomous Rovers & Mobile Robotics</option>
                  <option value="Drone & Aerospace Systems">Drone & Aerospace Systems</option>
                  <option value="AgriTech Robotics & Automation">AgriTech Robotics & Automation</option>
                  <option value="AI & Embedded Mechatronics">AI & Embedded Mechatronics</option>
                  <option value="Underwater & Marine Robotics">Underwater & Marine Robotics</option>
                  <option value="Bio-Medical & Prosthetic Robotics">Bio-Medical & Prosthetic Robotics</option>
                  <option value="Industrial Automation & PLCs">Industrial Automation & PLCs</option>
                  <option value="STEM Outreach & School Mentorship">STEM Outreach & School Mentorship</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900">Club Mission & Description</label>
              <textarea
                rows={3}
                placeholder="Mission, ongoing hardware prototypes, competitions, and research objectives..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Status & Lab Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="chartered">Chartered (Fully Approved & Official)</option>
                  <option value="active">Active</option>
                  <option value="forming">Forming (Pending Requirements)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900">Lab / Assembly Location</label>
                <input
                  type="text"
                  placeholder="e.g. Electrical Engineering Lab 3, Block D"
                  value={form.lab_location}
                  onChange={e => setForm({ ...form, lab_location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Meeting Schedule */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900">Meeting / Build Schedule</label>
              <input
                type="text"
                placeholder="e.g. Every Wednesday 4:00 PM & Saturday Lab Sprints"
                value={form.meeting_schedule}
                onChange={e => setForm({ ...form, meeting_schedule: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Leadership Contacts */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Club Executive Officers
                </h4>
              </div>

              {/* Chairperson */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Chairperson Name *</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.chairperson_name}
                    onChange={e => setForm({ ...form, chairperson_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Chairperson Email *</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.chairperson_email}
                    onChange={e => setForm({ ...form, chairperson_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Chairperson Phone</label>
                  <input
                    type="tel"
                    placeholder="+263..."
                    value={form.chairperson_phone}
                    onChange={e => setForm({ ...form, chairperson_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Secretary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Secretary Name</label>
                  <input
                    type="text"
                    placeholder="Club Secretary"
                    value={form.secretary_name}
                    onChange={e => setForm({ ...form, secretary_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Secretary Email</label>
                  <input
                    type="email"
                    placeholder="secretary@example.com"
                    value={form.secretary_email}
                    onChange={e => setForm({ ...form, secretary_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Patron */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Faculty Patron / Senior Advisor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. K. Moyo"
                    value={form.patron_name}
                    onChange={e => setForm({ ...form, patron_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Patron Email</label>
                  <input
                    type="email"
                    placeholder="patron@university.ac.zw"
                    value={form.patron_email}
                    onChange={e => setForm({ ...form, patron_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Founding Members List */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900">
                Founding Member Names (Comma or newline separated)
              </label>
              <textarea
                rows={3}
                placeholder="Takudzwa Zhou, Nyasha Sithole, Blessed Ndlovu, Munyaradzi Chitando..."
                value={form.founding_members_str}
                onChange={e => setForm({ ...form, founding_members_str: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center space-x-2 shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : isEditing ? 'Save Club Changes' : 'Charter Club as Admin'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

