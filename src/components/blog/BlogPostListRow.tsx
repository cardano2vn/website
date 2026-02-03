'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { BlogPost, BlogMedia } from '~/constants/posts';
import { isWithin24Hours } from '~/constants/posts';

function getYoutubeIdFromUrl(url: string) {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getPostImageUrl(post: BlogPost): string {
  if (Array.isArray(post.media) && post.media.length > 0) {
    const youtubeMedia = post.media.find((m: BlogMedia) => m.type === 'YOUTUBE');
    if (youtubeMedia) {
      const videoId = getYoutubeIdFromUrl(youtubeMedia.url);
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return post.media[0].url;
  }
  return '/images/common/loading.png';
}

interface BlogPostListRowProps {
  post: BlogPost;
}

export default function BlogPostListRow({ post }: BlogPostListRowProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const titleRef = useRef<HTMLSpanElement>(null);

  const imageUrl = getPostImageUrl(post);
  const isNew = isWithin24Hours(post.createdAt);
  const dateStr = new Date(post.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const views = post.totalViews ?? 0;

  const updateTooltip = () => {
    const el = titleRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    setTooltipStyle({
      position: 'fixed',
      left: Math.min(rect.left, window.innerWidth - 320 - margin),
      top: rect.bottom + margin,
      zIndex: 9999,
    });
  };

  useEffect(() => {
    if (!showTooltip) return;
    updateTooltip();
    window.addEventListener('scroll', updateTooltip, true);
    return () => window.removeEventListener('scroll', updateTooltip, true);
  }, [showTooltip]);

  return (
    <>
      <article className="group">
        <Link
          href={`/blog/${post.slug || post.id}`}
          className="flex gap-3 p-3 items-start hover:bg-white dark:hover:bg-gray-700 transition-colors min-w-0"
        >
          <div className="flex-shrink-0 w-32 h-24 sm:w-40 sm:h-28 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => ((e.target as HTMLImageElement).src = '/images/common/loading.png')}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">
              <span
                ref={titleRef}
                onMouseEnter={() => {
                  setShowTooltip(true);
                  updateTooltip();
                }}
                onMouseLeave={() => setShowTooltip(false)}
                className="inline"
              >
                {post.title}
              </span>
              {isNew && (
                <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded">
                  new
                </span>
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {dateStr}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Đã xem: {views}
              </span>
            </div>
          </div>
        </Link>
      </article>
      {showTooltip &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] max-w-[90vw] rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2"
            style={tooltipStyle}
          >
            {post.title}
          </div>,
          document.body
        )}
    </>
  );
}
