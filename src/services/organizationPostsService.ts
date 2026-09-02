import { supabase } from '../lib/supabase';
import { OrganizationPost, SocialBroadcastConfig } from '../types/organizationPosts';

export const DEFAULT_BROADCAST_CONFIG: SocialBroadcastConfig = {
  auto_broadcast_enabled: true,
  webhook_url: '',
  facebook_page_url: 'https://facebook.com/yaraorg',
  twitter_handle: 'https://twitter.com/yara_robotics',
  linkedin_page_url: 'https://linkedin.com/company/young-africans-robotics-association',
  instagram_handle: 'https://instagram.com/yara_robotics',
  youtube_channel: 'https://youtube.com/@yara_robotics',
  hashtags: '#YARA2026 #AfricanRobotics #STEMInclusion #YouthEngineering'
};

export async function getOrganizationPosts(): Promise<OrganizationPost[]> {
  let localPosts: OrganizationPost[] = [];
  try {
    const raw = localStorage.getItem('yara_organization_posts');
    if (raw) localPosts = JSON.parse(raw);
  } catch {
    localPosts = [];
  }

  try {
    const { data, error } = await supabase
      .from('organization_posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      localStorage.setItem('yara_organization_posts', JSON.stringify(data));
      return data as OrganizationPost[];
    }
  } catch (e) {
    console.warn('Note loading organization posts from Supabase:', e);
  }

  return localPosts;
}

export async function createOrganizationPost(post: Omit<OrganizationPost, 'id' | 'views_count' | 'likes_count' | 'created_at'>): Promise<{ success: boolean; data?: OrganizationPost; error?: string }> {
  try {
    const newPost: OrganizationPost = {
      ...post,
      id: crypto.randomUUID ? crypto.randomUUID() : 'post_' + Date.now().toString(36),
      views_count: 0,
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    // Save locally
    const existing = await getOrganizationPosts();
    const updated = [newPost, ...existing];
    localStorage.setItem('yara_organization_posts', JSON.stringify(updated));

    // Try Supabase insert
    try {
      const { data, error } = await supabase
        .from('organization_posts')
        .insert({
          id: newPost.id,
          title: newPost.title,
          content: newPost.content,
          image_url: newPost.image_url || null,
          video_url: newPost.video_url || null,
          media_type: newPost.media_type || 'article',
          gallery_urls: newPost.gallery_urls || [],
          attachments: newPost.attachments || [],
          category: newPost.category,
          tags: newPost.tags,
          is_pinned: newPost.is_pinned || false,
          is_breaking: newPost.is_breaking || false,
          social_channels: newPost.social_channels,
          broadcast_status: newPost.broadcast_status,
          author_id: newPost.author_id || null,
          author_name: newPost.author_name || 'YARA Leadership',
          views_count: 0,
          likes_count: 0
        })
        .select()
        .single();

      if (!error && data) {
        newPost.id = data.id;
      }
    } catch (e) {
      console.warn('Supabase post insert note:', e);
    }

    // Trigger webhook broadcast if configured
    const config = await getSocialBroadcastConfig();
    if (config.auto_broadcast_enabled && config.webhook_url) {
      broadcastToWebhook(newPost, config);
    }

    return { success: true, data: newPost };
  } catch (err: any) {
    console.error('Error creating post:', err);
    return { success: false, error: err.message || 'Failed to create organization post' };
  }
}

export async function deleteOrganizationPost(id: string): Promise<boolean> {
  try {
    const existing = await getOrganizationPosts();
    const updated = existing.filter(p => p.id !== id);
    localStorage.setItem('yara_organization_posts', JSON.stringify(updated));

    try {
      await supabase.from('organization_posts').delete().eq('id', id);
    } catch {}

    return true;
  } catch {
    return false;
  }
}

export async function likeOrganizationPost(id: string): Promise<number> {
  try {
    const existing = await getOrganizationPosts();
    const index = existing.findIndex(p => p.id === id);
    let newLikes = 1;
    if (index >= 0) {
      existing[index].likes_count = (existing[index].likes_count || 0) + 1;
      newLikes = existing[index].likes_count;
      localStorage.setItem('yara_organization_posts', JSON.stringify(existing));
    }

    try {
      await supabase.rpc('increment_post_likes', { post_id: id });
    } catch {
      try {
        await supabase
          .from('organization_posts')
          .update({ likes_count: newLikes })
          .eq('id', id);
      } catch {}
    }

    return newLikes;
  } catch {
    return 1;
  }
}

export async function getSocialBroadcastConfig(): Promise<SocialBroadcastConfig> {
  try {
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'social_broadcast_config')
      .single();

    if (data?.value) {
      return { ...DEFAULT_BROADCAST_CONFIG, ...data.value };
    }

    const local = localStorage.getItem('yara_social_broadcast_config');
    if (local) return { ...DEFAULT_BROADCAST_CONFIG, ...JSON.parse(local) };

    return DEFAULT_BROADCAST_CONFIG;
  } catch {
    return DEFAULT_BROADCAST_CONFIG;
  }
}

export async function saveSocialBroadcastConfig(config: SocialBroadcastConfig): Promise<boolean> {
  try {
    await supabase
      .from('system_settings')
      .upsert({
        key: 'social_broadcast_config',
        value: config,
        updated_at: new Date().toISOString()
      });
    localStorage.setItem('yara_social_broadcast_config', JSON.stringify(config));
    return true;
  } catch {
    localStorage.setItem('yara_social_broadcast_config', JSON.stringify(config));
    return true;
  }
}

export async function broadcastToWebhook(post: OrganizationPost, config: SocialBroadcastConfig): Promise<boolean> {
  if (!config.webhook_url) return false;
  try {
    const payload = {
      event: 'yara.post.published',
      post_id: post.id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      category: post.category,
      tags: post.tags,
      author: post.author_name,
      published_at: post.created_at,
      hashtags: config.hashtags,
      syndication_targets: post.social_channels,
      social_links: {
        twitter: config.twitter_handle,
        facebook: config.facebook_page_url,
        linkedin: config.linkedin_page_url,
        instagram: config.instagram_handle,
        youtube: config.youtube_channel
      }
    };

    await fetch(config.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.warn('Webhook broadcast notice:', err);
    return false;
  }
}

export function generateSocialShareLinks(post: OrganizationPost, config: SocialBroadcastConfig) {
  const shareUrl = window.location.origin + '/posts';
  const fullText = `${post.title}\n\n${post.content.slice(0, 200)}...\n\n${config.hashtags}`;
  const encodedText = encodeURIComponent(fullText);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  };
}

/**
 * Extracts iframe embed URL or HTML5 video source from a raw video link
 * Supports YouTube, Vimeo, direct MP4/WebM, Loom, Google Drive
 */
export function getEmbeddableVideoUrl(url?: string): { embedUrl: string | null; type: 'youtube' | 'vimeo' | 'direct' | 'other' | null } {
  if (!url || !url.trim()) return { embedUrl: null, type: null };
  const trimmed = url.trim();

  // YouTube formats (watch?v=, youtu.be/, /embed/, /shorts/)
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      type: 'youtube'
    };
  }

  // Vimeo formats
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      type: 'vimeo'
    };
  }

  // Direct MP4 / WebM video files
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return {
      embedUrl: trimmed,
      type: 'direct'
    };
  }

  return {
    embedUrl: trimmed,
    type: 'other'
  };
}

