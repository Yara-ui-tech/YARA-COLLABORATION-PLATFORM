import React, { useEffect, useState } from 'react';
import { 
  Globe, Radio, ThumbsUp, Share2, Sparkles, Tag, Calendar, 
  User, Search, Pin, ExternalLink, Loader2, ArrowRight, Check, Copy, MessageSquare,
  Play, Video, Image as ImageIcon, FileText, Download, Eye
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
    const url = window.location.origin + '/posts';
    navigator.clipboard.writeText(url);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2500);
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
              >
                {post.is_pinned && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black uppercase px-4 py-1 rounded-bl-2xl flex items-center space-x-1 shadow-sm">
                    <Pin className="w-3 h-3" />
                    <span>Pinned</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {post.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {post.image_url && (
                    <div className="h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-50 relative group-hover:scale-[1.01] transition-transform">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {post.video_url && (
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!post.image_url && post.video_url && (
                    <div className="h-48 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-white space-y-2">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-300">Watch Video Release</span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                    {post.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {post.media_type === 'video' && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        <Video className="w-3 h-3" />
                        <span>Video Broadcast</span>
                      </span>
                    )}
                    {post.media_type === 'gallery' && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        <ImageIcon className="w-3 h-3" />
                        <span>Photo Gallery</span>
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
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-600">
                    <span>{post.author_name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => handleLike(post.id, e)}
                      className={cn(
                        "flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                        isLiked 
                          ? "bg-indigo-600 text-white shadow-sm" 
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                      )}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likes_count || 0}</span>
                    </button>

                    {shareLinks && (
                      <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                        <a
                          href={shareLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-xl transition-colors text-[11px] font-bold"
                          title="Share on X"
                        >
                          X
                        </a>
                        <a
                          href={shareLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-xl transition-colors text-[11px] font-bold"
                          title="Share on LinkedIn"
                        >
                          in
                        </a>
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(post, e)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors text-xs"
                          title="Copy Link"
                        >
                          {copiedId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
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

              {/* Cover Image (if no video) */}
              {!selectedPost.video_url && selectedPost.image_url && (
                <div className="rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 max-h-80">
                  <img
                    src={selectedPost.image_url}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Photo Gallery */}
              {selectedPost.gallery_urls && selectedPost.gallery_urls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Photo Story & Event Gallery</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedPost.gallery_urls.map((imgUrl, i) => (
                      <a 
                        key={i} 
                        href={imgUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 h-28 block group hover:scale-[1.02] transition-transform"
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Gallery ${i + 1}`} 
                          className="w-full h-full object-cover group-hover:opacity-90"
                          referrerPolicy="no-referrer"
                        />
                      </a>
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

              {config && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Share this update:</span>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const share = generateSocialShareLinks(selectedPost, config);
                      return (
                        <>
                          <a
                            href={share.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            Twitter / X
                          </a>
                          <a
                            href={share.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            LinkedIn
                          </a>
                          <a
                            href={share.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            Facebook
                          </a>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
