"use client";

import { useState, useRef, useEffect } from "react";

import { useToastContext } from "../toast-provider";
import { useUser } from '~/hooks/useUser';
import Modal from '../admin/common/Modal';
import { Comment, CommentItemProps, MAX_COMMENT_LENGTH } from '~/constants/comment';
import MentionAutocomplete from '~/components/ui/mention-autocomplete';
import MentionDisplay from '~/components/ui/mention-display';
import { MentionUser, hasMentionTrigger, extractMentionQuery, insertMention, calculateMentionPosition, formatMentionsForStorage } from '~/lib/mention-utils';
import { handleEmojiConversion, convertTextToEmojiOnSubmit } from '~/lib/emoji-converter';

const formatTime = (iso: string) => (!iso ? '' : (() => { const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`; })());
const shortAddr = (s: string) => s.length > 16 ? `${s.slice(0, 6)}...${s.slice(-6)}` : s;
const getAvatar = (c: Comment) => (c.user?.image?.startsWith('http') || c.user?.image?.startsWith('data:') ? c.user.image : c.avatar?.startsWith('http') || c.avatar?.startsWith('data:') ? c.avatar : '') || '';

export default function CommentItem({ comment, onSubmitReply, onDeleteComment, onUpdateComment, user, activeReplyId, setActiveReplyId, depth = 0, hoveredId, setHoveredId }: CommentItemProps) {
  const [replyText, setReplyText] = useState("");
  const [visibleReplies, setVisibleReplies] = useState(2);
  const [expandedComment, setExpandedComment] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const { showSuccess, showError } = useToastContext();
  const [showMention, setShowMention] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPos, setMentionPos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState(0);
  const [mentions, setMentions] = useState<Array<{ id: string; name: string; displayName: string }>>([]);
  const replyRef = useRef<HTMLInputElement>(null);

  const onReplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value, pos = e.target.selectionStart ?? 0;
    const { convertedText, newCursorPosition, shouldConvert } = handleEmojiConversion(v, pos);
    if (shouldConvert) { setReplyText(convertedText); setCursorPos(newCursorPosition); setTimeout(() => replyRef.current?.setSelectionRange(newCursorPosition, newCursorPosition), 0); }
    else { setReplyText(v); setCursorPos(pos); }
    if (hasMentionTrigger(convertedText, shouldConvert ? newCursorPosition : pos)) {
      const q = extractMentionQuery(convertedText, shouldConvert ? newCursorPosition : pos);
      if (q !== null) { setMentionQuery(q); if (replyRef.current) setMentionPos(calculateMentionPosition(replyRef.current, newCursorPosition, convertedText)); setShowMention(true); }
    } else setShowMention(false);
  };
  const onMentionSelect = (u: MentionUser) => {
    const { newText, newCursorPosition, insertedMention } = insertMention(replyText, cursorPos, mentionQuery, u);
    setReplyText(newText); setMentions(prev => [...prev, insertedMention]); setShowMention(false); setMentionQuery("");
    setTimeout(() => { replyRef.current?.focus(); replyRef.current?.setSelectionRange(newCursorPosition, newCursorPosition); }, 0);
  };

  const { isAuthenticated, user: currentUser } = useUser();
  const [deleted, setDeleted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        if (comment.replies && comment.replies.length > 0) {
          setVisibleReplies(comment.replies.length);
        }
        if (hash === `#comment-${comment.id}`) {
          setExpandedComment(true);
        }
      }
    }
  }, [comment.id]);

  const submitReply = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const storage = formatMentionsForStorage(convertTextToEmojiOnSubmit(replyText), mentions);
    await onSubmitReply(commentId, storage, user || {});
    setReplyText(""); setMentions([]); setActiveReplyId(null); setShowMention(false);
  };
  const onReplyClick = () => {
    if (!isAuthenticated) { showError('Sign in to reply'); return; }
    setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
    setReplyText(activeReplyId === comment.id ? '' : `@${comment.user?.displayName || comment.author || comment.userId || ''} `);
  };
  const loadMore = () => { setLoadingReplies(true); setTimeout(() => { setVisibleReplies(v => Math.min(v + 3, comment.replies?.length ?? 0)); setLoadingReplies(false); }, 1000); };
  const copy = (text: string) => { navigator.clipboard.writeText(text); showSuccess('Copied!'); };
  const handleDelete = async () => {
    setShowDeleteModal(false);
    if (onDeleteComment) try { await onDeleteComment(comment.id); setDeleted(true); } catch { showError('Delete error'); }
    else showError('WebSocket not available');
  };

  const canEdit = currentUser?.id === comment.userId;
  const canDelete = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === comment.userId);
  const isBanned = currentUser?.isBanned && currentUser?.bannedUntil && new Date(currentUser.bannedUntil) > new Date();
  const isHovered = hoveredId === comment.id && !!comment.parentCommentId;
  const isParentHighlight = hoveredId === comment.parentCommentId;
  const indent = comment.parentCommentId ? 'pl-2 md:pl-4' : '';
  const truncated = comment.content.length > MAX_COMMENT_LENGTH;
  const inputCls = "w-full rounded-xl bg-gray-200/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 p-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500/50 text-sm";

  if (deleted) return null;

  return (
    <div
      id={`comment-${comment.id}`}
      className={comment.parentCommentId ? 'relative' : ''}
      style={{ maxWidth: '100%' }}
      onMouseEnter={() => setHoveredId && setHoveredId(comment.id)}
      onMouseLeave={() => setHoveredId && setHoveredId(null)}
    >
      {comment.parentCommentId && (
        <div className="absolute left-0 top-0 h-full w-4 flex"><div className={`border-l-2 h-full ml-2 transition-colors ${isHovered ? 'border-blue-500 dark:border-blue-400' : 'border-gray-300 dark:border-gray-700'}`} /></div>
      )}
      <div className={`${indent} w-full`}>
        <div className={`space-y-3 ${isParentHighlight ? 'bg-blue-100/50 dark:bg-blue-900/30' : ''}`} style={{ wordBreak: 'break-word' }}>
          <div className="flex items-start gap-3">
            <img src={getAvatar(comment) || "/images/common/loading.png"} alt="avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  {!comment.user?.displayName && !comment.author && <span className="font-semibold text-gray-900 dark:text-white text-xs font-mono cursor-pointer select-all" title="Copy" onClick={() => copy(comment.userId || '')}>{shortAddr(comment.userId || '')}</span>}
                  {(comment.user?.displayName || comment.author) && <span className="text-blue-600 dark:text-blue-500 text-sm font-medium cursor-pointer" title="Copy" onClick={() => copy(comment.user?.displayName || comment.author || '')}>{comment.user?.displayName || comment.author}</span>}
                  {comment.isPostAuthor && <span className="ml-2 italic font-bold text-blue-600 dark:text-blue-500 text-xs">author</span>}
                </div>
                {editing ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <textarea className={inputCls} value={editText} onChange={e => setEditText(e.target.value)} rows={3} placeholder="Edit..." />
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => { setEditing(false); setEditText(comment.content); }} className="px-4 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Cancel</button>
                      <button type="button" onClick={async () => { if (!editText.trim()) { showError('Content cannot be empty'); return; } if (onUpdateComment) try { await onUpdateComment(comment.id, editText); setEditing(false); } catch { showError('Update error'); } else showError('WebSocket not available'); }} className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed"><MentionDisplay content={truncated && !expandedComment ? `${comment.content.slice(0, MAX_COMMENT_LENGTH)}...` : comment.content} /></p>
                    {truncated && <button type="button" onClick={() => setExpandedComment(!expandedComment)} className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-1">{expandedComment ? 'Show less' : 'Show more'}</button>}
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                {!isBanned && <button type="button" onClick={onReplyClick} className="font-medium hover:text-gray-700 dark:hover:text-gray-300">Reply</button>}
                {canEdit && !editing && !isBanned && <button type="button" onClick={() => { setEditText(comment.content); setEditing(true); }} className="text-yellow-600 dark:text-yellow-400 font-medium ml-2">Edit</button>}
                {canDelete && !isBanned && (
                  <>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="hover:text-red-600 dark:hover:text-red-400 text-red-600 dark:text-red-300 transition-colors font-medium ml-2"
                    >
                      Delete
                    </button>
                    <Modal
                      isOpen={showDeleteModal}
                      onClose={() => setShowDeleteModal(false)}
                      title="Delete comment confirmation"
                    >
                      <div className="space-y-4">
                        <p>Are you sure you want to delete this comment?</p>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </Modal>
                  </>
                )}
                <span className="text-gray-400 dark:text-gray-500 ml-2">{formatTime(comment.time || '')}</span>
              </div>
            </div>
          </div>

          {activeReplyId === comment.id && !isBanned && (
            <div className="ml-11">
              <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-3 border border-gray-200 dark:border-gray-700/50">
                <div className="flex items-start gap-3">
                  <img src={user?.image || "/images/common/loading.png"} alt="avatar" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 relative">
                    <form onSubmit={e => submitReply(e, comment.id)}>
                      <div className="relative">
                        <input ref={replyRef} type="text" value={replyText} onChange={onReplyChange} placeholder="Write a reply... @ to mention" className={inputCls + ' pl-4 pr-10'} autoFocus />
                        <button type="submit" disabled={!replyText.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed p-1" aria-label="Send"><svg className="h-4 w-4 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
                      </div>
                    </form>
                    <MentionAutocomplete isVisible={showMention} query={mentionQuery} onSelect={onMentionSelect} onClose={() => { setShowMention(false); setMentionQuery(""); }} position={mentionPos} inputWidth={replyRef.current?.offsetWidth} inputRef={replyRef} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-11 space-y-3">
              {comment.replies.slice(0, visibleReplies).map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onSubmitReply={onSubmitReply}
                  onDeleteComment={onDeleteComment}
                  onUpdateComment={onUpdateComment}
                  user={user}
                  activeReplyId={activeReplyId}
                  setActiveReplyId={setActiveReplyId}
                  depth={depth + 1}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                />
              ))}

              {comment.replies.length > visibleReplies && !loadingReplies && <button type="button" onClick={loadMore} className="text-blue-600 dark:text-blue-400 text-sm font-medium">Load {Math.min(3, comment.replies.length - visibleReplies)} more</button>}
              {loadingReplies && <div className="text-sm text-gray-500 dark:text-gray-400 py-2">Loading...</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 