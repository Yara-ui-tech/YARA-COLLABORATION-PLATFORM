import React, { useEffect, useState } from 'react';
import { 
  Send, Plus, Trash2, Globe, Share2, Radio, CheckCircle2, 
  AlertCircle, Loader2, Sparkles, Image as ImageIcon, Link as LinkIcon,
  Tag, ExternalLink, Settings, RefreshCw, Pin, ThumbsUp, Eye, Copy, Check, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../AuthContext';
import { OrganizationPost, SocialBroadcastConfig } from '../../types/organizationPosts';
import { 
  getOrganizationPosts, 
  createOrganizationPost, 
  deleteOrganizationPost, 
  getSocialBroadcastConfig, 
  saveSocialBroadcastConfig,
  broadcastToWebhook,
  generateSocialShareLinks
} from '../../services/organizationPostsService';

export default function OrganizationPostsAdminTab() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<OrganizationPost[]>([]);
  const [config, setConfig] = useState<SocialBroadcastConfig>({
    auto_broadcast_enabled: true,
    webhook_url: '',
    facebook_page_url: 'https://facebook.com/yaraorg',
    twitter_handle: 'https://twitter.com/yara_robotics',
    linkedin_page_url: 'https://linkedin.com/company/young-africans-robotics-association',
    instagram_handle: 'https://instagram.com/yara_robotics',
    youtube_channel: 'https://youtube.com/@yara_robotics',
    hashtags: '#YARA2026 #AfricanRobotics #STEMInclusion #YouthEngineering'
  });

  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'new_post' | 'social_config'>('posts');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Post Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    video_url: '',
    media_type: 'standard' as 'standard' | 'image' | 'video' | 'gallery' | 'document',
    galleryInput: '',
    gallery_urls: [] as string[],
    attachmentName: '',
    attachmentUrl: '',
    attachments: [] as Array<{ name: string; url: string; size?: string }>,
    category: 'announcement' as OrganizationPost['category'],
    tags: ['Robotics', 'Innovation', 'Africa'],
    tagInput: '',
    is_pinned: false,
    social_channels: ['twitter', 'linkedin', 'facebook']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedPosts, fetchedConfig] = await Promise.all([
        getOrganizationPosts(),
        getSocialBroadcastConfig()
      ]);
      setPosts(fetchedPosts);
      setConfig(fetchedConfig);
    } catch (err) {
      console.warn('Error loading posts admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: ''
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tagToRemove)
    });
  };

  const toggleChannel = (channel: string) => {
    if (formData.social_channels.includes(channel)) {
      setFormData({
        ...formData,
        social_channels: formData.social_channels.filter(c => c !== channel)
      });
    } else {
      setFormData({
        ...formData,
        social_channels: [...formData.social_channels, channel]
      });
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage({ type: 'error', text: 'Please provide both title and content for the post.' });
      return;
    }

    setIsPublishing(true);
    try {
      const res = await createOrganizationPost({
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url.trim() || undefined,
        video_url: formData.video_url.trim() || undefined,
        media_type: formData.media_type,
        gallery_urls: formData.gallery_urls.length > 0 ? formData.gallery_urls : undefined,
        attachments: formData.attachments.length > 0 ? formData.attachments : undefined,
        category: formData.category,
        tags: formData.tags,
        is_pinned: formData.is_pinned,
        social_channels: formData.social_channels,
        broadcast_status: config.webhook_url ? 'broadcasted' : 'published',
        author_id: profile?.id,
        author_name: profile?.display_name || 'YARA Executive Committee'
      });

      if (res.success && res.data) {
        setPosts(prev => [res.data!, ...prev]);
        setFormData({
          title: '',
          content: '',
          image_url: '',
          video_url: '',
          media_type: 'standard',
          galleryInput: '',
          gallery_urls: [],
          attachmentName: '',
          attachmentUrl: '',
          attachments: [],
          category: 'announcement',
          tags: ['Robotics', 'Innovation', 'Africa'],
          tagInput: '',
          is_pinned: false,
          social_channels: ['twitter', 'linkedin', 'facebook']
        });
        setActiveSubTab('posts');
        setMessage({ 
          type: 'success', 
          text: config.webhook_url 
            ? 'Post published & dispatched to configured social syndication webhook!' 
            : 'Post published to official organization feed.' 
        });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to publish post.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error occurred.' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this post?')) return;
    const ok = await deleteOrganizationPost(id);
    if (ok) {
      setPosts(prev => prev.filter(p => p.id !== id));
      setMessage({ type: 'success', text: 'Post removed.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = await saveSocialBroadcastConfig(config);
      if (ok) {
        setMessage({ type: 'success', text: 'Social media syndication settings updated.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRebroadcast = async (post: OrganizationPost) => {
    if (!config.webhook_url) {
      setMessage({ type: 'error', text: 'Please configure a Webhook URL in Social Settings first.' });
      return;
    }
    setLoading(true);
    const sent = await broadcastToWebhook(post, config);
    setLoading(false);
    if (sent) {
      setMessage({ type: 'success', text: `Broadcasting payload sent for "${post.title}"!` });
    } else {
      setMessage({ type: 'error', text: 'Webhook server could not be reached. Check URL or CORS settings.' });
    }
    setTimeout(() => setMessage(null), 3500);
  };

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-1">
            <Radio className="w-4 h-4" />
            <span>Organizational Communications & Syndication</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Official Organization Posts & Socials
          </h3>
          <p className="text-slate-500 text-xs md:text-sm max-w-2xl">
            Publish official announcements, competition news, and image updates to your member feed and automatically broadcast them to your connected social channels via webhooks.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveSubTab('posts')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5",
              activeSubTab === 'posts' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Published Posts ({posts.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('new_post')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5",
              activeSubTab === 'new_post' ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Post</span>
          </button>
          <button
            onClick={() => setActiveSubTab('social_config')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5",
              activeSubTab === 'social_config' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Social Webhook Setup</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold",
              message.type === 'success' ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-TAB 1: CREATE NEW POST */}
      {activeSubTab === 'new_post' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm max-w-4xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-xl font-bold text-slate-900">Compose Organization Update</h4>
              <p className="text-xs text-slate-400">This post will be published to the organization feed and social channels.</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">
              Live Broadcast
            </span>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Post Title / Headline *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. YARA Robotics National Championship 2026 Registration Now Open!"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none"
                >
                  <option value="announcement">Official Announcement</option>
                  <option value="press_release">Press Release</option>
                  <option value="event_update">Event & Competition Update</option>
                  <option value="achievement">Youth Achievement & Milestone</option>
                  <option value="general">General News</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Media Format</label>
                <select
                  value={formData.media_type}
                  onChange={e => setFormData({ ...formData, media_type: e.target.value as any })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none"
                >
                  <option value="standard">Standard Article</option>
                  <option value="image">Picture News & Banner</option>
                  <option value="video">Video News & Stream</option>
                  <option value="gallery">Photo Story Gallery</option>
                  <option value="document">Press Release / Document</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Cover Image URL</label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-indigo-600 outline-none"
                  />
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* Video Broadcast URL */}
            <div className="space-y-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <label className="block text-xs font-bold text-indigo-900 uppercase">Video URL (YouTube, Vimeo, MP4 Video)</label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full bg-white border-2 border-indigo-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-indigo-600 outline-none"
                />
                <Video className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
              </div>
              <p className="text-[11px] text-indigo-600/80">Embedded directly in post viewer with responsive playback for members.</p>
            </div>

            {/* Photo Gallery URLs */}
            <div className="space-y-2 p-4 bg-amber-50/40 rounded-2xl border border-amber-100">
              <label className="block text-xs font-bold text-amber-900 uppercase">Multi-Photo Story Gallery URLs</label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={formData.galleryInput}
                  onChange={e => setFormData({ ...formData, galleryInput: e.target.value })}
                  placeholder="Paste image URL and click Add"
                  className="flex-1 bg-white border-2 border-amber-100 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.galleryInput.trim()) {
                      setFormData({
                        ...formData,
                        gallery_urls: [...formData.gallery_urls, formData.galleryInput.trim()],
                        galleryInput: ''
                      });
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold"
                >
                  Add Photo
                </button>
              </div>
              {formData.gallery_urls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.gallery_urls.map((url, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <span className="truncate max-w-[200px]">{url}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          gallery_urls: formData.gallery_urls.filter((_, i) => i !== idx)
                        })}
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Attachments */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase">Downloadable Press Documents / PDFs</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={formData.attachmentName}
                  onChange={e => setFormData({ ...formData, attachmentName: e.target.value })}
                  placeholder="Doc Title (e.g. Press Release PDF)"
                  className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-none"
                />
                <input
                  type="url"
                  value={formData.attachmentUrl}
                  onChange={e => setFormData({ ...formData, attachmentUrl: e.target.value })}
                  placeholder="Document URL (https://...)"
                  className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.attachmentName.trim() && formData.attachmentUrl.trim()) {
                      setFormData({
                        ...formData,
                        attachments: [
                          ...formData.attachments,
                          { name: formData.attachmentName.trim(), url: formData.attachmentUrl.trim(), size: 'PDF / Document' }
                        ],
                        attachmentName: '',
                        attachmentUrl: ''
                      });
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Attach File
                </button>
              </div>
              {formData.attachments.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {formData.attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-800">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          attachments: formData.attachments.filter((_, i) => i !== idx)
                        })}
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Article / Post Body Content *</label>
              <textarea
                required
                rows={6}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the full update here. Share event details, congratulations to students, hardware updates, or community news..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Hashtags & Topics</label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold flex items-center space-x-1">
                    <span>#{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-red-500 ml-1 font-black">×</button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.tagInput}
                  onChange={e => setFormData({ ...formData, tagInput: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder="Type a tag and press Enter"
                  className="bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Syndication Channels */}
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Social Channels to Syndicate</h5>
                  <p className="text-[11px] text-slate-500">Payload will be formatted with links and tags for each selected network.</p>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_pinned}
                    onChange={e => setFormData({ ...formData, is_pinned: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">Pin to top of feed</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { id: 'twitter', label: 'Twitter / X' },
                  { id: 'linkedin', label: 'LinkedIn Page' },
                  { id: 'facebook', label: 'Facebook Page' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'youtube', label: 'YouTube Community' }
                ].map(ch => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5",
                      formData.social_channels.includes(ch.id)
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <Share2 className="w-3 h-3" />
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publishing & Syndicating...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Publish Organization Post & Broadcast</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 2: LIST OF POSTS */}
      {activeSubTab === 'posts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900">Published Organization Timeline</h4>
            <span className="text-xs text-slate-400 font-medium">All updates are instantly accessible by organization members</span>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Globe className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h5 className="font-bold text-slate-900 text-base">No Organizational Posts Yet</h5>
                <p className="text-xs text-slate-400">
                  Share news, competition registrations, and press releases with your community and social followers.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('new_post')}
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-100 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Post</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map(post => {
                const shareLinks = generateSocialShareLinks(post, config);
                return (
                  <div 
                    key={post.id}
                    className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all relative overflow-hidden"
                  >
                    {post.is_pinned && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black uppercase px-4 py-1 rounded-bl-xl flex items-center space-x-1">
                        <Pin className="w-3 h-3" />
                        <span>Pinned</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {post.category.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {post.image_url && (
                        <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                          <img 
                            src={post.image_url} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <h5 className="font-bold text-slate-900 text-base leading-snug">{post.title}</h5>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                        {post.content}
                      </p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map(t => (
                            <span key={t} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold text-slate-600">By {post.author_name}</span>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{post.likes_count || 0}</span>
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold uppercase">
                            {post.broadcast_status || 'Published'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Share / Re-broadcast */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center space-x-1.5">
                          <a
                            href={shareLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors text-xs font-bold"
                            title="Share on Twitter / X"
                          >
                            X
                          </a>
                          <a
                            href={shareLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors text-xs font-bold"
                            title="Share on LinkedIn"
                          >
                            in
                          </a>
                          <a
                            href={shareLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors text-xs font-bold"
                            title="Share on Facebook"
                          >
                            fb
                          </a>
                        </div>

                        <div className="flex items-center space-x-2">
                          {config.webhook_url && (
                            <button
                              onClick={() => handleRebroadcast(post)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors text-xs font-bold flex items-center space-x-1"
                              title="Re-broadcast to Webhook"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Re-sync</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: SOCIAL WEBHOOK SETUP */}
      {activeSubTab === 'social_config' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm max-w-4xl space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h4 className="text-xl font-bold text-slate-900">Social Media Multi-Platform Webhook Syndication</h4>
            <p className="text-xs text-slate-400">
              When you publish an organizational post, YARA will send an automated JSON webhook to your automation service (such as Make.com, Zapier, n8n, Buffer, or your custom server) which can automatically distribute the update to your Twitter/X, Facebook, LinkedIn, Instagram, and Telegram channels simultaneously.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-900 text-xs">Automatic Social Dispatch</h5>
                <p className="text-[11px] text-slate-500">Auto-send payload to webhook when new post is created</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.auto_broadcast_enabled}
                  onChange={e => setConfig({ ...config, auto_broadcast_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Syndication Webhook URL</label>
              <input
                type="url"
                value={config.webhook_url || ''}
                onChange={e => setConfig({ ...config, webhook_url: e.target.value })}
                placeholder="https://hook.eu1.make.com/... or https://hooks.zapier.com/hooks/catch/..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-mono font-medium text-slate-900 focus:border-indigo-600 outline-none"
              />
              <p className="text-[11px] text-slate-400">Leave blank to disable automatic webhook triggering.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Default Hashtags</label>
              <input
                type="text"
                value={config.hashtags || ''}
                onChange={e => setConfig({ ...config, hashtags: e.target.value })}
                placeholder="#YARA2026 #AfricanRobotics #STEMInclusion"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium text-slate-900 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Twitter / X URL</label>
                <input
                  type="text"
                  value={config.twitter_handle || ''}
                  onChange={e => setConfig({ ...config, twitter_handle: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 px-3 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">LinkedIn Page URL</label>
                <input
                  type="text"
                  value={config.linkedin_page_url || ''}
                  onChange={e => setConfig({ ...config, linkedin_page_url: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 px-3 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Facebook Page URL</label>
                <input
                  type="text"
                  value={config.facebook_page_url || ''}
                  onChange={e => setConfig({ ...config, facebook_page_url: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 px-3 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Instagram Page URL</label>
                <input
                  type="text"
                  value={config.instagram_handle || ''}
                  onChange={e => setConfig({ ...config, instagram_handle: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 px-3 text-xs text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-2xl text-xs transition-all shadow-md flex items-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Webhook & Social Settings</span>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
