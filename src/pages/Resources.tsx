import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Code, Cpu, Zap, ArrowRight, Star, Play, Upload, FileText, Video, Trash2, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthContext';
import PlaceholderImage from '../components/PlaceholderImage';

interface StudyMaterial {
  id: string;
  mentor_id: string;
  mentor_name: string;
  title: string;
  description: string;
  file_url: string;
  file_type: 'pdf' | 'doc' | 'video' | 'other';
  thumbnail_url?: string;
  created_at: string;
}

const simulationTools = [
  {
    id: '1',
    title: 'Webots',
    description: 'A free and open-source 3D robot simulator used in industry, education and research.',
    url: 'https://cyberbotics.com/',
    tags: ['3D', 'Open Source', 'Industry Standard'],
    image: null
  },
  {
    id: '2',
    title: 'Gazebo',
    description: 'A powerful 3D multi-robot simulator with a robust physics engine and high-quality graphics.',
    url: 'https://gazebosim.org/',
    tags: ['ROS', 'Physics', 'Advanced'],
    image: null
  },
  {
    id: '3',
    title: 'Tinkercad Circuits',
    description: 'A simple, online tool for simulating Arduino and electronic circuits.',
    url: 'https://www.tinkercad.com/circuits',
    tags: ['Beginner', 'Online', 'Arduino'],
    image: null
  },
  {
    id: '4',
    title: 'V-REP (CoppeliaSim)',
    description: 'A versatile robot simulator with integrated development environment.',
    url: 'https://www.coppeliarobotics.com/',
    tags: ['Versatile', 'IDE', 'Research'],
    image: null
  }
];

export default function Resources() {
  const { user, profile } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Upload form state
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    file_type: 'pdf' as const,
    file_url: '', // Added URL fallback
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!selectedFile && !newMaterial.file_url) {
      alert('Please select a file to upload or provide a direct link.');
      return;
    }

    setUploading(true);
    try {
      let finalFileUrl = newMaterial.file_url;

      // 1. Upload file to storage if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(filePath, selectedFile);

        if (uploadError) {
          if (uploadError.message.includes('bucket not found')) {
            throw new Error('The "materials" storage bucket has not been created in Supabase yet. Please use the "Resource URL" field instead or contact an admin.');
          }
          throw uploadError;
        }

        // 2. Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('materials')
          .getPublicUrl(filePath);
        
        finalFileUrl = publicUrl;
      }

      // determine file type if using a link and no file selected
      let finalFileType = newMaterial.file_type;
      if (!selectedFile && finalFileUrl) {
        const urlLower = finalFileUrl.toLowerCase();
        if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be') || urlLower.includes('tiktok.com') || urlLower.includes('vimeo.com')) {
          finalFileType = 'video';
        } else if (urlLower.endsWith('.pdf')) {
          finalFileType = 'pdf';
        } else if (urlLower.endsWith('.doc') || urlLower.endsWith('.docx')) {
          finalFileType = 'doc';
        } else {
          finalFileType = newMaterial.file_type || 'other';
        }
      }

      // 3. Save to database
      const { error: dbError } = await supabase
        .from('study_materials')
        .insert({
          mentor_id: user.id,
          mentor_name: profile?.display_name || 'Anonymous Mentor',
          title: newMaterial.title,
          description: newMaterial.description,
          file_url: finalFileUrl,
          file_type: finalFileType,
        });

      if (dbError) throw dbError;

      // Reset and refresh
      setShowUploadModal(false);
      setNewMaterial({ title: '', description: '', file_type: 'pdf', file_url: '' });
      setSelectedFile(null);
      fetchMaterials();
      alert('Resource uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading material:', error);
      alert(error.message || 'Failed to upload material. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, fileUrl: string) {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      // 1. Delete from storage (extract path from URL)
      const path = fileUrl.split('materials/').pop();
      if (path) {
        await supabase.storage.from('materials').remove([path]);
      }

      // 2. Delete from database
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMaterials(materials.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  }

  return (
    <div className="space-y-12 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Learning Hub</h2>
          <p className="text-slate-500 font-medium">Access study materials, videos, and simulation tools.</p>
        </div>
        
        {(profile?.role === 'mentor' || profile?.role === 'admin') && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center space-x-2 self-start"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Resource</span>
          </button>
        )}
      </header>

      {/* Mentor Materials Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Mentor Study Materials</span>
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : materials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-50 transition-all group"
              >
                <div className="h-40 relative">
                  {material.thumbnail_url ? (
                    <img
                      src={material.thumbnail_url}
                      alt={material.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <PlaceholderImage text={material.file_type} type="resource" />
                  )}
                  <div className="absolute top-4 right-4">
                    {material.file_type === 'video' ? (
                      <div className="bg-red-500 text-white p-2 rounded-xl shadow-lg">
                        <Video className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="bg-indigo-500 text-white p-2 rounded-xl shadow-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                      {material.file_type}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(material.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-slate-900 mb-2 line-clamp-1">{material.title}</h4>
                  <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 h-10">
                    {material.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-indigo-600 font-bold text-sm hover:translate-x-1 transition-transform"
                    >
                      <span>{material.file_type === 'video' ? 'Watch Now' : 'Download'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    
                    {user?.id === material.mentor_id && (
                      <button
                        onClick={() => handleDelete(material.id, material.file_url)}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {material.mentor_name[0]}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      By {material.mentor_name}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-slate-900 mb-2">No materials yet</h4>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              Check back later or ask your mentor to upload some study resources.
            </p>
          </div>
        )}
      </section>

      {/* Static Simulation Tools Section */}
      <section className="space-y-8">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
          <Zap className="w-6 h-6 text-indigo-600" />
          <span>Simulation Tools</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {simulationTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-50 transition-all group"
            >
              <div className="h-48 overflow-hidden relative">
                {tool.image ? (
                  <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <PlaceholderImage type="resource" text={tool.title} />
                )}
                <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg">
                  <Play className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{tool.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-6 line-clamp-2">
                  {tool.description}
                </p>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-indigo-600 font-bold hover:translate-x-1 transition-transform"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploading && setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 relative z-10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Upload Resource</h3>
              
              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                    placeholder="e.g., Introduction to Robotics PDF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium h-24 resize-none"
                    placeholder="Briefly describe what this resource covers..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Type</label>
                    <select
                      value={newMaterial.file_type}
                      onChange={(e) => setNewMaterial({ ...newMaterial, file_type: e.target.value as any })}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video Lesson</option>
                      <option value="doc">Word Doc</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Upload File</label>
                    <label className="w-full px-6 py-4 rounded-2xl border border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 mr-2" />
                      <span className="text-sm font-bold text-slate-500 truncate max-w-[100px]">
                        {selectedFile ? selectedFile.name : 'Select File'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="bg-white px-4 text-slate-400">Or provide a link</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Resource URL</label>
                  <input
                    type="url"
                    value={newMaterial.file_url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, file_url: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                    placeholder="https://example.com/resource.pdf"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 ml-1">
                    Use this if you have a link to a Google Drive file, YouTube video, or external PDF.
                  </p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || (!selectedFile && !newMaterial.file_url)}
                    className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Upload Resource</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
