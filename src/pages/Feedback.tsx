import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Star, Loader2, CheckCircle2, User, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Feedback() {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching feedback:', error);
      } else {
        setFeedbacks(data || []);
      }
      setFetching(false);
    };

    fetchFeedbacks();

    const subscription = supabase
      .channel('feedback_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedback' }, (payload) => {
        setFeedbacks(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        user_name: profile?.display_name || 'Anonymous',
        content,
        rating
      });

      if (error) throw error;
      setSubmitted(true);
      setContent('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Community Feedback</h2>
        <p className="text-slate-500 font-medium">Help us shape the future of YARIA. We listen to every innovator.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback Form */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50 text-center sticky top-8"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Thank You!</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                  Your feedback is invaluable to us.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all text-sm"
                >
                  Send More
                </button>
              </motion.div>
            ) : (
              <motion.section 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm sticky top-8"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            rating >= star ? "text-amber-400 bg-amber-50" : "text-slate-300 bg-slate-50 hover:bg-slate-100"
                          )}
                        >
                          <Star className={cn("w-5 h-5", rating >= star && "fill-amber-400")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Your Message</label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What do you like? What could be improved?"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium min-h-[150px] resize-none text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:hover:translate-y-0 text-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Submit</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Feedback List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Feedback</h3>
            <div className="flex items-center space-x-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              <Users className="w-4 h-4" />
              <span>{feedbacks.length} Responses</span>
            </div>
          </div>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-[2.5rem] border border-slate-100">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-slate-500 font-bold">Loading community thoughts...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-bold">No feedback yet. Be the first!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {feedbacks.map((fb, i) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{fb.user_name}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                className={cn(
                                  "w-3 h-3", 
                                  fb.rating >= s ? "text-amber-400 fill-amber-400" : "text-slate-200"
                                )} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(fb.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed text-sm">
                    {fb.content}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
