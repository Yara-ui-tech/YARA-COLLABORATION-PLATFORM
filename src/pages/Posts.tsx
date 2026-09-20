import React, { useEffect, useState } from 'react';
import { 
  Globe, Radio, ThumbsUp, Share2,
  Search, Pin, ExternalLink, Loader2, ArrowRight, Check, Copy,
  Play, Video, Image as ImageIcon, FileText, Download, Eye, X,
  MessageCircle, ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { OrganizationPost, SocialBroadcastConfig } from '../types/organizationPosts';
import { 
  getOrganizationPosts, 
  likeOrganizationPost, 
  getSocialBroadcastConfig, 
  generateSocialShareLinks,
  getEmbeddableVideoUrl
} from '../services/organizationPostsService';
import { cn } from '../lib/utils';

export default function Posts() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<OrganizationPost[]>([]);
  const [config, setConfig] = useState<SocialBroadcastConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<OrganizationPost | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const [allPosts, broadcastConfig] = await Promise.all([
        getOrganizationPosts(),
        getSocialBroadcastConfig()
      ]);
      setPosts(allPosts);
      setConfig(broadcastConfig);
    } catch (e) {
      console.warn('Posts fetch warning:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedPosts.includes(postId)) return;
    setLikedPosts(prev => [...prev, postId]);
    const newCount = await likeOrganizationPost(postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newCount } : p));
  };

  const handleCopyLink = (post: OrganizationPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.origin + '/posts#' + post.id;
    navigator.clipboard.writeText(url);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadImage = async (url: string, filename: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: open in new tab for manual save
      window.open(url, '_blank');
    }
  };

  const openLightbox = (url: string, alt: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxUrl(url);
    setLightboxAlt(alt);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <header className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-12 overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Official YARA Broadcasts & Feed</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Organization News, Insights & Stories
          </h1>

          <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed">
            Stay up to date with official championship announcements, hardware innovation breakthroughs, regional outreach, and student robotics triumphs across Africa.
          </p>

          {profile?.role === 'admin' && (
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-lg shadow-indigo-500/25 transition-all"
              >
                <span>Admin: Create New Announcement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'announcement', label: 'Announcements' },
            { id: 'event_update', label: 'Competitions & Events' },
            { id: 'achievement', label: 'Youth Achievements' },
            { id: 'press_release', label: 'Press Releases' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all",
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white border border-slate-100 text-slate-600 hover:bg-slate-50"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search news or #tags..."
            className="w-full bg-white border border-slate-100 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-medium">Loading organization updates...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-16 text-center space-y-3">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Globe className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Articles Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {searchQuery ? `No posts matched "${searchQuery}". Try a different search keyword.` : 'Check back shortly for upcoming organization press releases.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => {
            const shareLinks = config ? generateSocialShareLinks(post, config) : null;
            const isLiked = likedPosts.includes(post.id);

            return (
              <motion.article
                key={post.id}
                id={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
              >
                {post.is_pinned && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black uppercase px-4 py-1 rounded-bl-2xl flex items-center space-x-1 shadow-sm z-10">
                    <Pin className="w-3 h-3" />
                    <span>Pinned</span>
                  </div>
                )}

                {/* ── Full-width image at top ── */}
                {post.image_url && (
                  <div className="relative w-full rounded-t-[2.5rem] overflow-hidden bg-slate-100 border-b border-slate-100">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-auto max-h-[420px] object-contain bg-white"
                      referrerPolicy="no-referrer"
                    />
                    {/* Hover overlay — image actions */}
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); openLightbox(post.image_url!, post.title); }}
                        className="p-2.5 bg-white/90 hover:bg-white rounded-xl text-slate-800 shadow-lg transition-all scale-90 group-hover:scale-100"
                        title="View full image"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDownloadImage(post.image_url!, `yara-post-${post.id}.jpg`, e)}
                        className="p-2.5 bg-white/90 hover:bg-white rounded-xl text-slate-800 shadow-lg transition-all scale-90 group-hover:scale-100"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    {post.video_url && (
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!post.image_url && post.video_url && (
                  <div className="w-full h-48 rounded-t-[2.5rem] overflow-hidden bg-slate-900 border-b border-slate-800 flex flex-col items-center justify-center text-white space-y-2">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">Watch Video Release</span>
                  </div>
                )}

                {/* ── Post body ── */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {post.category.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {post.media_type === 'video' && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          <Video className="w-3 h-3" />
                          <span>Video Broadcast</span>
                        </span>
                      )}
                      {post.media_type === 'gallery' && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          <ImageIcon className="w-3 h-3" />
                          <span>Photo Gallery ({post.gallery_urls?.length || 0})</span>
                        </span>
                      )}
                      {post.attachments && post.attachments.length > 0 && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <FileText className="w-3 h-3" />
                          <span>Document Attached</span>
                        </span>
                      )}
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Card footer ── */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                    <div className="text-xs font-bold text-slate-600">{post.author_name}</div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleLike(post.id, e)}
                        className={cn(
                          "flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                          isLiked
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                        )}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.likes_count || 0}</span>
                      </button>

                      {/* Share button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(post, e)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 rounded-xl text-xs font-bold transition-all"
                        title="Copy share link"
                      >
                        {copiedId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copiedId === post.id ? 'Copied' : 'Share'}</span>
                      </button>

                      {/* Download image if available */}
                      {post.image_url && (
                        <button
                          type="button"
                          onClick={(e) => handleDownloadImage(post.image_url!, `yara-post-${post.id}.jpg`, e)}
                          className="p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-xl transition-colors"
                          title="Download image"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                        className="p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-xl transition-colors"
                        title="Read full post"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Full Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-2xl w-full shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-wider">
                  {selectedPost.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {new Date(selectedPost.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {selectedPost.title}
              </h2>

              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
                <span>Published by {selectedPost.author_name}</span>
              </div>

              {/* Embedded Video */}
              {selectedPost.video_url && (
                <div className="rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg aspect-video">
                  {(() => {
                    const embedUrl = getEmbeddableVideoUrl(selectedPost.video_url);
                    if (embedUrl) {
                      return (
                        <iframe
                          src={embedUrl}
                          title={selectedPost.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }
                    return (
                      <video 
                        src={selectedPost.video_url} 
                        controls 
                        className="w-full h-full"
                      />
                    );
                  })()}
                </div>
              )}

              {/* Cover Image (if no video) — full image, no cropping */}
              {!selectedPost.video_url && selectedPost.image_url && (
                <div className="rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 relative group/imgblock">
                  <img
                    src={selectedPost.image_url}
                    alt={selectedPost.title}
                    className="w-full h-auto object-contain max-h-[600px] bg-white"
                    referrerPolicy="no-referrer"
                  />
                  {/* Action overlay */}
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover/imgblock:opacity-100 transition-opacity">
                    <button
                      onClick={() => openLightbox(selectedPost.image_url!, selectedPost.title)}
                      className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm"
                    >
                      <ZoomIn className="w-3.5 h-3.5" /> Full View
                    </button>
                    <button
                      onClick={() => handleDownloadImage(selectedPost.image_url!, `yara-${selectedPost.id}.jpg`)}
                      className="px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Gallery — full images in masonry-like grid */}
              {selectedPost.gallery_urls && selectedPost.gallery_urls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Photo Story & Event Gallery ({selectedPost.gallery_urls.length} photos)</h4>
                    <button
                      onClick={() => {
                        selectedPost.gallery_urls!.forEach((url, i) => {
                          setTimeout(() => handleDownloadImage(url, `yara-gallery-${i + 1}.jpg`), i * 400);
                        });
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Download All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPost.gallery_urls.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 group/gitem cursor-pointer"
                        onClick={() => openLightbox(imgUrl, `${selectedPost.title} — Photo ${i + 1}`)}
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery ${i + 1}`}
                          className="w-full h-auto max-h-[320px] object-contain bg-white"
                          referrerPolicy="no-referrer"
                        />
                        {/* Per-image action overlay */}
                        <div className="absolute inset-0 bg-slate-950/0 group-hover/gitem:bg-slate-950/25 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover/gitem:opacity-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); openLightbox(imgUrl, `${selectedPost.title} — Photo ${i + 1}`); }}
                            className="p-2 bg-white/90 rounded-xl shadow text-slate-800"
                            title="View full"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadImage(imgUrl, `yara-gallery-${i + 1}.jpg`); }}
                            className="p-2 bg-white/90 rounded-xl shadow text-slate-800"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
                          {i + 1} / {selectedPost.gallery_urls!.length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm md:text-base text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </div>

              {/* Attached Documents / Press Release PDFs */}
              {selectedPost.attachments && selectedPost.attachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Documents & Downloads</h4>
                  <div className="space-y-2">
                    {selectedPost.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">{att.name}</p>
                            {att.size && <p className="text-[10px] text-slate-400">{att.size}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs font-bold text-indigo-600">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedPost.tags.map(t => (
                    <span key={t} className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Share & Download bar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Share this update:</span>
                  {selectedPost.image_url && (
                    <button
                      onClick={() => handleDownloadImage(selectedPost.image_url!, `yara-post-${selectedPost.id}.jpg`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Post Image
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {config && (() => {
                    const share = generateSocialShareLinks(selectedPost, config);
                    const waText = encodeURIComponent(`${selectedPost.title}\n\n${selectedPost.content.substring(0, 200)}...\n\nRead more: ${window.location.origin}/posts#${selectedPost.id}`);
                    return (
                      <>
                        <a href={share.twitter} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1">
                          Twitter / X
                        </a>
                        <a href={share.linkedin} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-700 transition-colors">
                          LinkedIn
                        </a>
                        <a href={share.facebook} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          Facebook
                        </a>
                        <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </a>
                      </>
                    );
                  })()}
                  <button
                    onClick={() => { const url = `${window.location.origin}/posts#${selectedPost.id}`; navigator.clipboard.writeText(url); setCopiedId(selectedPost.id); setTimeout(() => setCopiedId(null), 2500); }}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                  >
                    {copiedId === selectedPost.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === selectedPost.id ? 'Link Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleDownloadImage(lightboxUrl, 'yara-photo.jpg'); }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={() => setLightboxUrl(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxUrl}
              alt={lightboxAlt}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />

            {lightboxAlt && (
              <p className="mt-4 text-slate-300 text-sm font-medium text-center max-w-lg">{lightboxAlt}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
