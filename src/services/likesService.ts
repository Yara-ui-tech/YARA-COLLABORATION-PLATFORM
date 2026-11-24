import { supabase } from '../lib/supabase';

export type ContentLikeType = 'post' | 'news' | 'publication' | 'kit' | 'site';

export interface LikeState {
  isLiked: boolean;
  count: number;
}

const STORAGE_PREFIX = 'yara_likes_v1_';
const COUNTS_STORAGE_KEY = 'yara_content_like_counts_v1';

// Custom event for cross-component real-time updates
const LIKE_CHANGED_EVENT = 'yara_content_like_changed';

// In-flight locking map to prevent rapid double-clicks from duplicating or skipping toggles
const inFlightToggles = new Set<string>();

function getLocalLikedIds(contentType: ContentLikeType, userKey: string): string[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${contentType}_${userKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalLikedIds(contentType: ContentLikeType, userKey: string, ids: string[]): void {
  try {
    // Deduplicate array to ensure id is strictly present at most once
    const uniqueIds = Array.from(new Set(ids));
    localStorage.setItem(`${STORAGE_PREFIX}${contentType}_${userKey}`, JSON.stringify(uniqueIds));
  } catch {}
}

function getAllStoredCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COUNTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredCount(key: string, count: number): void {
  try {
    const all = getAllStoredCounts();
    all[key] = Math.max(0, count);
    localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export const likesService = {
  makeKey: (contentType: ContentLikeType, contentId: string) => `${contentType}:${contentId}`,

  getUserKey: (userId?: string, userEmail?: string): string => {
    if (userId) return userId;
    if (userEmail) return userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    // Persistent guest anonymous ID
    let guestId = localStorage.getItem('yara_guest_device_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('yara_guest_device_id', guestId);
    }
    return guestId;
  },

  isLiked: (contentType: ContentLikeType, contentId: string, userId?: string, userEmail?: string): boolean => {
    const userKey = likesService.getUserKey(userId, userEmail);
    const liked = getLocalLikedIds(contentType, userKey);
    return liked.includes(contentId);
  },

  getLikeCount: (contentType: ContentLikeType, contentId: string, initialCount: number = 0): number => {
    const key = likesService.makeKey(contentType, contentId);
    const stored = getAllStoredCounts()[key];
    if (typeof stored === 'number') {
      return stored;
    }
    return initialCount || 0;
  },

  toggleLike: async (
    contentType: ContentLikeType,
    contentId: string,
    currentCount: number = 0,
    userId?: string,
    userEmail?: string
  ): Promise<LikeState> => {
    const userKey = likesService.getUserKey(userId, userEmail);
    const flightKey = `${contentType}:${contentId}:${userKey}`;

    // Prevent concurrent double-invocations on the exact same item
    if (inFlightToggles.has(flightKey)) {
      const isLiked = likesService.isLiked(contentType, contentId, userId, userEmail);
      const count = likesService.getLikeCount(contentType, contentId, currentCount);
      return { isLiked, count };
    }

    inFlightToggles.add(flightKey);

    try {
      const likedIds = getLocalLikedIds(contentType, userKey);
      const alreadyLiked = likedIds.includes(contentId);
      const key = likesService.makeKey(contentType, contentId);

      const newLiked = !alreadyLiked;
      let updatedIds: string[];
      let newCount: number;

      const storedCount = getAllStoredCounts()[key];
      const baseCount = typeof storedCount === 'number' ? storedCount : currentCount;

      if (alreadyLiked) {
        // Unlike: strictly remove and decrement
        updatedIds = likedIds.filter(id => id !== contentId);
        newCount = Math.max(0, baseCount - 1);
      } else {
        // Like: strictly add and increment (deduplicating)
        updatedIds = Array.from(new Set([...likedIds, contentId]));
        newCount = baseCount + 1;
      }

      setLocalLikedIds(contentType, userKey, updatedIds);
      setStoredCount(key, newCount);

      // Broadcast local event for immediate reactivity
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(LIKE_CHANGED_EVENT, {
          detail: { contentType, contentId, isLiked: newLiked, count: newCount }
        }));
      }

      // Background sync with Supabase
      try {
        if (newLiked) {
          // Check if already in DB before insert to prevent duplicate rows
          const { data: existing } = await supabase
            .from('content_likes')
            .select('id')
            .eq('content_type', contentType)
            .eq('content_id', contentId)
            .eq('user_identifier', userKey)
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase.from('content_likes').insert({
              content_type: contentType,
              content_id: contentId,
              user_id: userId || null,
              user_identifier: userKey
            });
          }

          // Also increment parent table like counts where supported
          if (contentType === 'post' || contentType === 'news') {
            await supabase.from('organization_posts').update({ likes_count: newCount }).eq('id', contentId);
          }
        } else {
          await supabase
            .from('content_likes')
            .delete()
            .match({ content_type: contentType, content_id: contentId, user_identifier: userKey });

          if (contentType === 'post' || contentType === 'news') {
            await supabase.from('organization_posts').update({ likes_count: newCount }).eq('id', contentId);
          }
        }
      } catch {
        // Safe fallback - local storage handles offline/unauthenticated state
      }

      return { isLiked: newLiked, count: newCount };
    } finally {
      inFlightToggles.delete(flightKey);
    }
  },

  subscribeToLikes: (callback: (detail: { contentType: ContentLikeType; contentId: string; isLiked: boolean; count: number }) => void) => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener(LIKE_CHANGED_EVENT, handler);
    return () => window.removeEventListener(LIKE_CHANGED_EVENT, handler);
  },

  /**
   * Sync and reconcile current user's liked content with remote DB
   */
  syncUserLikes: async (contentType: ContentLikeType, contentIds: string[], userId?: string, userEmail?: string): Promise<void> => {
    if (!contentIds || contentIds.length === 0) return;
    const userKey = likesService.getUserKey(userId, userEmail);

    try {
      const { data, error } = await supabase
        .from('content_likes')
        .select('content_id')
        .eq('content_type', contentType)
        .eq('user_identifier', userKey)
        .in('content_id', contentIds);

      if (!error && data) {
        const remoteLikedIds = data.map(r => r.content_id);
        const localLikedIds = getLocalLikedIds(contentType, userKey);
        const merged = Array.from(new Set([...localLikedIds, ...remoteLikedIds]));
        setLocalLikedIds(contentType, userKey, merged);
      }
    } catch {}
  }
};

