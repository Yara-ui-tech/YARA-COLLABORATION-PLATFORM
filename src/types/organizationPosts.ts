export type PostCategory = 'announcement' | 'milestone' | 'gallery' | 'event' | 'press' | 'impact';

export type PostMediaType = 'article' | 'picture_news' | 'video_news' | 'press_release' | 'bulletin';

export interface PostAttachment {
  name: string;
  url: string;
  size?: string;
  type?: 'pdf' | 'document' | 'image' | 'video' | 'link';
}

export interface SocialChannelsConfig {
  twitter: boolean;
  facebook: boolean;
  linkedin: boolean;
  instagram: boolean;
  whatsapp?: boolean;
}

export interface OrganizationPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
  media_type?: PostMediaType;
  gallery_urls?: string[];
  attachments?: PostAttachment[];
  category: PostCategory;
  tags: string[];
  is_pinned?: boolean;
  is_breaking?: boolean;
  social_channels: SocialChannelsConfig;
  broadcast_status: 'draft' | 'published' | 'broadcasted';
  author_id?: string;
  author_name: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at?: string;
}

export interface SocialBroadcastConfig {
  auto_broadcast_enabled: boolean;
  webhook_url: string;
  facebook_page_url: string;
  twitter_handle: string;
  linkedin_page_url: string;
  instagram_handle: string;
  youtube_channel: string;
  hashtags: string;
}

