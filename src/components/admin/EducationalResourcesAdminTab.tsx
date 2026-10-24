import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Upload, Search, FileText, Video, Image as ImageIcon, 
  Download, Trash2, Edit2, ExternalLink, Plus, RefreshCw, 
  CheckCircle2, AlertCircle, Eye, Tag, Globe, Sparkles, Copy, Check, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import ItemCoverDisplay from '../resources/ItemCoverDisplay';

export interface EducationalResource {
  id: string;
  title: string;
  description?: string;
  category: string;
  file_url: string;
  file_type: 'pdf' | 'doc' | 'video' | 'image' | 'presentation' | 'code' | 'other';
  file_size_bytes?: number;
  target_level: string;
  target_age_group: string;
  language: string;
  is_downloadable: boolean;
  is_published: boolean;
  thumbnail_url?: string;
  tags?: string[];
  created_at?: string;
}

const RESOURCE_CATEGORIES = [
  'Robotics & Embedded Systems',
  'Circuit Schematics & Hardware',
  'Firmware & C++ Code Bundles',
  'Python & MicroPython Robotics',
  'AI & Computer Vision Guides',
  'CAD 3D Modeling & Print Files',
  'Teacher Lesson Plans & Rubrics',
  'Competition Rulebooks & Drills',
  'Early Childhood STEM (Ages 3-8)',
  'Renewable Energy & IoT Sensors'
];

const AGE_GROUPS = [
  'All Ages',
  'Ages 3–8 (Early Childhood)',
  'Ages 9–13 (Primary / Junior)',
  'Ages 14–18 (Secondary / High School)',
  'Tertiary / University Students',
  'Teachers, Patrons & Mentors'
];

const DIFFICULTY_LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Masterclass'];
const LANGUAGES = ['English', 'Shona (chiShona)', 'Ndebele (isiNdebele)', 'Swahili', 'French'];

