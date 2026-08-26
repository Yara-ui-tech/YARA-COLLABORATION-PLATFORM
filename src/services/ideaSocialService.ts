import { supabase } from '../lib/supabase';

export interface IdeaReaction {
  id: string;
  idea_id: string;
  user_id: string;
  user_name: string;
  reaction_type: 'like' | 'love' | 'insightful' | 'rocket' | 'fire';
  created_at: string;
}

export interface IdeaComment {
  id: string;
  idea_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export const REACTION_EMOJIS: Record<string, { emoji: string; label: string; color: string }> = {
  like: { emoji: '👍', label: 'Like', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  love: { emoji: '❤️', label: 'Love', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  insightful: { emoji: '💡', label: 'Insightful', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  rocket: { emoji: '🚀', label: 'Awesome', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  fire: { emoji: '🔥', label: 'Brilliant', color: 'text-orange-600 bg-orange-50 border-orange-200' }
};

// 1. REACTIONS
export async function getIdeaReactions(ideaId: string): Promise<IdeaReaction[]> {
  let localReactions: IdeaReaction[] = [];
  try {
    const raw = localStorage.getItem(`yara_idea_reactions_${ideaId}`);
    if (raw) localReactions = JSON.parse(raw);
  } catch {}

  try {
    const { data, error } = await supabase
      .from('idea_reactions')
      .select('*')
      .eq('idea_id', ideaId);

    if (!error && data) {
      localStorage.setItem(`yara_idea_reactions_${ideaId}`, JSON.stringify(data));
      return data as IdeaReaction[];
    }
  } catch (e) {
    // fallback
  }

  return localReactions;
}

export async function toggleIdeaReaction(
  ideaId: string, 
  userId: string, 
  userName: string, 
  reactionType: 'like' | 'love' | 'insightful' | 'rocket' | 'fire'
): Promise<{ added: boolean; reactions: IdeaReaction[] }> {
  let reactions = await getIdeaReactions(ideaId);
  const existingIdx = reactions.findIndex(r => r.user_id === userId && r.reaction_type === reactionType);

  let added = false;
  if (existingIdx >= 0) {
    // Remove reaction (toggle off)
    reactions.splice(existingIdx, 1);
    try {
      await supabase
        .from('idea_reactions')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType);
    } catch {}
  } else {
    // Add reaction
    added = true;
    const newReaction: IdeaReaction = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'rx_' + Date.now().toString(36),
      idea_id: ideaId,
      user_id: userId,
      user_name: userName,
      reaction_type: reactionType,
      created_at: new Date().toISOString()
    };
    reactions.push(newReaction);

    try {
      await supabase
        .from('idea_reactions')
        .insert({
          id: newReaction.id,
          idea_id: ideaId,
          user_id: userId,
          user_name: userName,
          reaction_type: reactionType
        });
    } catch {}
  }

  localStorage.setItem(`yara_idea_reactions_${ideaId}`, JSON.stringify(reactions));
  return { added, reactions };
}

// 2. COMMENTS
export async function getIdeaComments(ideaId: string): Promise<IdeaComment[]> {
  let localComments: IdeaComment[] = [];
  try {
    const raw = localStorage.getItem(`yara_idea_comments_${ideaId}`);
    if (raw) localComments = JSON.parse(raw);
  } catch {}

  try {
    const { data, error } = await supabase
      .from('idea_comments')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      localStorage.setItem(`yara_idea_comments_${ideaId}`, JSON.stringify(data));
      return data as IdeaComment[];
    }
  } catch (e) {
    // fallback
  }

  return localComments;
}

export async function addIdeaComment(
  ideaId: string, 
  authorId: string, 
  authorName: string, 
  authorAvatar: string | undefined, 
  content: string
): Promise<{ success: boolean; comment?: IdeaComment; error?: string }> {
  try {
    const newComment: IdeaComment = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'comm_' + Date.now().toString(36),
      idea_id: ideaId,
      author_id: authorId,
      author_name: authorName,
      author_avatar: authorAvatar,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    const existing = await getIdeaComments(ideaId);
    const updated = [...existing, newComment];
    localStorage.setItem(`yara_idea_comments_${ideaId}`, JSON.stringify(updated));

    try {
      const { data, error } = await supabase
        .from('idea_comments')
        .insert({
          id: newComment.id,
          idea_id: ideaId,
          author_id: authorId,
          author_name: authorName,
          author_avatar: authorAvatar || null,
          content: newComment.content
        })
        .select()
        .single();

      if (!error && data) {
        newComment.id = data.id;
      }
    } catch {}

    return { success: true, comment: newComment };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit comment' };
  }
}

export async function deleteIdeaComment(ideaId: string, commentId: string): Promise<boolean> {
  try {
    const existing = await getIdeaComments(ideaId);
    const updated = existing.filter(c => c.id !== commentId);
    localStorage.setItem(`yara_idea_comments_${ideaId}`, JSON.stringify(updated));

    try {
      await supabase.from('idea_comments').delete().eq('id', commentId);
    } catch {}

    return true;
  } catch {
    return false;
  }
}
