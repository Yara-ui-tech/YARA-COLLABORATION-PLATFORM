import React, { useState } from 'react';
import { 
  Users, MessageSquare, Send, CheckCircle2, 
  X, AlertCircle, Sparkles, HelpCircle, ShieldCheck
} from 'lucide-react';
import { createMentorHelpRequest } from '../../services/unifiedCourseService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  defaultTopic?: string;
}

const APPROVED_MENTORS = [
  { name: 'Simbarashe Manongwa', title: 'Executive Director & Senior Robotics Mentor', specialty: 'Firmware, Circuit Design & Capstones' },
  { name: 'T. Chiambiro', title: 'Regional President & STEM Pedagogy Coach', specialty: 'Patron Support, Lesson Plans & Rules' },
  { name: 'Eng. K. Moyo', title: 'Industrial Automation Specialist', specialty: 'PID Control, Microcontrollers & Hardware Labs' },
  { name: 'T. Sithole', title: 'Software & Python Lead', specialty: 'Algorithms, Web Telemetry & MicroPython' }
];

export const MentorHelpModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  courseId,
  courseTitle,
  moduleId,
  moduleTitle,
  defaultTopic = 'Concept clarification or hardware debugging'
}) => {
  const [selectedMentor, setSelectedMentor] = useState(APPROVED_MENTORS[0].name);
  const [topic, setTopic] = useState(defaultTopic);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await createMentorHelpRequest({
        userId,
        userName,
        userEmail,
        courseId,
        courseTitle,
        moduleId,
        moduleTitle,
        topic,
        message: `[Mentor requested: ${selectedMentor}] ${message}`,
        mentorName: selectedMentor
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error requesting mentor help:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">Mentor Help Dispatched!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your inquiry has been submitted to <strong>{selectedMentor}</strong>. Context from <em>{courseTitle} {moduleTitle ? `(${moduleTitle})` : ''}</em> has been attached to your case. A mentor will reach out via in-app notification and email.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
            >
              Back to Lesson
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-indigo-500/30">
                <Users className="w-3.5 h-3.5" />
                <span>LMS Industrial Mentorship Support</span>
              </div>
              <h3 className="text-xl font-black text-white">Need Help from an Approved Mentor?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Course: <span className="text-slate-200 font-semibold">{courseTitle}</span>
                {moduleTitle && <> • Module: <span className="text-slate-200 font-semibold">{moduleTitle}</span></>}
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Approved Mentor</label>
                <div className="space-y-1.5">
                  {APPROVED_MENTORS.map(m => (
                    <label
                      key={m.name}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        selectedMentor === m.name
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mentor"
                        checked={selectedMentor === m.name}
                        onChange={() => setSelectedMentor(m.name)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-bold flex items-center justify-between">
                          <span>{m.name}</span>
                          <span className="text-[10px] text-indigo-400 font-normal">{m.specialty}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{m.title}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Help Topic</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Breadboard circuit not lighting LED / Code syntax error"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Description of Struggle</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Describe what you tried, what expected result occurred vs actual error message or bench symptom..."
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Request Mentor Assistance'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
