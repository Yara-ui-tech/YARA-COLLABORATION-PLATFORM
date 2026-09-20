import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Star, Loader2, CheckCircle2, User, Clock, Users, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Feedback() {
  const { user, profile } = useAuth();
  const [activeType, setActiveType] = useState<'feedback' | 'testimonial'>('feedback');
  
  // Feedback / Testimonial State
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const { data: fbData } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (fbData) setFeedbacks(fbData);

        const { data: testData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (testData && testData.length > 0) {
          setTestimonials(testData);
        } else {
          setTestimonials([
            {
              id: 't-1',
              author_name: 'Farai M.',
              author_role: 'Robotics Innovator (Tier 4)',
              rating: 5,
              category: 'Platform Experience',
              content: 'YARA has completely transformed my approach to microcontroller coding and hardware prototyping!'
            },
            {
              id: 't-2',
              author_name: 'Chipo K.',
              author_role: 'STEM Educator & Teacher',
              rating: 5,
              category: 'Educator Tools',
              content: 'The AI lesson plan generator and bootcamp modules saved me dozens of hours every week.'
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching feedback/testimonials:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    
    setLoading(true);
    try {
      if (activeType === 'feedback') {
        const { error } = await supabase.from('feedback').insert({
          user_id: user.id,
          user_name: profile?.display_name || 'Anonymous',
          content,
          rating
        });
        if (error) throw error;
        setFeedbacks(prev => [{ id: Date.now(), user_name: profile?.display_name || 'Anonymous', content, rating, created_at: new Date().toISOString() }, ...prev]);
      } else {
        const { error } = await supabase.from('testimonials').insert({
          user_id: user.id,
          author_name: profile?.display_name || 'YARA Innovator',
          author_role: profile?.role === 'teacher' ? 'STEM Educator' : profile?.role === 'mentor' ? 'YARA Mentor' : 'Robotics Innovator',
          category,
          content,
          rating,
          is_approved: true,
          is_featured: true
        });
        if (error) throw error;
        setTestimonials(prev => [{ id: Date.now(), author_name: profile?.display_name || 'YARA Innovator', author_role: profile?.role === 'teacher' ? 'STEM Educator' : 'Robotics Innovator', content, rating }, ...prev]);
      }

      setSubmitted(true);
      setContent('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      <header className="space-y-2">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-4 h-4" />
          <span>Innovator &amp; Educator Voice</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Community Feedback &amp; Testimonials
        </h2>
        <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl">
          Share your feedback, report suggestions, or leave a testimonial for the YARA Robotics ecosystem.
        </p>
      </header>

      {/* Switcher Pills */}
      <div className="flex space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveType('feedback')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all ${activeType === 'feedback' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Submit Platform Feedback</span>
        </button>
        <button
          onClick={() => setActiveType('testimonial')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all ${activeType === 'testimonial' ? 'bg-pink-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Heart className="w-4 h-4 text-pink-200" />
          <span>Share a Testimonial / Story</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl text-center sticky top-8"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                  {activeType === 'testimonial' ? 'Your testimonial has been submitted and shared with the YARA community!' : 'Your feedback has been logged for our dev team.'}
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 transition-all text-xs"
                >
                  Submit Another
                </button>
              </motion.div>
            ) : (
              <motion.section 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm sticky top-8 space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {activeType === 'feedback' ? 'Send Feedback' : 'Write Testimonial'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeType === 'feedback' ? 'Tell us how we can improve YARA.' : 'How has YARA helped your journey?'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            rating >= star ? "text-amber-400 bg-amber-50" : "text-slate-300 bg-slate-50 hover:bg-slate-100"
                          )}
                        >
                          <Star className={cn("w-5 h-5", rating >= star && "fill-amber-400")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeType === 'testimonial' && (
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      >
                        <option value="General STEM">General STEM &amp; Platform</option>
                        <option value="Robotics Competitions">Robotics Competitions</option>
                        <option value="Educator Tools">AI Educator Tools</option>
                        <option value="Mentorship">Mentorship &amp; Hardware</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Your Message</label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={activeType === 'feedback' ? 'Write your thoughts or bug report...' : 'Share your testimonial experience with YARA...'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:border-indigo-600 font-medium min-h-[140px] text-xs leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 text-xs uppercase tracking-wider"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>{activeType === 'feedback' ? 'Submit Feedback' : 'Post Testimonial'}</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Display List Column */}
        <div className="lg:col-span-2 space-y-6">
          {activeType === 'feedback' ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <span>Recent Platform Feedback</span>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full">{feedbacks.length} Submissions</span>
              </h3>

              {fetching ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">Loading feedback...</div>
              ) : feedbacks.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">No feedback submissions yet. Be the first!</div>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{fb.user_name || 'Innovator'}</span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">{fb.content}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <span>Community Testimonials &amp; Stories</span>
                <span className="text-xs bg-pink-50 text-pink-700 font-bold px-3 py-1 rounded-full">{testimonials.length} Stories</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-pink-600 uppercase bg-pink-50 px-2.5 py-0.5 rounded-full">{t.category || 'Testimonial'}</span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-800 text-xs italic font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl">
                        "{t.content}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{t.author_name}</p>
                        <p className="text-[10px] text-slate-400">{t.author_role}</p>
                      </div>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
