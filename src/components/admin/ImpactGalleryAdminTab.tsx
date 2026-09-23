import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Trash2, Edit2, Save, Eye, Video, Image as ImageIcon,
  CheckCircle2, X, Loader2, Sparkles, Filter, Award, MapPin, Calendar,
  Globe, ExternalLink, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImpactGallery } from '../../types/impactGallery';
import { 
  getImpactGalleries, 
  saveImpactGallery, 
  deleteImpactGallery 
} from '../../services/impactGalleryService';
import ImageUploader from '../ImageUploader';
import { getEmbeddableVideoUrl } from '../../services/organizationPostsService';

const PROVINCES = [
  'Mashonaland West',
  'Harare',
  'Bulawayo',
  'Manicaland',
  'Midlands',
  'Masvingo',
  'Mashonaland East',
  'Mashonaland Central',
  'Matabeleland North',
  'Matabeleland South'
];

export default function ImpactGalleryAdminTab() {
  const [galleries, setGalleries] = useState<ImpactGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ImpactGallery | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ImpactGallery>>({
    title: '',
    subtitle: '',
    province: 'Mashonaland West',
    year: 2025,
    description: '',
    cover_image_url: '',
    video_url: '',
    gallery_urls: [],
    achievements: [],
    people_reached: 450,
    girls_reached: 280,
    boys_reached: 170,
    schools_impacted: 14,
    is_featured: true
  });

  // Bulk Gallery Images & Achievements string inputs
  const [galleryText, setGalleryText] = useState('');
  const [achievementsText, setAchievementsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    setLoading(true);
    try {
      const data = await getImpactGalleries();
      setGalleries(data);
    } catch (err) {
      console.warn('Error loading galleries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '2026 Impact Outreach: Provincial STEM & Robotics',
      subtitle: 'Hands-On Robotics & AI Bootcamp',
      province: 'Mashonaland West',
      year: 2026,
      description: 'Interactive STEM workshops, micro-rover assembly, and AI pedagogy training for students and teachers.',
      cover_image_url: '',
      video_url: '',
      gallery_urls: [],
      achievements: ['100+ Youth Trained in ESP32 Assembly', 'Gender-balanced STEM team participation'],
      people_reached: 250,
      girls_reached: 140,
      boys_reached: 110,
      schools_impacted: 8,
      is_featured: true
    });
    setGalleryText('');
    setAchievementsText('100+ Youth Trained in ESP32 Assembly\nGender-balanced STEM team participation');
    setShowModal(true);
  };

  const handleOpenEdit = (gal: ImpactGallery) => {
    setEditingItem(gal);
    setFormData({ ...gal });
    setGalleryText((gal.gallery_urls || []).join('\n'));
    setAchievementsText((gal.achievements || []).join('\n'));
    setShowModal(true);
  };

  const handleAddSingleGalleryImage = (url: string) => {
    if (!url.trim()) return;
    const current = galleryText.trim() ? galleryText.split('\n') : [];
    if (!current.includes(url.trim())) {
      const updated = [...current, url.trim()].join('\n');
      setGalleryText(updated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.description?.trim()) {
      alert('Please fill in title and description.');
      return;
    }

    setSaving(true);
    try {
      const parsedGallery = galleryText
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const parsedAchievements = achievementsText
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const payload: Partial<ImpactGallery> = {
        ...formData,
        id: editingItem ? editingItem.id : undefined,
        gallery_urls: parsedGallery,
        achievements: parsedAchievements
      };

      await saveImpactGallery(payload);
      setMsg({ type: 'success', text: 'Impact gallery saved successfully!' });
      setShowModal(false);
      loadGalleries();
      setTimeout(() => setMsg(null), 3500);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save impact gallery.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this impact gallery permanently?')) return;
    try {
      await deleteImpactGallery(id);
      setMsg({ type: 'success', text: 'Impact gallery deleted.' });
      loadGalleries();
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Deletion failed.' });
    }
  };

  const filtered = galleries.filter(g => 
    selectedProvince === 'all' || g.province.toLowerCase() === selectedProvince.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" /> Provincial Outreach Media & Metrics Engine
          </div>
          <h2 className="text-xl font-black">Impact Outreach Gallery Management</h2>
          <p className="text-xs text-slate-300">
            Publish and manage provincial outreach achievements, photo galleries, video masterclasses, and beneficiary metrics.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Outreach Gallery
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedProvince('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            selectedProvince === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Provinces ({galleries.length})
        </button>
        {PROVINCES.map(p => {
          const count = galleries.filter(g => g.province.toLowerCase() === p.toLowerCase()).length;
          return (
            <button
              key={p}
              onClick={() => setSelectedProvince(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedProvince === p ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium text-xs">
          Loading provincial impact galleries...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Impact Galleries Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Add New Outreach Gallery" to upload pictures, video URLs, and student metrics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(gal => (
            <div 
              key={gal.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Banner / Cover */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  {gal.cover_image_url ? (
                    <img 
                      src={gal.cover_image_url} 
                      alt={gal.title} 
                      className="w-full h-full object-cover opacity-90" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-amber-300 font-black text-[10px] uppercase tracking-wider rounded-full border border-amber-500/30">
                    {gal.province} • {gal.year}
                  </span>
                  {gal.video_url && (
                    <span className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full shadow-lg">
                      <Video className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{gal.title}</h3>
                    {gal.subtitle && (
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">{gal.subtitle}</p>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{gal.description}</p>

                  {/* Impact Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-[10px]">
                    <div className="p-2 bg-indigo-50/70 rounded-xl">
                      <span className="font-black text-indigo-900 text-xs block">{gal.people_reached || 0}</span>
                      <span className="text-indigo-600 font-semibold uppercase">Total Reached</span>
                    </div>
                    <div className="p-2 bg-pink-50/70 rounded-xl">
                      <span className="font-black text-pink-900 text-xs block">{gal.girls_reached || 0}</span>
                      <span className="text-pink-600 font-semibold uppercase">Girls</span>
                    </div>
                    <div className="p-2 bg-emerald-50/70 rounded-xl">
                      <span className="font-black text-emerald-900 text-xs block">{gal.schools_impacted || 0}</span>
                      <span className="text-emerald-600 font-semibold uppercase">Schools</span>
                    </div>
                  </div>

                  {/* Gallery Pictures Count */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                      {gal.gallery_urls?.length || 0} Photos
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-emerald-500" />
                      {gal.achievements?.length || 0} Highlights
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEdit(gal)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Gallery
                </button>

                <button
                  onClick={() => handleDelete(gal.id)}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-200 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{editingItem ? 'Edit Impact Gallery' : 'Create New Impact Gallery'}</h3>
                    <p className="text-xs text-slate-300">Upload bulk photo URLs, videos, metrics, and achievements.</p>
                  </div>
                </div>

                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-800 block mb-1">Gallery Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. 2025 Impact Outreach: Mashwest Province Gallery"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Subtitle / Target Cities</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="e.g. Chinhoyi, Karoi & Banket Bootcamp"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Province</label>
                    <select
                      value={formData.province}
                      onChange={e => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white"
                    >
                      {PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide background context on the robotics outreach program, target schools, and hands-on activities..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
                  />
                </div>

                {/* Primary Cover Image Uploader */}
                <ImageUploader
                  label="Primary Cover Picture (File Upload or URL)"
                  value={formData.cover_image_url || ''}
                  onChange={url => setFormData({ ...formData, cover_image_url: url })}
                  bucket="chapter-media"
                  placeholder="https://... or upload main banner photo"
                />

                {/* Video URL */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Outreach Video URL (YouTube, Vimeo, Cloud MP4)</label>
                  <input
                    type="text"
                    value={formData.video_url || ''}
                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
                  />
                </div>

                {/* Bulk Gallery Photos List */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 block">
                    Bulk Picture URLs (One URL per line)
                  </label>
                  
                  {/* Quick Add helper using ImageUploader */}
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-900 block">Quick Photo Upload Helper:</span>
                    <ImageUploader
                      label="Upload Single Photo to append to Bulk List"
                      value=""
                      onChange={handleAddSingleGalleryImage}
                      bucket="chapter-media"
                      placeholder="Click upload to add a new photo to the list below"
                    />
                  </div>

                  <textarea
                    rows={5}
                    value={galleryText}
                    onChange={e => setGalleryText(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1.jpg&#10;https://images.unsplash.com/photo-2.jpg&#10;https://images.unsplash.com/photo-3.jpg"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-400">Enter each image URL on a new line or use the helper box above to upload files.</p>
                </div>

                {/* Achievements List */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Key Achievements & Highlights (One per line)</label>
                  <textarea
                    rows={3}
                    value={achievementsText}
                    onChange={e => setAchievementsText(e.target.value)}
                    placeholder="450+ Youth Trained in ESP32 Micro-Rover Fabrication&#10;62% Female Student Participation Rate&#10;12 High School Clubs Chartered"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
                  />
                </div>

                {/* Metrics Grid */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-black text-slate-900 text-xs uppercase tracking-wider block">Beneficiary & Outreach Numbers</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Total Reached</label>
                      <input
                        type="number"
                        value={formData.people_reached}
                        onChange={e => setFormData({ ...formData, people_reached: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Girls Reached</label>
                      <input
                        type="number"
                        value={formData.girls_reached}
                        onChange={e => setFormData({ ...formData, girls_reached: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-pink-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Boys Reached</label>
                      <input
                        type="number"
                        value={formData.boys_reached}
                        onChange={e => setFormData({ ...formData, boys_reached: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-indigo-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Schools Impacted</label>
                      <input
                        type="number"
                        value={formData.schools_impacted}
                        onChange={e => setFormData({ ...formData, schools_impacted: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-emerald-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Saving...' : 'Save Gallery'}</span>
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
