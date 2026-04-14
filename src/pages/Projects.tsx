import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { Briefcase, Plus, Trash2, ExternalLink, Tag, TrendingUp, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import PlaceholderImage from '../components/PlaceholderImage';

export default function Projects() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    tags: '',
    progress: 0,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching projects:', error);
      else setProjects(data || []);
    };

    fetchProjects();

    const projectsSubscription = supabase
      .channel('projects_showcase')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectsSubscription);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('projects').insert({
        owner_id: user.id,
        owner_name: profile?.display_name || 'Anonymous',
        title: formData.title,
        description: formData.description,
        image_url: formData.imageUrl || null,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        progress: Number(formData.progress),
      });
      if (error) throw error;
      setIsAdding(false);
      setFormData({ title: '', description: '', imageUrl: '', tags: '', progress: 0 });
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl">
        <img 
          src={ASSETS.EVENT_PLACEHOLDER} 
          alt="Projects Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Project Showcase</h2>
            <p className="text-slate-300 font-medium mt-2">Discover and track the progress of innovative projects.</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Showcase Project</span>
          </button>
        </div>
      </header>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">New Project</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                    placeholder="e.g., Solar Powered Irrigation System"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium min-h-[120px] resize-none"
                    placeholder="Describe your project, its goals, and current status..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                      placeholder="Robotics, AI, Solar"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Image URL (optional)</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-8 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Showcase Project</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-50 transition-all group"
          >
            <div className="relative h-56 overflow-hidden">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <PlaceholderImage text={project.title} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex space-x-2">
                {user?.id === project.owner_id && (
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-xl hover:bg-red-600 hover:text-white shadow-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags?.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
              <p className="text-slate-600 font-medium line-clamp-3 mb-6 leading-relaxed">
                {project.description}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-500 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                    Progress
                  </span>
                  <span className="text-slate-900">{project.progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {project.owner_name?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{project.owner_name}</span>
                </div>
                <button className="text-indigo-600 font-bold text-sm flex items-center space-x-1 hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
