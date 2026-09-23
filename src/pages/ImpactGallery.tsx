import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Award, 
  Video, 
  Image as ImageIcon, 
  Play, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  GraduationCap, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { impactGalleryService } from '../services/impactGalleryService';
import { ImpactGallery } from '../types/impactGallery';
import { useAuth } from '../components/AuthContext';
import { Link } from 'react-router-dom';

export default function ImpactGalleryPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [galleries, setGalleries] = useState<ImpactGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [activeGallery, setActiveGallery] = useState<ImpactGallery | null>(null);

  // Lightbox modal states
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    setLoading(true);
    try {
      const data = await impactGalleryService.getAllGalleries();
      setGalleries(data);
      if (data.length > 0) {
        setActiveGallery(data[0]);
      }
    } catch (err) {
      console.error('Error fetching galleries:', err);
    } finally {
      setLoading(false);
    }
  };

  const provinces = ['All', ...Array.from(new Set(galleries.map(g => g.province).filter(Boolean)))];

  const filteredGalleries = selectedProvince === 'All'
    ? galleries
    : galleries.filter(g => g.province === selectedProvince);

  const getEmbedVideoUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-2/3 right-10 w-[500px] h-[300px] bg-teal-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>YARA Global Outreach & Impact</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Impact <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Galleries</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-medium">
            Explore grassroots achievements, community outreach photos, video highlights, and member engagement statistics across Zimbabwe and beyond.
          </p>

          {isAdmin && (
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Manage Impact Galleries in Admin Console</span>
              </Link>
            </div>
          )}
        </div>

        {/* Filters */}
        {provinces.length > 1 && (
          <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
            {provinces.map(prov => (
              <button
                key={prov}
                onClick={() => setSelectedProvince(prov)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                  selectedProvince === prov
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {prov}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-semibold">Loading Outreach Galleries...</p>
          </div>
        ) : filteredGalleries.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">No Outreach Galleries Found</h3>
            <p className="text-slate-400 text-sm">
              Impact galleries for this location will be published here soon as outreach operations expand.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Gallery Selector Carousel / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGalleries.map(g => {
                const isActive = activeGallery?.id === g.id;
                return (
                  <motion.div
                    key={g.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveGallery(g)}
                    className={`cursor-pointer rounded-3xl p-5 transition-all border ${
                      isActive
                        ? 'bg-slate-900 border-emerald-500 shadow-2xl shadow-emerald-500/10'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-950">
                      <img
                        src={g.cover_image_url || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80'}
                        alt={g.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/70 backdrop-blur-md rounded-full border border-slate-700/50 text-emerald-400 text-xs font-bold flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{g.province}</span>
                      </div>
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-950/70 backdrop-blur-md rounded-full border border-slate-700/50 text-white text-xs font-medium flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        <span>{g.year}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{g.title}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4 font-medium">{g.description}</p>

                    <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-800 text-slate-400">
                      <div className="flex items-center space-x-1.5 text-emerald-400">
                        <Users className="w-4 h-4" />
                        <span>{g.people_reached.toLocaleString()} Reached</span>
                      </div>
                      <div className="flex items-center space-x-1 text-teal-400">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{g.gallery_urls?.length || 0} Photos</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Active Featured Gallery Focus */}
            {activeGallery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={activeGallery.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 space-y-8 shadow-2xl"
              >
                {/* Active Header & Stats */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
                        Featured Outreach
                      </span>
                      <span className="text-slate-400 text-sm font-semibold flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>{activeGallery.province} Province</span>
                      </span>
                      <span className="text-slate-400 text-sm font-semibold flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-teal-400" />
                        <span>Year {activeGallery.year}</span>
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">{activeGallery.title}</h2>
                    {activeGallery.subtitle && (
                      <p className="text-emerald-400 text-sm font-semibold">{activeGallery.subtitle}</p>
                    )}
                    <p className="text-slate-300 text-base max-w-3xl leading-relaxed">{activeGallery.description}</p>
                  </div>

                  {/* Impact Quick Stats Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 min-w-[280px]">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs font-semibold text-slate-400">Total Reached</p>
                      <p className="text-xl font-black text-emerald-400">{activeGallery.people_reached.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs font-semibold text-slate-400">Girls Reached</p>
                      <p className="text-xl font-black text-pink-400">{activeGallery.girls_reached.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs font-semibold text-slate-400">Boys Reached</p>
                      <p className="text-xl font-black text-cyan-400">{activeGallery.boys_reached.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs font-semibold text-slate-400">Schools</p>
                      <p className="text-xl font-black text-indigo-400">{activeGallery.schools_impacted.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Achievements List */}
                {activeGallery.achievements && activeGallery.achievements.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <span>Outreach Key Achievements</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeGallery.achievements.map((ach, idx) => (
                        <div key={idx} className="flex items-start space-x-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/60">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            ✓
                          </div>
                          <p className="text-slate-200 text-sm font-medium">{ach}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Highlight Section */}
                {activeGallery.video_url && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Video className="w-5 h-5 text-rose-400" />
                      <span>Outreach Video Highlight</span>
                    </h4>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video max-w-4xl">
                      {activeGallery.video_url.endsWith('.mp4') || activeGallery.video_url.endsWith('.webm') ? (
                        <video controls className="w-full h-full object-cover">
                          <source src={activeGallery.video_url} />
                          Your browser does not support video playback.
                        </video>
                      ) : (
                        <iframe
                          src={getEmbedVideoUrl(activeGallery.video_url)}
                          title="Outreach Video"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Picture Gallery Showcase */}
                {activeGallery.gallery_urls && activeGallery.gallery_urls.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                        <ImageIcon className="w-5 h-5 text-teal-400" />
                        <span>Outreach Photo Gallery ({activeGallery.gallery_urls.length})</span>
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">Click photo to view full screen</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {activeGallery.gallery_urls.map((picUrl, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setSelectedImageIndex(idx)}
                          className="cursor-pointer aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all relative group"
                        >
                          <img
                            src={picUrl}
                            alt={`Outreach photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3 py-1 bg-slate-900/80 text-white rounded-lg text-xs font-bold border border-slate-700">
                              View
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && activeGallery?.gallery_urls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-6 right-6 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-colors border border-slate-700"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={() => setSelectedImageIndex((prev) => (prev! > 0 ? prev! - 1 : activeGallery.gallery_urls.length - 1))}
              className="absolute left-6 p-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-2xl transition-colors border border-slate-700"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => setSelectedImageIndex((prev) => (prev! < activeGallery.gallery_urls.length - 1 ? prev! + 1 : 0))}
              className="absolute right-6 p-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-2xl transition-colors border border-slate-700"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="max-w-5xl max-h-[85vh] p-2 space-y-3 text-center">
              <img
                src={activeGallery.gallery_urls[selectedImageIndex]}
                alt={`Photo ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[75vh] object-contain mx-auto rounded-2xl border border-slate-800 shadow-2xl"
              />
              <p className="text-slate-400 text-xs font-semibold">
                Photo {selectedImageIndex + 1} of {activeGallery.gallery_urls.length} — {activeGallery.title}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
