import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Trash2, 
  Clock, 
  Send, 
  Smile, 
  Check, 
  Loader2,
  Sparkles,
  User
} from 'lucide-react';
import { 
  IdeaReaction, 
  IdeaComment, 
  REACTION_EMOJIS, 
  getIdeaReactions, 
  toggleIdeaReaction, 
  getIdeaComments, 
  addIdeaComment, 
  deleteIdeaComment 
} from '../../services/ideaSocialService';
import { cn } from '../../lib/utils';

export interface IdeaCardWithSocialProps {
  key?: React.Key;
  idea: any;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  isAdmin?: boolean;
  onDeleteIdea?: (id: string) => Promise<void> | void;
}

export default function IdeaCardWithSocial({
  idea,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isAdmin,
  onDeleteIdea
}: IdeaCardWithSocialProps) {
  const [reactions, setReactions] = useState<IdeaReaction[]>([]);
  const [comments, setComments] = useState<IdeaComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  useEffect(() => {
    loadReactionsAndComments();
  }, [idea.id]);

  const loadReactionsAndComments = async () => {
    try {
      const [rxList, cmList] = await Promise.all([
        getIdeaReactions(idea.id),
        getIdeaComments(idea.id)
      ]);
      setReactions(rxList);
      setComments(cmList);
    } catch (e) {
      console.warn('Error loading social state for idea:', e);
    }
  };

  const handleToggleReaction = async (type: 'like' | 'love' | 'insightful' | 'rocket' | 'fire') => {
    if (!currentUserId) return;
    const { reactions: updated } = await toggleIdeaReaction(
      idea.id,
      currentUserId,
      currentUserName || 'Innovator',
      type
    );
    setReactions(updated);
    setShowReactionPicker(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setSubmittingComment(true);
    try {
      const res = await addIdeaComment(
        idea.id,
        currentUserId,
        currentUserName || 'Innovator',
        currentUserAvatar,
        newComment
      );
      if (res.success && res.comment) {
        setComments(prev => [...prev, res.comment!]);
        setNewComment('');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const ok = await deleteIdeaComment(idea.id, commentId);
    if (ok) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  const handleShare = () => {
    const text = `💡 Check out this robotics innovation idea on YARA: "${idea.content.slice(0, 100)}..."`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Group reactions
  const reactionCounts: Record<string, number> = {};
  reactions.forEach(r => {
    reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
  });

  const userReactions = new Set(reactions.filter(r => r.user_id === currentUserId).map(r => r.reaction_type));
  const totalReactions = reactions.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/70 transition-all group relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center font-black text-white text-base shadow-md shadow-indigo-200">
            {idea.author_name?.[0] || 'U'}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">{idea.author_name}</h4>
            <p className="text-xs text-slate-400 font-medium flex items-center mt-0.5">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-300" />
              {new Date(idea.created_at).toLocaleDateString()} at {new Date(idea.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {(currentUserId === idea.author_id || isAdmin) && onDeleteIdea && (
          <button
            onClick={() => onDeleteIdea(idea.id)}
            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Delete idea"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Idea Content */}
      <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed mb-6 whitespace-pre-wrap">
        {idea.content}
      </p>

      {/* Active Reaction Pills */}
      {totalReactions > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-5 pt-1">
          {Object.entries(reactionCounts).map(([type, count]) => {
            const config = REACTION_EMOJIS[type] || { emoji: '👍', label: type, color: 'text-slate-600 bg-slate-50 border-slate-200' };
            const isUserReacted = userReactions.has(type as any);
            return (
              <button
                key={type}
                onClick={() => handleToggleReaction(type as any)}
                className={cn(
                  "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105",
                  isUserReacted 
                    ? config.color + " ring-1 ring-indigo-400" 
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
                title={`${count} member(s) reacted ${config.label}`}
              >
                <span>{config.emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 relative">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Reaction Picker Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className={cn(
                "flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all",
                userReactions.size > 0 
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                  : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
              )}
            >
              <Heart className={cn("w-4 h-4", userReactions.size > 0 && "fill-rose-500 text-rose-500")} />
              <span>{totalReactions > 0 ? `${totalReactions} React` : 'React'}</span>
            </button>

            {/* Reaction Hover/Click Palette */}
            <AnimatePresence>
              {showReactionPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 10 }}
                  className="absolute bottom-full mb-2 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 flex items-center space-x-1.5 z-30"
                >
                  {(Object.keys(REACTION_EMOJIS) as Array<keyof typeof REACTION_EMOJIS>).map((type) => {
                    const info = REACTION_EMOJIS[type];
                    const isSelected = userReactions.has(type as any);
                    return (
                      <button
                        key={type}
                        onClick={() => handleToggleReaction(type as any)}
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-lg hover:scale-125 transition-transform",
                          isSelected ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-100"
                        )}
                        title={info.label}
                      >
                        {info.emoji}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comment Toggle Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all",
              showComments || comments.length > 0
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length > 0 ? `${comments.length} Comments` : 'Comment'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-slate-100 space-y-4"
          >
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Community Discussion ({comments.length})
            </h5>

            {/* List of comments */}
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No comments on this idea yet. Be the first to share your feedback or collaboration thoughts!
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {comments.map((c) => (
                  <div key={c.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                          {c.author_name?.[0] || 'U'}
                        </div>
                        <span className="font-bold text-slate-900">{c.author_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {(currentUserId === c.author_id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-slate-300 hover:text-rose-600 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-700 pl-8 leading-relaxed font-medium">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Post comment input */}
            {currentUserId && (
              <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a constructive thought or collaboration offer..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-2xl font-bold text-xs shadow-md shadow-indigo-200 disabled:opacity-50 transition-all shrink-0"
                  title="Send Comment"
                >
                  {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
