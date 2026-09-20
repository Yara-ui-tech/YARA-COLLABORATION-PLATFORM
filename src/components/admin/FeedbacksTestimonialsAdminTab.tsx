import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  MessageSquare, Star, CheckCircle2, Trash2, Heart, 
  ShieldCheck, Loader2, Sparkles, Filter, Eye
} from 'lucide-react';

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  rating: number;
  category: string;
  content: string;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
}

interface UserFeedback {
  id: string;
  user_name?: string;
  user_email?: string;
  category?: string;
  rating?: number;
  message: string;
  created_at: string;
}

export default function FeedbacksTestimonialsAdminTab() {
  const [activeSubTab, setActiveSubTab] = useState<'testimonials' | 'feedback'>('testimonials');
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: testData } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (testData && testData.length > 0) {
        setTestimonials(testData);
      } else {
        // Fallback default testimonials
        setTestimonials([
          {
            id: 't-1',
            author_name: 'Farai M.',
            author_role: 'Robotics Innovator (Tier 4)',
            rating: 5,
            category: 'Platform Experience',
            content: 'YARA has completely transformed my approach to microcontroller coding and hardware prototyping!',
            is_featured: true,
            is_approved: true,
            created_at: new Date().toISOString()
          },
          {
            id: 't-2',
            author_name: 'Chipo K.',
            author_role: 'STEM Educator & Teacher',
            rating: 5,
            category: 'Educator Tools',
            content: 'The AI lesson plan generator and bootcamp modules saved me dozens of hours every week.',
            is_featured: true,
            is_approved: true,
            created_at: new Date().toISOString()
          }
        ]);
      }

      const { data: fbData } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (fbData && fbData.length > 0) {
        setFeedbacks(fbData);
      }
    } catch (e) {
      console.warn('Error loading admin feedbacks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleApproveTestimonial = async (id: string, currentApproved: boolean) => {
    try {
      await supabase
        .from('testimonials')
        .update({ is_approved: !currentApproved })
        .eq('id', id);

      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, is_approved: !currentApproved } : t));
    } catch (e) {
      console.error('Error toggling approval:', e);
    }
  };

  const toggleFeatureTestimonial = async (id: string, currentFeatured: boolean) => {
    try {
      await supabase
        .from('testimonials')
        .update({ is_featured: !currentFeatured })
        .eq('id', id);

      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, is_featured: !currentFeatured } : t));
    } catch (e) {
      console.error('Error toggling featured:', e);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await supabase.from('testimonials').delete().eq('id', id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error('Error deleting testimonial:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-200">
            <MessageSquare className="w-4 h-4" />
            <span>Community Feedback &amp; Reviews</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Feedbacks &amp; Testimonials Center</h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl">
            Review user feedback reports, feature community testimonials on the homepage, and monitor user satisfaction.
          </p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('testimonials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeSubTab === 'testimonials' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Heart className="w-4 h-4" />
          <span>User Testimonials ({testimonials.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeSubTab === 'feedback' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>System Feedback Logs ({feedbacks.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading user feedbacks...</div>
      ) : activeSubTab === 'testimonials' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl bg-white border-2 transition-all space-y-4 shadow-sm ${item.is_featured ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-200'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{item.author_name}</h4>
                  <p className="text-slate-500 text-xs">{item.author_role}</p>
                </div>
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>

              <p className="text-slate-700 text-xs italic bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed font-medium">
                "{item.content}"
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleApproveTestimonial(item.id, item.is_approved)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${item.is_approved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {item.is_approved ? 'Approved ✓' : 'Approve'}
                  </button>
                  <button
                    onClick={() => toggleFeatureTestimonial(item.id, item.is_featured)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${item.is_featured ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {item.is_featured ? 'Featured on Home ⭐' : 'Feature'}
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteTestimonial(item.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center text-slate-400 border border-slate-200">
              No feedback submissions logged yet.
            </div>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span className="text-indigo-600 font-bold">{fb.user_name || 'Anonymous User'}</span>
                  <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-800 text-xs font-medium leading-relaxed">{fb.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
