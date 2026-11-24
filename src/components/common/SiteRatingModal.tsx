import React, { useState } from 'react';
import { Star, X, Send, CheckCircle2, Sparkles, MessageSquare, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const SiteRatingModal: React.FC<Props> = ({ isOpen, onClose, onSubmitted }) => {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('Overall Platform Experience');
  const [message, setMessage] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5: return 'Outstanding / Exceptional (5/5)';
      case 4: return 'Very Good (4/5)';
      case 3: return 'Good (3/5)';
      case 2: return 'Fair (2/5)';
      case 1: return 'Needs Improvement (1/5)';
      default: return 'Rate your experience';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    const authorName = profile?.display_name || user?.email?.split('@')[0] || guestName.trim() || 'YARA Community Member';
    const authorEmail = user?.email || guestEmail.trim() || '';

    const payload = {
      user_id: user?.id || null,
      user_name: authorName,
      user_email: authorEmail,
      category,
      rating,
      message: message.trim(),
      created_at: new Date().toISOString()
    };

    // Store in LocalStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem('yara_platform_feedback') || '[]');
      localStorage.setItem('yara_platform_feedback', JSON.stringify([payload, ...stored]));
    } catch {}

    // Store in Supabase feedback table
    try {
      await supabase.from('feedback').insert(payload);
    } catch (err) {
      console.warn('Feedback supabase insert error, stored locally:', err);
    }

    setSubmitting(false);
    setSubmitted(true);
    if (onSubmitted) onSubmitted();

    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0A1B4D] via-[#0D47A1] to-[#1976D2] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Star className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Rate the YARA Platform</h3>
              <p className="text-xs text-blue-200">Help us develop tomorrow&apos;s robotics and engineering leaders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-3"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Thank You For Your Review!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your rating has been recorded. Your feedback helps our team optimize robotics modules, platform speed, and mentorship access.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating Select */}
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select Your Star Rating
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-black text-[#0D47A1]">
                  {getRatingLabel(hoverRating || rating)}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  What are you reviewing?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0D47A1] focus:bg-white transition"
                >
                  <option value="Overall Platform Experience">Overall Platform Experience</option>
                  <option value="Robotics & Engineering Academy">Robotics &amp; Engineering Academy</option>
                  <option value="Mentorship & Coaching">Mentorship &amp; Faculty Coaching</option>
                  <option value="Competitions & Hackathons">Robotics Competitions &amp; Arenas</option>
                  <option value="Hardware Kits & Shop">Hardware Kits &amp; Store</option>
                  <option value="Youth Safeguarding & Wellbeing">Youth Safeguarding &amp; Wellbeing</option>
                </select>
              </div>

              {/* Guest Author info if not logged in */}
              {!user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tendai or Harare High Student"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#0D47A1] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email / WhatsApp (Optional)</label>
                    <input
                      type="text"
                      placeholder="contact@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#0D47A1] focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your Thoughts &amp; Review *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you loved about YARA or what we could improve for learners and schools..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#0D47A1] focus:bg-white resize-none transition"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

