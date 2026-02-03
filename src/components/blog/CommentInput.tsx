"use client";

import { useState, useRef } from "react";
import { CommentInputProps } from '~/constants/comment';
import MentionAutocomplete from '~/components/ui/mention-autocomplete';
import { MentionUser, hasMentionTrigger, extractMentionQuery, insertMention, calculateMentionPosition, formatMentionsForStorage } from '~/lib/mention-utils';
import { convertTextToEmoji, handleEmojiConversion, convertTextToEmojiOnSubmit } from '~/lib/emoji-converter';

const inputCls = "w-full rounded-xl bg-gray-200/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 pl-4 pr-10 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500/50 text-sm";
const sendBtnCls = "absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors p-1";
const SendIcon = () => <svg className="h-4 w-4 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;

export default function CommentInput({ onSubmit, user }: CommentInputProps) {
  const [commentText, setCommentText] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionsInInput, setMentionsInInput] = useState<Array<{ id: string; name: string; displayName: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBanned = user?.isBanned && user?.bannedUntil && new Date(user.bannedUntil) > new Date();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const pos = e.target.selectionStart ?? 0;
    const { convertedText, newCursorPosition, shouldConvert } = handleEmojiConversion(value, pos);
    if (shouldConvert) {
      setCommentText(convertedText);
      setCursorPosition(newCursorPosition);
      setTimeout(() => inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition), 0);
    } else {
      setCommentText(value);
      setCursorPosition(pos);
    }
    if (hasMentionTrigger(convertedText, shouldConvert ? newCursorPosition : pos)) {
      const q = extractMentionQuery(convertedText, shouldConvert ? newCursorPosition : pos);
      if (q !== null) {
        setMentionQuery(q);
        if (inputRef.current) setMentionPosition(calculateMentionPosition(inputRef.current, newCursorPosition, convertedText));
        setShowMentionDropdown(true);
      }
    } else setShowMentionDropdown(false);
  };

  const onMentionSelect = (selected: MentionUser) => {
    const { newText, newCursorPosition, insertedMention } = insertMention(commentText, cursorPosition, mentionQuery, selected);
    setCommentText(newText);
    setMentionsInInput(prev => [...prev, insertedMention]);
    setShowMentionDropdown(false);
    setMentionQuery("");
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition); }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const storage = formatMentionsForStorage(convertTextToEmojiOnSubmit(commentText), mentionsInInput);
    onSubmit(storage, user);
    setCommentText("");
    setMentionsInInput([]);
    setShowMentionDropdown(false);
  };

  if (isBanned) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-3 border border-gray-200 dark:border-gray-700/50">
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" /></svg>
          <span className="text-sm font-medium">You are banned from commenting</span>
        </div>
        <div className="text-center text-gray-600 dark:text-gray-400">Ban until: <b>{user?.bannedUntil ? new Date(user.bannedUntil).toLocaleString() : 'Unknown'}</b></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-3 border border-gray-200 dark:border-gray-700/50">
      <div className="flex items-start gap-3">
        <img src={user?.image || "/images/common/loading.png"} alt="avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 relative">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input ref={inputRef} type="text" value={commentText} onChange={handleChange} placeholder="Write a comment... Use @ to mention" className={inputCls} />
              <button type="submit" disabled={!commentText.trim()} className={sendBtnCls} aria-label="Send"><SendIcon /></button>
            </div>
            {commentText && convertTextToEmoji(commentText) !== commentText && (
              <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">Preview: <span className="text-gray-700 dark:text-gray-300">{convertTextToEmoji(commentText)}</span></div>
            )}
          </form>
          <MentionAutocomplete isVisible={showMentionDropdown} query={mentionQuery} onSelect={onMentionSelect} onClose={() => { setShowMentionDropdown(false); setMentionQuery(""); }} position={mentionPosition} inputWidth={inputRef.current?.offsetWidth} inputRef={inputRef} />
        </div>
      </div>
    </div>
  );
}
