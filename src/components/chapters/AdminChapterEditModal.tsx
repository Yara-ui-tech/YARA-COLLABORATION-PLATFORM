import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, X, Save, Globe, MapPin, Calendar, Mail, Phone } from 'lucide-react';
import { Chapter, ChapterCategory, ChapterStatus } from '../../types/chapters';
import { ZIMBABWE_PROVINCES } from '../../constants/locationsData';

interface AdminChapterEditModalProps {
  isOpen: boolean;
  chapter: Chapter;
  onClose: () => void;
  onSave: (updates: Partial<Chapter>) => Promise<void>;
}

export default function AdminChapterEditModal({
  isOpen,
  chapter,
  onClose,
  onSave
}: AdminChapterEditModalProps) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    category: 'university' as ChapterCategory,
    institution_or_community: '',
    province: 'Harare',
    district_or_city: '',
    description: '',
    motto: '',
    website_url: '',
    banner_url: '',
    meeting_schedule: '',
    physical_location: '',
    public_email: '',
    public_phone: '',
    status: 'chartered' as ChapterStatus,
    focus_areas_str: '',
    total_members_count: 0
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chapter) {
      setForm({
        name: chapter.name || '',
        code: chapter.code || '',
        category: chapter.category || 'university',
        institution_or_community: chapter.institution_or_community || '',
        province: chapter.province || 'Harare',
        district_or_city: chapter.district_or_city || '',
        description: chapter.description || '',
        motto: chapter.motto || '',
        website_url: chapter.website_url || '',
        banner_url: chapter.banner_url || '',
        meeting_schedule: chapter.meeting_schedule || '',
        physical_location: chapter.physical_location || '',
        public_email: chapter.public_email || '',
        public_phone: chapter.public_phone || '',
        status: chapter.status || 'chartered',
        focus_areas_str: (chapter.focus_areas || []).join(', '),
        total_members_count: chapter.total_members_count || 0
      });
    }
    setError(null);
  }, [chapter, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Chapter name is required.');
      return;
    }
    if (!form.code.trim()) {
      setError('Chapter code is required.');
      return;
    }

    const focusList = form.focus_areas_str
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(Boolean);

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        category: form.category,
        institution_or_community: form.institution_or_community.trim(),
        province: form.province,
        district_or_city: form.district_or_city.trim(),
        description: form.description.trim(),
        motto: form.motto.trim() || undefined,
        website_url: form.website_url.trim() || undefined,
        banner_url: form.banner_url.trim() || undefined,
        meeting_schedule: form.meeting_schedule.trim() || undefined,
        physical_location: form.physical_location.trim() || undefined,
        public_email: form.public_email.trim() || undefined,
        public_phone: form.public_phone.trim() || undefined,
        status: form.status,
        focus_areas: focusList,
        total_members_count: Number(form.total_members_count) || 0
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save chapter.');
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
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                    Administrator Mode
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Edit Chapter Details
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-xl truncate max-w-md">
                  {chapter.name}
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
            {/* Name & Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-900">Chapter Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Chapter Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="university">University Chapter</option>
                  <option value="polytechnic">Polytechnic College</option>
                  <option value="high_school">High School Chapter</option>
                  <option value="primary_school">Primary School Chapter</option>
                  <option value="community_youth">Community Youth Hub</option>
                  <option value="provincial_hub">Provincial Hub</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="chartered">Chartered (Official)</option>
                  <option value="forming">Forming</option>
                  <option value="probationary">Probationary</option>
                </select>
              </div>
            </div>

            {/* Institution / Community & Province */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Institution or Host Community</label>
                <input
                  type="text"
                  value={form.institution_or_community}
                  onChange={e => setForm({ ...form, institution_or_community: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Province</label>
                <select
                  value={form.province}
                  onChange={e => setForm({ ...form, province: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  {ZIMBABWE_PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* District / City & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">District / City</label>
                <input
                  type="text"
                  value={form.district_or_city}
                  onChange={e => setForm({ ...form, district_or_city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Physical Lab / Campus Room</label>
                <input
                  type="text"
                  value={form.physical_location}
                  onChange={e => setForm({ ...form, physical_location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Website URL & Banner URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Website URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.website_url}
                  onChange={e => setForm({ ...form, website_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.banner_url}
                  onChange={e => setForm({ ...form, banner_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Meeting Schedule & Member Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Meeting Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Every Friday 3:00 PM"
                  value={form.meeting_schedule}
                  onChange={e => setForm({ ...form, meeting_schedule: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Registered Members Count</label>
                <input
                  type="number"
                  value={form.total_members_count}
                  onChange={e => setForm({ ...form, total_members_count: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900">Focus Areas (Comma separated)</label>
              <input
                type="text"
                placeholder="Autonomous Rovers, IoT, Drone Systems, AgriTech..."
                value={form.focus_areas_str}
                onChange={e => setForm({ ...form, focus_areas_str: e.target.value })}
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
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center space-x-2 shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Chapter Details'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

