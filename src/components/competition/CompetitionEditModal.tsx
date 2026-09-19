import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, FileText, Save, X, Sparkles, RefreshCw, Award, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Competition } from '../../types/competition';
import ImageUploader from '../ImageUploader';

interface CompetitionEditModalProps {
  competition?: Competition | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (comp: Competition) => Promise<void>;
}

export default function CompetitionEditModal({
  competition,
  isOpen,
  onClose,
  onSave
}: CompetitionEditModalProps) {
  const isEditing = Boolean(competition && competition.id);

  const [form, setForm] = useState<Competition>(() => ({
    id: competition?.id || `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: competition?.title || '',
    subtitle: competition?.subtitle || 'Engineering Opportunity & African Tech Innovation',
    description: competition?.description || '',
    start_date: competition?.start_date || '2026-10-15',
    end_date: competition?.end_date || '2026-10-18',
    location: competition?.location || 'Harare National Arena & Aquatic Centre',
    registration_link: competition?.registration_link || '/competitions/yara-2026',
    image_url: competition?.image_url || '',
    status: competition?.status || 'upcoming',
    category: competition?.category || 'flagship_robotics',
    is_featured: competition?.is_featured !== undefined ? competition.is_featured : true,
    slug: competition?.slug || (competition?.title ? competition.title.toLowerCase().replace(/\s+/g, '-') : 'yara-2026')
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Competition Title is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save competition.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                {isEditing ? 'Edit Competition & Banner' : 'Add New Competition'}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Configure arena tournament details, flyer graphics, and rules
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Competition Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. YARA Educational Robotics Competition 2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="flagship_robotics">Flagship Championship</option>
                <option value="underwater_rov">Underwater Drone & ROV</option>
                <option value="autonomous_vehicles">Autonomous & Micromouse</option>
                <option value="hackathon">Agro-Tech & AI Hackathon</option>
                <option value="junior_stem">Junior & Primary STEM</option>
              </select>
            </div>
          </div>

          {/* Subtitle / Theme */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Subtitle / Theme</label>
            <input
              type="text"
              value={form.subtitle || ''}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="e.g. Theme: Engineering Opportunity: Robotics for Underserved Youth"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active (Live Arena)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Location & Registration Path */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Venue / Location</label>
              <input
                type="text"
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Harare Arena & Virtual Arena"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Registration Path / Link</label>
              <input
                type="text"
                value={form.registration_link || ''}
                onChange={(e) => setForm({ ...form, registration_link: e.target.value })}
                placeholder="/competitions/yara-2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Flyer Image Uploader */}
          <ImageUploader
            value={form.image_url || ''}
            onChange={(url) => setForm({ ...form, image_url: url })}
            bucket="flyers"
            label="Upload Competition Flyer / Banner Graphic"
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Competition Overview & Rules Summary</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium min-h-[90px] focus:outline-none focus:border-cyan-500"
              placeholder="Detail the competition categories, team composition rules, scoring weighting, and prizes..."
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="comp_featured"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded border-slate-800 focus:ring-amber-500"
            />
            <label htmlFor="comp_featured" className="font-bold text-slate-300 cursor-pointer flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Feature on Competition Hub Spotlight Banner</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 flex items-center space-x-2"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isEditing ? 'Save Competition Updates' : 'Publish Competition'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
