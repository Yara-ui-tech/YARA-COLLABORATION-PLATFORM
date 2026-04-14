import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { Lightbulb, Send, Trash2, Clock, MessageSquare, Share2, Heart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Ideas() {
  const { user, profile } = useAuth();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [newIdea, setNewIdea] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIdeas = async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching ideas:', error);
      else setIdeas(data || []);
    };

    fetchIdeas();

    const ideasSubscription = supabase
      .channel('ideas_board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => {
        fetchIdeas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ideasSubscription);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('ideas').insert({
        author_id: user.id,
        author_name: profile?.display_name || 'Anonymous',
        content: newIdea,
      });
      if (error) throw error;
      setNewIdea('');
    } catch (error) {
      console.error('Error adding idea:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('ideas').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl">
        <img 
          src={ASSETS.DASHBOARD_HERO_BG} 
          alt="Ideas Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Idea Board</h2>
            <p className="text-indigo-100 font-medium mt-2">Share your vision and collaborate with the community.</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl text-white font-bold text-sm border border-white/20">
            <Lightbulb className="w-4 h-4" />
            <span>{ideas.length} Ideas Shared</span>
          </div>
        </div>
      </header>

      {/* Post New Idea */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-indigo-50/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {profile?.display_name?.[0] || 'U'}
            </div>
            <span className="font-bold text-slate-900">{profile?.display_name}</span>
          </div>
          <textarea
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="What's your next big innovation?"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium min-h-[150px] resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !newIdea.trim()}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Share Idea</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Ideas List */}
      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg">
                    {idea.author_name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{idea.author_name}</h4>
                    <p className="text-sm text-slate-500 font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(idea.created_at).toLocaleDateString()} at {new Date(idea.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {user?.id === idea.author_id && (
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <p className="text-slate-700 text-lg font-medium leading-relaxed mb-8 whitespace-pre-wrap">
                {idea.content}
              </p>

              <div className="flex items-center space-x-6 pt-6 border-t border-slate-50">
                <button className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>24</span>
                </button>
                <button className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span>8</span>
                </button>
                <button className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
