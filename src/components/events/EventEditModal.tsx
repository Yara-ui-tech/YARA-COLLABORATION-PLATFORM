import React, { useState } from 'react';
import { Calendar, MapPin, Tag, FileText, Save, X, Sparkles, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { motion } from 'motion/react';
import ImageUploader from '../ImageUploader';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  registration_link: string;
  is_upcoming: boolean;
  category: string;
}

interface EventEditModalProps {
  event?: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventItem) => Promise<void>;
}

export default function EventEditModal({
  event,
  isOpen,
  onClose,
  onSave
}: EventEditModalProps) {
  const isEditing = Boolean(event && event.id);

  const [form, setForm] = useState<EventItem>(() => ({
    id: event?.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '31 Aug – 4 Sep 2026',
    location: event?.location || 'Live Online / Harare Arena',
    image_url: event?.image_url || '',
    registration_link: event?.registration_link || '/events/ai-for-educators',
    is_upcoming: event?.is_upcoming !== undefined ? event.is_upcoming : true,
    category: event?.category || 'Virtual Bootcamp'
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Event Title is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save event.');
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
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                {isEditing ? 'Edit Event & Flyer' : 'Add New Event'}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Configure event details, flyer graphics, and registration links
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
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Event Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. AI for Educators – Online Bootcamp"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="Virtual Bootcamp">Virtual Bootcamp</option>
                <option value="Physical Tournament">Physical Tournament</option>
                <option value="Seminar & Workshop">Seminar & Workshop</option>
                <option value="Outreach Program">Outreach Program</option>
              </select>
            </div>
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Event Dates</label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="e.g. 31 Aug – 4 Sep 2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Location / Venue</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Live Google Meet / Harare Arena"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Registration Link & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Registration Path / Link</label>
              <input
                type="text"
                value={form.registration_link}
                onChange={(e) => setForm({ ...form, registration_link: e.target.value })}
                placeholder="/events/ai-for-educators"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Event Visibility</label>
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="evt_upcoming"
                  checked={form.is_upcoming}
                  onChange={(e) => setForm({ ...form, is_upcoming: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded border-slate-800 focus:ring-cyan-500"
                />
                <label htmlFor="evt_upcoming" className="font-bold text-slate-300 cursor-pointer">
                  Upcoming Active Event (Visible on Hub)
                </label>
              </div>
            </div>
          </div>

          {/* Flyer Image Uploader */}
          <ImageUploader
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
            bucket="flyers"
            label="Upload Event Flyer / Poster Graphic"
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Description & Schedule Overview</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium min-h-[90px] focus:outline-none focus:border-cyan-500"
              placeholder="Describe the event, target audience, schedule, and key outcomes..."
            />
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
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isEditing ? 'Save Event Updates' : 'Publish Event'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
