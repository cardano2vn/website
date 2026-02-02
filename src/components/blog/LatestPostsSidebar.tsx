"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Link from "next/link";

interface LatestPost {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  author: string;
  tags: Array<{ id: string; name: string } | string>;
  media?: Array<{ url: string; type: string; id?: string }>;
}

function getYoutubeIdFromUrl(url: string) {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

interface LatestPostsSidebarProps {
  currentPostSlug?: string;
}

export default function LatestPostsSidebar({ currentPostSlug }: LatestPostsSidebarProps) {
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["latest-posts"],
    queryFn: async () => {
      const res = await fetch("/api/public/posts?limit=5&sortBy=createdAt&sortOrder=desc");
      if (!res.ok) throw new Error('Failed to fetch latest posts');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const latestPosts: LatestPost[] = postsData?.data || [];

  const updateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 280;
    const tooltipHeight = 60; 
    const margin = 12;

    let left = rect.left;
    let top = rect.bottom + margin;

    if (left + tooltipWidth > viewportWidth - margin) {
      left = viewportWidth - tooltipWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    if (top + tooltipHeight > viewportHeight - margin) {
      top = rect.top - tooltipHeight - margin;
    }

    setTooltipStyle({
      position: 'fixed',
      left: Math.max(margin, left),
      top: Math.max(margin, top),
      zIndex: 9999
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Latest Posts</h4>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100/70 dark:bg-gray-800/70 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (latestPosts.length === 0) return null;

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white">Latest Posts</h4>
      </div>
      
      <div className="rounded-md ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/40 dark:bg-gray-900/30 backdrop-blur-sm divide-y divide-gray-200/70 dark:divide-gray-700/60 overflow-visible">
        {latestPosts.map((post, idx) => {
          const isCurrentPost = currentPostSlug && (post.slug === currentPostSlug || post.id === currentPostSlug);
          
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group relative flex items-center justify-between py-3 px-3 transition-colors ${
                isCurrentPost 
                  ? "bg-blue-50/70 dark:bg-blue-900/40" 
                  : "hover:bg-indigo-50/70 dark:hover:bg-indigo-900/40"
              }`}
            >
              {isCurrentPost && (
                <span className="absolute left-0 top-0 h-full w-0.5 bg-blue-500 opacity-100" />
              )}
              {!isCurrentPost && (
                <span className="absolute left-0 top-0 h-full w-0.5 bg-indigo-400/80 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              
              <Link href={`/blog/${post.slug || post.id}`} className="flex items-center gap-3 min-w-0 flex-1" onClick={() => {
                const pid = post.slug || post.id;
                try {
                  fetch('/api/blog/seen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ postId: pid }),
                  }).catch(() => {});
                } catch {}
              }}>
                {/* Image */}
                <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    src={(() => {
                      const media = post.media?.[0];
                      if (media && typeof media.url === 'string' && media.url) {
                        const youtubeId = getYoutubeIdFromUrl(media.url);
                        if (youtubeId) {
                          return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                        }
                        return media.url;
                      }
                      return "/images/common/loading.png";
                    })()}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/common/loading.png";
                    }}
                  />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div 
                    className={`relative text-sm font-medium ${
                      isCurrentPost 
                        ? "text-blue-700 dark:text-blue-300" 
                        : "text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                    }`}
                    onMouseEnter={(e) => {
                      setHoveredPostId(post.id);
                      updateTooltipPosition(e.currentTarget);
                    }}
                    onMouseMove={(e) => {
                      if (hoveredPostId === post.id) {
                        updateTooltipPosition(e.currentTarget);
                      }
                    }}
                    onMouseLeave={() => setHoveredPostId(null)}
                  >
                    <span className="block truncate">{post.title}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </span>
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <span>• {typeof post.tags[0] === 'string' ? post.tags[0] : post.tags[0].name}</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      
      {mounted && hoveredPostId && (() => {
        const hoveredPost = latestPosts.find(p => p.id === hoveredPostId);
        return hoveredPost && createPortal(
          <div style={tooltipStyle} className="pointer-events-none">
            <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-pre-line max-w-[70vw] relative">
              {hoveredPost.title}
              <div className="absolute left-4 -top-2 border-b-8 border-b-gray-900 dark:border-b-white border-x-8 border-x-transparent"></div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
