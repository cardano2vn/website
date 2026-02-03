'use client';

import Link from 'next/link';
import { BlogPost, BlogMedia } from '~/constants/posts';

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

interface FeaturedBlogCardProps {
  post: BlogPost;
}

export default function FeaturedBlogCard({ post }: FeaturedBlogCardProps) {
  const imageUrl = getPostImageUrl(post);
  const dateStr = new Date(post.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const views = post.totalViews ?? 0;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 overflow-hidden">
      <Link href={`/blog/${post.slug || post.id}`} className="block">
        <div className="relative aspect-video sm:aspect-[2/1] overflow-hidden bg-white dark:bg-gray-700">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).src = '/images/common/loading.png')}
          />
        </div>
        <div className="p-4 sm:p-5">
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.slice(0, 3).map((tag: { id?: string; name: string }, i: number) => (
                <span
                  key={tag.id ?? i}
                  className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  {typeof tag === 'string' ? tag : tag.name}
                </span>
              ))}
            </div>
          )}
          <h2 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white line-clamp-2 mb-2">
            {post.title}
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {post.author || 'Admin'} • {dateStr}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Đọc thêm</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Đã xem: {views}
          </div>
        </div>
      </Link>
    </div>
  );
}
