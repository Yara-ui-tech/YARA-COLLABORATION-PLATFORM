import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Save, ShieldCheck, Mail, Phone, GraduationCap } from 'lucide-react';
import { ChapterMember } from '../../types/chapters';

interface AdminMemberEditModalProps {
  isOpen: boolean;
  member?: ChapterMember | null;
  chapterName: string;
  onClose: () => void;
  onSave: (memberData: Partial<ChapterMember>) => Promise<void>;
}

export default function AdminMemberEditModal({
  isOpen,
  member,
  chapterName,
  onClose,
  onSave
}: AdminMemberEditModalProps) {
  const isEditing = Boolean(member);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Member',
    department_or_grade: '',
    student_or_staff_id: '',
    status: 'active' as 'active' | 'alumni' | 'inactive',
    public_consent: true,
    skills_str: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        role: member.role || 'Member',
        department_or_grade: member.department_or_grade || '',
        student_or_staff_id: member.student_or_staff_id || '',
        status: member.status || 'active',
        public_consent: member.public_consent !== false,
        skills_str: (member.skills || []).join(', ')
      });
    } else {
      setForm({
        name: '',
        email: '',
        phone: '',
        role: 'Member',
        department_or_grade: '',
        student_or_staff_id: '',
        status: 'active',
        public_consent: true,
        skills_str: ''
      });
    }
    setError(null);
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Member name is required.');
      return;
    }

    const skillsList = form.skills_str
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(Boolean);

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        role: form.role.trim() || 'Member',
        department_or_grade: form.department_or_grade.trim() || undefined,
        student_or_staff_id: form.student_or_staff_id.trim() || undefined,
        status: form.status,
        public_consent: form.public_consent,
        skills: skillsList
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save member.');
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
          className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                    Admin Roster Control
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-xl">
                  {isEditing ? `Edit Member: ${member?.name}` : `Add Member to ${chapterName}`}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tendai Chikore"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Role / Function</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Programmer, Hardware Maker"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Email Address</label>
                <input
                  type="email"
                  placeholder="student@university.ac.zw"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Phone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+263..."
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Department & Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Department / Grade / Year</label>
                <input
                  type="text"
                  placeholder="e.g. Mechatronics Engineering Year 3"
                  value={form.department_or_grade}
                  onChange={e => setForm({ ...form, department_or_grade: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Student or Staff ID</label>
                <input
                  type="text"
                  placeholder="e.g. H240182C"
                  value={form.student_or_staff_id}
                  onChange={e => setForm({ ...form, student_or_staff_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900">Membership Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                <option value="active">Active (Enrolled & Participating)</option>
                <option value="alumni">Alumni (Graduated / Senior Mentor)</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Public Consent Checkbox */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-start space-x-2.5">
              <input
                type="checkbox"
                id="public_consent_check"
                checked={form.public_consent}
                onChange={e => setForm({ ...form, public_consent: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-600 w-4 h-4 bg-white border-slate-300"
              />
              <label htmlFor="public_consent_check" className="text-xs font-medium text-emerald-950 cursor-pointer">
                <strong>Public Directory Consent:</strong> Member profile and name visible to registered chapter peers and public viewers.
              </label>
            </div>

            {/* Skills */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900">Technical Skills (Comma separated)</label>
              <input
                type="text"
                placeholder="ROS2, C++, PCB Design, Arduino, Computer Vision..."
                value={form.skills_str}
                onChange={e => setForm({ ...form, skills_str: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center space-x-2 shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : isEditing ? 'Save Member' : 'Add Member to Roster'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

