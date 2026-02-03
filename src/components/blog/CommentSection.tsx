"use client";

import { useState, useEffect } from "react";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
import { CommentSkeletonList } from "./CommentSkeleton";
import { useUser } from '~/hooks/useUser';
import { useMutation } from '@tanstack/react-query';
import { Comment, CommentSectionProps } from '~/constants/comment';
import { useWebSocket } from '~/hooks/useWebSocket';
import { toast } from 'sonner';

function addReplyToNested(replies: Comment[], newReply: Comment): Comment[] {
  return replies.map(r => {
    if (r.id === newReply.parentCommentId && newReply.parentCommentId)
      return { ...r, replies: [...(r.replies || []), newReply] };
    if (r.replies?.length) {
      const next = addReplyToNested(r.replies, newReply);
      if (next !== r.replies) return { ...r, replies: next };
    }
    return r;
  });
}

export default function CommentSection({ comments: initialComments, onSubmitComment, showAllComments = true, postId }: CommentSectionProps) {
  const { isAuthenticated, user } = useUser();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [visible, setVisible] = useState(3);
  const [loading, setLoading] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { isConnected, sendComment, sendReply, deleteComment, updateComment } = useWebSocket({
    postId: postId || '',
    userId: user?.id || '',
    onNewComment: (c) => {
      setComments(prev => prev.some(x => x.id === c.id || (x.content === c.content && x.userId === c.userId && Math.abs(new Date(x.createdAt).getTime() - new Date(c.createdAt).getTime()) < 5000)) ? prev : [c, ...prev]);
      if (!c.isTemp) toast.success('New comment received!');
    },
    onNewReply: (r) => {
      setComments(prev => prev.map(c => c.id === r.parentCommentId ? { ...c, replies: [...(c.replies || []), r] } : (c.replies?.length ? { ...c, replies: addReplyToNested(c.replies, r) } : c)));
      if (!r.isTemp) toast.success('New reply received!');
    },
    onCommentDeleted: (id) => { setComments(prev => prev.filter(c => c.id !== id)); toast.info('Comment deleted'); },
    onCommentUpdated: (updated) => {
      setComments(prev => prev.map(c => c.id === updated.id ? updated : c));
      setComments(prev => prev.map(c => ({ ...c, replies: c.replies?.map(r => r.id === updated.id ? updated : r) ?? [] })));
      if (!updated.isTemp) toast.success('Comment updated');
    },
    onError: (err) => toast.error(`WebSocket: ${err}`),
  });

  const commentMut = useMutation({
    mutationFn: async (text: string) => { if (onSubmitComment) await onSubmitComment(text); return text; },
    onMutate: (text) => {
      const avatar = user?.image?.startsWith('http') || user?.image?.startsWith('data:') ? user.image : '';
      setComments(prev => [{ id: Math.random().toString(36).slice(2), userId: user?.id || '', author: user?.address || 'Unknown', content: text, createdAt: new Date().toISOString(), time: new Date().toISOString(), avatar, replies: [] }, ...prev]);
      return { previous: comments };
    },
    onError: (_, __, ctx) => { if (ctx?.previous) setComments(ctx.previous); },
  });

  const replyMut = useMutation({
    mutationFn: async ({ parentId, replyText }: { parentId: string; replyText: string; userInfo: { id?: string; address?: string; image?: string } }) => {
      const realPostId = postId || comments.find(c => c.id === parentId)?.postId;
      if (!realPostId) throw new Error('No postId');
      await fetch("/api/blog/comment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: realPostId, content: replyText, parentCommentId: parentId }) });
      return { parentId, replyText };
    },
    onMutate: ({ parentId, replyText, userInfo }) => {
      const avatar = userInfo?.image?.startsWith('http') || userInfo?.image?.startsWith('data:') ? userInfo.image : '';
      const newReply: Comment = { id: Math.random().toString(36).slice(2), userId: userInfo?.id || '', author: userInfo?.address || 'Unknown', content: replyText, createdAt: new Date().toISOString(), time: new Date().toISOString(), avatar, replies: [] };
      setComments(prev => prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), newReply] } : c));
      return { previous: comments };
    },
    onError: (_, __, ctx) => { if (ctx?.previous) setComments(ctx.previous); },
  });

  const handleSubmitComment = (comment: string) => {
    if (isConnected && sendComment(comment)) return;
    commentMut.mutate(comment);
  };

  const handleSubmitReply = (parentId: string, replyText: string, userInfo: { id?: string; address?: string; image?: string }) => {
    if (isConnected && sendReply(replyText, parentId)) return;
    replyMut.mutate({ parentId, replyText, userInfo });
  };

  const handleDelete = (commentId: string) => {
    if (!isConnected) { toast.error('WebSocket not connected'); return; }
    const rest = comments.find(c => c.id === commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
    if (!deleteComment(commentId)) { toast.error('Delete failed'); if (rest) setComments(prev => [...prev, rest]); }
  };

  const handleUpdate = (commentId: string, content: string) => {
    if (!isConnected) { toast.error('WebSocket not connected'); return; }
    const prevComment = comments.find(c => c.id === commentId);
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, content } : c));
    if (!updateComment(commentId, content)) { toast.error('Update failed'); if (prevComment) setComments(prev => prev.map(c => c.id === commentId ? prevComment : c)); }
  };

  const loadMore = () => { setLoading(true); setTimeout(() => { setVisible(v => Math.min(v + 3, comments.length)); setLoading(false); }, 1500); };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash?.startsWith('#comment-') && comments.length) setVisible(comments.length);
  }, [comments.length]);

  const visibleList = comments.slice(0, visible);
  const hasMore = visible < comments.length;

  return (
    <div className="mt-8 space-y-4">
      {isAuthenticated ? <CommentInput onSubmit={handleSubmitComment} user={{ id: user?.id ?? '', address: user?.address ?? '', image: user?.image ?? null, isBanned: user?.isBanned, bannedUntil: user?.bannedUntil }} /> : (
        <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-3 border border-gray-200 dark:border-gray-700/50 text-center text-gray-600 dark:text-gray-400">You need to <b>log in</b> to comment.</div>
      )}
      <div className="space-y-4">
        {showAllComments && visibleList.map(c => (
          <CommentItem key={c.id} comment={c} onSubmitReply={handleSubmitReply} onDeleteComment={handleDelete} onUpdateComment={handleUpdate} user={{ id: user?.id, address: user?.address, image: user?.image ?? '' }} activeReplyId={activeReplyId} setActiveReplyId={setActiveReplyId} hoveredId={hoveredId} setHoveredId={setHoveredId} />
        ))}
        {loading && showAllComments && <div className="text-sm text-gray-500 dark:text-gray-400 py-2">Loading...</div>}
      </div>
      {showAllComments && hasMore && (
        <div className="text-center pt-4 flex flex-col items-center gap-2">
          <button type="button" onClick={loadMore} disabled={loading} className="text-blue-600 dark:text-blue-400 disabled:text-gray-500 disabled:cursor-not-allowed text-sm font-medium hover:underline">
            {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />Loading...</span> : `Load ${Math.min(3, comments.length - visible)} more`}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">{visible} / {comments.length} comments</span>
        </div>
      )}
      {showAllComments && !hasMore && comments.length > 0 && <div className="text-center pt-4 text-xs text-gray-500 dark:text-gray-400">All {comments.length} loaded</div>}
    </div>
  );
}
