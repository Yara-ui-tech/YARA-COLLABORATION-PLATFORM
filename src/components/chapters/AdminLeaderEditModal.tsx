import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, Save, Mail, Phone, UserCheck } from 'lucide-react';
import { ChapterLeader, ChapterLeaderRole } from '../../types/chapters';

interface AdminLeaderEditModalProps {
  isOpen: boolean;
  leader?: ChapterLeader | null;
  chapterName: string;
  onClose: () => void;
  onSave: (leaderData: Partial<ChapterLeader>) => Promise<void>;
}

export default function AdminLeaderEditModal({
  isOpen,
  leader,
  chapterName,
  onClose,
  onSave
}: AdminLeaderEditModalProps) {
  const isEditing = Boolean(leader);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'secretary' as ChapterLeaderRole,
    department_or_grade: '',
    is_approved_by_admin: true,
    is_public_contact: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leader) {
      setForm({
        name: leader.name || '',
        email: leader.email || '',
        phone: leader.phone || '',
        role: leader.role || 'secretary',
        department_or_grade: leader.department_or_grade || '',
        is_approved_by_admin: leader.is_approved_by_admin !== false,
        is_public_contact: leader.is_public_contact !== false
      });
    } else {
      setForm({
        name: '',
        email: '',
        phone: '',
        role: 'secretary',
        department_or_grade: '',
        is_approved_by_admin: true,
        is_public_contact: true
      });
    }
    setError(null);
  }, [leader, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Leader name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        role: form.role,
        department_or_grade: form.department_or_grade.trim() || undefined,
        is_approved_by_admin: form.is_approved_by_admin,
        is_public_contact: form.is_public_contact
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save leader.');
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
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                    Executive Registry
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-xl">
                  {isEditing ? `Edit Leader: ${leader?.name}` : `Add Leader to ${chapterName}`}
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
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900">Leader Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Ronald Chimombe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Leadership Role *</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="president">President / Chairperson</option>
                  <option value="vice_president">Vice President</option>
                  <option value="secretary">Secretary (Minutes & Reports Officer)</option>
                  <option value="vice_secretary">Vice Secretary</option>
                  <option value="treasurer">Treasurer (Financial Officer)</option>
                  <option value="technical_lead">Technical & Lab Director</option>
                  <option value="outreach_coordinator">Outreach Coordinator</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="patron_advisor">Senior Faculty Patron</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Department / Grade</label>
                <input
                  type="text"
                  placeholder="e.g. Faculty of Technology"
                  value={form.department_or_grade}
                  onChange={e => setForm({ ...form, department_or_grade: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Official Email</label>
                <input
                  type="email"
                  placeholder="leader@domain.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Phone</label>
                <input
                  type="tel"
                  placeholder="+263..."
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="admin_approved_check"
                  checked={form.is_approved_by_admin}
                  onChange={e => setForm({ ...form, is_approved_by_admin: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-600 w-4 h-4 bg-white border-slate-300"
                />
                <label htmlFor="admin_approved_check" className="font-bold text-slate-900 cursor-pointer">
                  Certified / Approved by National Administrator
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public_contact_check"
                  checked={form.is_public_contact}
                  onChange={e => setForm({ ...form, is_public_contact: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-600 w-4 h-4 bg-white border-slate-300"
                />
                <label htmlFor="public_contact_check" className="font-medium text-slate-700 cursor-pointer">
                  Public Contact (Display email on chapter profile)
                </label>
              </div>
            </div>

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
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-md shadow-amber-200 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : isEditing ? 'Save Leader' : 'Add Chapter Leader'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

