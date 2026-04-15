import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { CURRICULUM, CurriculumSession } from '../constants/curriculum';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  HelpCircle, 
  MessageSquare, 
  ChevronRight, 
  Monitor, 
  Zap, 
  Box, 
  Users, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SessionFeedback {
  session_id: string;
  status: 'done' | 'partially' | 'struggling';
  success_comment: string;
  struggle_comment: string;
}

export default function Curriculum() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Record<string, SessionFeedback>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<CurriculumSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalTab, setModalTab] = useState<'content' | 'feedback'>('content');

  // Form state for current selected session
  const [formData, setFormData] = useState({
    status: 'done' as 'done' | 'partially' | 'struggling',
    success_comment: '',
    struggle_comment: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserFeedback();
    }
  }, [user]);

  async function fetchUserFeedback() {
    try {
      const { data, error } = await supabase
        .from('curriculum_feedback')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const feedbackMap: Record<string, SessionFeedback> = {};
      data?.forEach(fb => {
        feedbackMap[fb.session_id] = {
          session_id: fb.session_id,
          status: fb.status,
          success_comment: fb.success_comment,
          struggle_comment: fb.struggle_comment
        };
      });
      setFeedbacks(feedbackMap);
    } catch (error) {
      console.error('Error fetching curriculum feedback:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenFeedback = (session: CurriculumSession) => {
    const existing = feedbacks[session.id];
    setSelectedSession(session);
    setModalTab('content'); // Default to lesson content
    setFormData({
      status: existing?.status || 'done',
      success_comment: existing?.success_comment || '',
      struggle_comment: existing?.struggle_comment || ''
    });
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedSession) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('curriculum_feedback')
        .upsert({
          user_id: user.id,
          session_id: selectedSession.id,
          status: formData.status,
          success_comment: formData.success_comment,
          struggle_comment: formData.struggle_comment,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,session_id' });

      if (error) throw error;

      setFeedbacks(prev => ({
        ...prev,
        [selectedSession.id]: {
          session_id: selectedSession.id,
          status: formData.status,
          success_comment: formData.success_comment,
          struggle_comment: formData.struggle_comment
        }
      }));
      setSelectedSession(null);
    } catch (error: any) {
      console.error('Error saving feedback:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sessionsDone = Object.values(feedbacks).filter(f => f.status === 'done').length;
  const progressPercent = Math.round((sessionsDone / CURRICULUM.length) * 100);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
            <Brain className="w-4 h-4" />
            <span>Mastery Path</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Robotics Curriculum</h2>
          <p className="text-slate-500 font-medium max-w-xl">
            Track your journey from the fundamentals of electronics to building and pitching your own community-impact robot.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-indigo-50/50 min-w-[240px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Progress</span>
            <span className="text-lg font-black text-indigo-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600"
            />
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
            {sessionsDone} OF {CURRICULUM.length} SESSIONS COMPLETED
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Session Timeline */}
        <div className="lg:col-span-8 space-y-8">
          {['Electronics', 'Programming', 'Innovation + Build'].map((part) => (
            <div key={part} className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-3 ml-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  {part === 'Electronics' && <Zap className="w-4 h-4" />}
                  {part === 'Programming' && <Monitor className="w-4 h-4" />}
                  {part === 'Innovation + Build' && <Box className="w-4 h-4" />}
                </div>
                <span>Part {part === 'Electronics' ? 'One' : part === 'Programming' ? 'Two' : 'Three'}: {part}</span>
              </h3>

              <div className="grid gap-4">
                {CURRICULUM.filter(s => s.part === part).map((session) => {
                  const feedback = feedbacks[session.id];
                  return (
                    <motion.div
                      key={session.id}
                      whileHover={{ x: 4 }}
                      onClick={() => handleOpenFeedback(session)}
                      className={cn(
                        "group cursor-pointer bg-white p-6 rounded-[2rem] border-2 transition-all flex items-center gap-6",
                        feedback?.status === 'done' ? "border-emerald-100 bg-emerald-50/10" : 
                        feedback?.status === 'partially' ? "border-amber-100 bg-amber-50/10" :
                        feedback?.status === 'struggling' ? "border-red-100 bg-red-50/10" :
                        "border-slate-50 hover:border-indigo-100"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 transition-colors",
                        feedback?.status === 'done' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" :
                        feedback?.status === 'partially' ? "bg-amber-500 text-white shadow-lg shadow-amber-100" :
                        feedback?.status === 'struggling' ? "bg-red-500 text-white shadow-lg shadow-red-100" :
                        "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      )}>
                        {feedback?.status === 'done' ? <CheckCircle2 className="w-6 h-6" /> : session.id}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                            session.type === 'online' ? "bg-indigo-50 text-indigo-600" : "bg-purple-50 text-purple-600"
                          )}>
                            {session.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{session.topic}</h4>
                        <p className="text-sm text-slate-500 font-medium line-clamp-1 italic">{session.outcome}</p>
                      </div>

                      <div className="shrink-0">
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Quick Stats & Legend */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200">
            <h3 className="font-bold text-xl mb-6 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Learning Legend</span>
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Completed (Done)</p>
                  <p className="text-xs text-slate-400">You understood the concept and outcome.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Partially Done</p>
                  <p className="text-xs text-slate-400">You started but need more practice or review.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Struggling</p>
                  <p className="text-xs text-slate-400">You didn't understand this part yet. Needs help!</p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-xs font-medium text-slate-400 italic">
                Feedback helps our mentors identify where the class needs extra explanation. Please be honest!
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-[2.5rem] p-8 border-2 border-indigo-100">
            <Users className="w-8 h-8 text-indigo-600 mb-4" />
            <h4 className="font-bold text-slate-900 mb-2">Need Help?</h4>
            <p className="text-sm text-slate-600 mb-6 font-medium">
              If you mark a session as "Struggling", your assigned mentor will be notified to reach out to you.
            </p>
            <button className="flex items-center space-x-2 text-indigo-600 font-bold text-sm group">
              <span>View Mentors</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setSelectedSession(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl p-0 relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shrink-0">
                    {selectedSession.id}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedSession.topic}</h3>
                    <p className="text-indigo-600 text-xs font-black uppercase tracking-widest">{selectedSession.type} session</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Circle className="w-6 h-6 rotate-45" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex px-8 bg-slate-50/50">
                <button
                  onClick={() => setModalTab('content')}
                  className={cn(
                    "px-6 py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all",
                    modalTab === 'content' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400"
                  )}
                >
                  Lesson Details
                </button>
                <button
                  onClick={() => setModalTab('feedback')}
                  className={cn(
                    "px-6 py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                    modalTab === 'feedback' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400"
                  )}
                >
                  <span>Your Feedback</span>
                  {feedbacks[selectedSession.id] && <CheckCircle2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {modalTab === 'content' ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <section>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Objective</h4>
                      <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-xl">
                        <p className="text-indigo-900 font-bold">{selectedSession.outcome}</p>
                      </div>
                    </section>

                    {selectedSession.details?.theory && (
                      <section>
                        <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span>Key Theory & Concepts</span>
                        </h4>
                        <ul className="space-y-3">
                          {selectedSession.details.theory.map((line, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-600 font-medium text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {selectedSession.details?.formulas && (
                      <section>
                        <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Essential Formulas</span>
                        </h4>
                        <div className="grid gap-2">
                          {selectedSession.details.formulas.map((formula, i) => (
                            <code key={i} className="block bg-slate-100 p-3 rounded-xl font-mono text-sm text-slate-700 border border-slate-200">
                              {formula}
                            </code>
                          ))}
                        </div>
                      </section>
                    )}

                    {selectedSession.details?.activities && (
                      <section>
                        <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span>Session Activities</span>
                        </h4>
                        <ul className="space-y-3">
                          {selectedSession.details.activities.map((act, i) => (
                            <li key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 font-bold text-sm">
                              {act}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {selectedSession.details?.safetyRules && (
                      <section className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
                        <h4 className="flex items-center gap-2 text-sm font-black text-red-600 uppercase tracking-widest mb-4">
                          <AlertCircle className="w-4 h-4" />
                          <span>Safety Non-Negotiables</span>
                        </h4>
                        <ul className="space-y-2">
                          {selectedSession.details.safetyRules.map((rule, i) => (
                            <li key={i} className="text-red-900 font-bold text-xs flex items-center gap-2">
                              <span className="w-1 h-1 bg-red-400 rounded-full" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    <div className="pt-4">
                      <button 
                        onClick={() => setModalTab('feedback')}
                        className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                      >
                        <span>Mark Session Progress</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest block ml-1">How was this session?</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'done', label: 'Done', color: 'emerald', icon: <CheckCircle2 className="w-5 h-5" /> },
                          { id: 'partially', label: 'Partial', color: 'amber', icon: <Clock className="w-5 h-5" /> },
                          { id: 'struggling', label: 'Struggle', color: 'red', icon: <HelpCircle className="w-5 h-5" /> }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, status: opt.id as any })}
                            className={cn(
                              "py-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all font-bold",
                              formData.status === opt.id 
                                ? `bg-${opt.color}-500 border-${opt.color}-500 text-white shadow-xl shadow-${opt.color}-100` 
                                : `bg-slate-50 border-slate-50 text-slate-400 hover:border-indigo-100`
                            )}
                          >
                            {opt.icon}
                            <span className="text-xs">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest block ml-1">What went well? (Successful part)</label>
                      <textarea
                        value={formData.success_comment}
                        onChange={(e) => setFormData({ ...formData, success_comment: e.target.value })}
                        placeholder="e.g., I understood how to calculate the resistor for my LED."
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium h-24 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest block ml-1">What didn't you understand?</label>
                      <textarea
                        value={formData.struggle_comment}
                        onChange={(e) => setFormData({ ...formData, struggle_comment: e.target.value })}
                        placeholder="e.g., I don't understand how the voltage divider works for sensors."
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium h-24 resize-none"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedSession(null)}
                        className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? <Clock className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                        <span>Update Progress</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