export default function EducationalResourcesAdminTab() {
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedAge, setSelectedAge] = useState('ALL');

  // Form State
  const [form, setForm] = useState<Partial<EducationalResource>>({
    title: '',
    description: '',
    category: 'Robotics & Embedded Systems',
    file_type: 'pdf',
    file_url: '',
    file_size_bytes: 0,
    target_level: 'All Levels',
    target_age_group: 'All Ages',
    language: 'English',
    is_downloadable: true,
    is_published: true,
    thumbnail_url: '',
    tags: []
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.warn('Study materials fetch notice:', error);
      
      const dbItems = (data || []) as EducationalResource[];
      setResources(dbItems);
    } catch (err: any) {
      console.error('Error fetching educational resources:', err);
      setFeedback({ type: 'error', text: err.message || 'Failed to load resources.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return 'Online / Variable';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setForm({
      title: '',
      description: '',
      category: 'Robotics & Embedded Systems',
      file_type: 'pdf',
      file_url: '',
      file_size_bytes: 0,
      target_level: 'All Levels',
      target_age_group: 'All Ages',
      language: 'English',
      is_downloadable: true,
      is_published: true,
      thumbnail_url: '',
      tags: []
    });
    setSelectedFile(null);
    setSelectedCoverFile(null);
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, thumbnail_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateCover = async (id: string, currentUrl: string = '') => {
    const newUrl = window.prompt("Enter new Cover Image URL (Book Cover Page or Video Thumbnail):", currentUrl);
    if (newUrl === null) return;
    try {
      const { error } = await supabase
        .from('study_materials')
        .update({ thumbnail_url: newUrl.trim() || null })
        .eq('id', id);
      if (error) throw error;
      setResources(prev => prev.map(r => r.id === id ? { ...r, thumbnail_url: newUrl.trim() || undefined } : r));
      showToast('success', 'Cover image updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update cover image.');
    }
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      showToast('error', 'Resource title is mandatory.');
      return;
    }

    setIsSaving(true);
    let finalFileUrl = form.file_url || '';
    let finalCoverUrl = form.thumbnail_url || '';
    let finalSizeBytes = form.file_size_bytes || 0;

    try {
      // 1. Upload Cover Image if selected
      if (selectedCoverFile) {
        try {
          const coverExt = selectedCoverFile.name.split('.').pop();
          const coverName = `cover_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${coverExt}`;
          const coverPath = `covers/${coverName}`;

          const { error: coverErr } = await supabase.storage
            .from('materials')
            .upload(coverPath, selectedCoverFile, { upsert: true });

          if (!coverErr) {
            const { data: cUrlData } = supabase.storage
              .from('materials')
              .getPublicUrl(coverPath);
            finalCoverUrl = cUrlData.publicUrl;
          }
        } catch (cErr) {
          console.warn('Cover upload notice, continuing with URL:', cErr);
        }
      }

      // 2. If document file selected, upload to Supabase Storage bucket 'materials'
      if (selectedFile) {
        setUploadProgress(10);
        const fileExt = selectedFile.name.split('.').pop();
        const safeName = `yara_res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
        const filePath = `uploads/${safeName}`;

        const { error: uploadErr } = await supabase.storage
          .from('materials')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadErr) {
          console.warn('Storage upload note:', uploadErr);
          if (!finalFileUrl) throw uploadErr;
        } else {
          const { data: urlData } = supabase.storage
            .from('materials')
            .getPublicUrl(filePath);
          finalFileUrl = urlData.publicUrl;
          finalSizeBytes = selectedFile.size;
        }
        setUploadProgress(80);
      }

      if (!finalFileUrl) {
        showToast('error', 'Please attach a document file or supply a valid web URL.');
        setIsSaving(false);
        return;
      }

      // 3. Insert into study_materials table
      const resourceRecord = {
        title: form.title,
        description: form.description || '',
        category: form.category || 'Robotics & Embedded Systems',
        file_url: finalFileUrl,
        file_type: form.file_type || 'pdf',
        file_size_bytes: finalSizeBytes,
        target_level: form.target_level || 'All Levels',
        target_age_group: form.target_age_group || 'All Ages',
        language: form.language || 'English',
        is_downloadable: form.is_downloadable ?? true,
        is_published: form.is_published ?? true,
        thumbnail_url: finalCoverUrl || null,
        tags: form.tags || []
      };

      const { data, error } = await supabase
        .from('study_materials')
        .insert([resourceRecord])
        .select()
        .single();

      if (error) throw error;

      showToast('success', `Resource "${form.title}" published with cover image to Educational Library!`);
      setIsModalOpen(false);
      fetchResources();
    } catch (err: any) {
      console.error('Save resource error:', err);
      showToast('error', err.message || 'Failed to save educational resource.');
    } finally {
      setIsSaving(false);
      setUploadProgress(null);
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove "${title}" from the educational library?`)) return;

    try {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setResources(prev => prev.filter(r => r.id !== id));
      showToast('success', `Deleted "${title}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete resource.');
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.tags || []).some(t => t.toLowerCase().includes(q));

      const matchCat = selectedCategory === 'ALL' || r.category === selectedCategory;
      const matchType = selectedType === 'ALL' || r.file_type === selectedType;
      const matchAge = selectedAge === 'ALL' || r.target_age_group === selectedAge;

      return matchSearch && matchCat && matchType && matchAge;
    });
  }, [resources, searchQuery, selectedCategory, selectedType, selectedAge]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg",
              feedback.type === 'success' 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{feedback.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>Educational Resource &amp; Media Library</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Upload and manage books with cover pages, video masterclasses with thumbnails, schematics, and code packs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Resource With Cover</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, description, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
            >
              <option value="ALL">All File Types</option>
              <option value="pdf">📖 Books &amp; PDF</option>
              <option value="video">🎬 Videos</option>
              <option value="image">🖼️ Schematics</option>
              <option value="doc">📄 Word Docs</option>
              <option value="code">💻 Code Packs</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 max-w-[200px]"
            >
              <option value="ALL">All Categories</option>
              {RESOURCE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resource Cards Grid with Full Cover Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading educational library items...</span>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No resources found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No learning materials match your active filter. Upload a new PDF book, schematic, or video using the button above.
            </p>
          </div>
        ) : (
          filteredResources.map(res => {
            const sizeStr = formatFileSize(res.file_size_bytes);

            return (
              <div 
                key={res.id} 
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Dedicated Visual Cover Display (Book Cover Page or Video Thumbnail) */}
                  <ItemCoverDisplay
                    type={res.file_type}
                    title={res.title}
                    subtitle={res.description}
                    category={res.category}
                    imageUrl={res.thumbnail_url}
                    fileSize={sizeStr}
                    level={res.target_level || 'All Levels'}
                    duration={res.file_type === 'video' ? 'HD VIDEO' : undefined}
                    className="h-48 w-full"
                    onPlay={() => window.open(res.file_url, '_blank')}
                  />

                  <div className="p-5 space-y-3">
                    {/* Category & Low-Data Size Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {res.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-slate-100 text-slate-700" title="Bandwidth impact">
                        {sizeStr}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-black text-slate-900 text-sm group-hover:text-emerald-700 transition line-clamp-1">
                        {res.title}
                      </h3>
                      {res.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {res.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold text-slate-500 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                        {res.target_level || 'All Levels'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                        {res.language || 'English'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {res.target_age_group || 'All Ages'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(res.file_url, res.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
                      title="Copy Public URL"
                    >
                      {copiedId === res.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={res.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-100/60 transition flex items-center gap-1 cursor-pointer"
                      title="Open or Download Resource"
                    >
                      {res.file_type === 'video' ? <Play className="w-3.5 h-3.5 fill-current" /> : <Download className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{res.file_type === 'video' ? 'Watch' : 'Download'}</span>
                    </a>
                    <button
                      onClick={() => handleUpdateCover(res.id, res.thumbnail_url)}
                      className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition cursor-pointer flex items-center gap-1 text-[11px]"
                      title="Update or change cover image"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Cover</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteResource(res.id, res.title)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Remove Resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal with Live Cover Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Upload Educational Learning Material</h3>
                <p className="text-xs text-slate-500">Provide document file, cover image, and curriculum category.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4 text-xs">
              {/* Live Cover Preview Box in Modal */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Live Cover Preview ({form.file_type === 'video' ? 'Video Cover' : 'Book Cover Page'})
                </label>
                <ItemCoverDisplay
                  type={form.file_type || 'pdf'}
                  title={form.title || 'Resource Title Preview'}
                  subtitle={form.description || 'Description preview...'}
                  category={form.category}
                  imageUrl={form.thumbnail_url}
                  level={form.target_level}
                  className="h-40 w-full rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Embedded C++ Robotics Engineering Handbook (PDF)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Curriculum Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                >
                  {RESOURCE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Age Group</label>
                  <select
                    value={form.target_age_group}
                    onChange={(e) => setForm({ ...form, target_age_group: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    {AGE_GROUPS.map(ag => (
                      <option key={ag} value={ag}>{ag}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty Level</label>
                  <select
                    value={form.target_level}
                    onChange={(e) => setForm({ ...form, target_level: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    {DIFFICULTY_LEVELS.map(dl => (
                      <option key={dl} value={dl}>{dl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Type</label>
                  <select
                    value={form.file_type}
                    onChange={(e) => setForm({ ...form, file_type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="pdf">📖 PDF Document / E-Book</option>
                    <option value="video">🎬 Video Demonstration</option>
                    <option value="image">⚡ Circuit Image / Schematic</option>
                    <option value="presentation">📊 Slide Deck Presentation</option>
                    <option value="code">💻 Source Code Archive (ZIP)</option>
                    <option value="doc">📄 Word / Text Document</option>
                  </select>
                </div>
              </div>

              {/* Cover Image / Thumbnail Upload */}
              <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                <label className="block font-bold text-indigo-950">
                  🖼️ Cover Image / Thumbnail (Book Cover Page or Video Banner)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="w-full px-3 py-2 rounded-xl border border-dashed border-indigo-300 bg-white flex items-center justify-center cursor-pointer hover:bg-indigo-50 transition group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      className="hidden"
                    />
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
                    <span className="text-[11px] font-bold text-indigo-700 truncate max-w-[130px]">
                      {selectedCoverFile ? selectedCoverFile.name : 'Upload Cover Image'}
                    </span>
                  </label>
                  <input
                    type="url"
                    value={form.thumbnail_url || ''}
                    onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                    placeholder="Or Cover Image URL"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* File Attachment / Direct URL */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <label className="block font-bold text-slate-800">
                  Select File from Computer / Device
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {selectedFile && (
                  <p className="text-[11px] text-emerald-700 font-bold">
                    Attached: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}

                <div className="pt-2 border-t border-slate-200">
                  <label className="block font-semibold text-slate-500 text-[11px] mb-1">
                    Or Direct Web URL / Embed Link:
                  </label>
                  <input
                    type="url"
                    value={form.file_url}
                    onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                    placeholder="https://... (Drive link, YouTube link, or hosted PDF)"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description &amp; Learning Outcomes</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Outline topics covered and practical relevance for African learners..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save &amp; Publish with Cover</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
