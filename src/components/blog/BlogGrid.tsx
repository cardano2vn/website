'use client';

import React from 'react';
import { motion } from "framer-motion";
import { BlogPost, BlogMedia } from '~/constants/posts';

function getYoutubeIdFromUrl(url: string) {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

interface BlogGridProps {
  posts: BlogPost[];
  pageSize: number;
}

export default function BlogGrid({ posts, pageSize }: BlogGridProps) {
  const PAGE_SIZE = 7;
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(Math.max(0, posts.length - 0) / PAGE_SIZE);

  const getPageSlice = (all: BlogPost[], page: number) => {
    if (all.length <= PAGE_SIZE) return all;
    const start = (page - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  };

  const pagedPosts = posts.length > PAGE_SIZE ? getPageSlice(posts, currentPage) : posts;
  const renderPostCard = (post: BlogPost, index: number, isLarge = false, fullWidth = false, isHorizontal = false) => {
    let imageUrl = "/images/common/loading.png";
    if (Array.isArray(post.media) && post.media.length > 0) {
      const youtubeMedia = post.media.find((m: BlogMedia) => m.type === 'YOUTUBE');
      if (youtubeMedia) {
        const videoId = getYoutubeIdFromUrl(youtubeMedia.url);
        if (videoId) {
          imageUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      } else {
        imageUrl = post.media[0].url;
      }
    }

    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.1,
          ease: "easeOut"
        }}
        viewport={{ once: false, amount: 0.3 }}
        whileHover={{ 
          y: isLarge ? -8 : -4,
          transition: { duration: 0.3 }
        }}
        className="relative group"
      >
        <div className={`rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-gray-300 dark:hover:border-white/40 hover:shadow-xl overflow-hidden`}>
          <a href={`/blog/${post.slug || post.id}`} className={isLarge ? "block" : isHorizontal ? "flex gap-4 p-4" : "flex gap-3 p-3"}>
            {isLarge ? (
              <>
                <div className={`relative overflow-hidden ${fullWidth ? 'h-64 sm:h-80 lg:h-96' : isLarge ? 'h-64 sm:h-72 lg:h-80' : 'h-32 sm:h-40 lg:h-48'}`}>
                  <img
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    src={imageUrl}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/common/loading.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <div className="p-4">
                  {/* Tags */}
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.tags.slice(0, 3).map((tag: any, tagIndex: number) => {
                        const tagName = typeof tag === 'string' ? tag : (tag?.name || '');
                        if (!tagName) return null;
                        return (
                          <span 
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          >
                            {tagName}
                          </span>
                        );
                      })}
                      {post.tags.length > 3 && (
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <h2 className="font-bold text-lg lg:text-xl text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.author || "Admin"}</span>
                      <span>•</span>
                      <span className="font-mono">
                        {new Date(post.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Read More</span>
                  </div>
                </div>
              </>
            ) : isHorizontal ? (
              <>
                <div className="relative w-24 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    src={imageUrl}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/common/loading.png";
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Tags for small cards */}
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {post.tags.slice(0, 2).map((tag: any, tagIndex: number) => {
                        const tagName = typeof tag === 'string' ? tag : (tag?.name || '');
                        if (!tagName) return null;
                        return (
                          <span 
                            key={tagIndex}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          >
                            {tagName}
                          </span>
                        );
                      })}
                      {post.tags.length > 2 && (
                        <span 
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <h3
                    className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1"
                    title={post.title}
                  >
                    {post.title}
                  </h3>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{post.author || "Admin"}</span>
                    <span className="mx-1">•</span>
                    <span className="font-mono">
                      {new Date(post.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    src={imageUrl}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/common/loading.png";
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Tags for small cards */}
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {post.tags.slice(0, 2).map((tag: any, tagIndex: number) => {
                        const tagName = typeof tag === 'string' ? tag : (tag?.name || '');
                        if (!tagName) return null;
                        return (
                          <span 
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          >
                            {tagName}
                          </span>
                        );
                      })}
                      {post.tags.length > 2 && (
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {post.title}
                  </h3>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{post.author || "Admin"}</span>
                    <span className="mx-1">•</span>
                    <span className="font-mono">
                      {new Date(post.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </a>
        </div>
        
        {isLarge && Array.isArray(post.tags) && post.tags.length > 3 && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded-lg whitespace-nowrap relative max-w-xs">
              {post.tags.slice(3).map((tag: any) => typeof tag === 'string' ? tag : (tag?.name || '')).filter(Boolean).join(', ')}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900 dark:border-t-gray-100"></div>
            </div>
          </div>
        )}
        
        {!isLarge && Array.isArray(post.tags) && post.tags.length > 2 && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded-lg whitespace-nowrap relative max-w-xs">
              {post.tags.slice(2).map((tag: any) => typeof tag === 'string' ? tag : (tag?.name || '')).filter(Boolean).join(', ')}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900 dark:border-t-gray-100"></div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const getGridLayout = () => {
    if (pagedPosts.length === 7) {
      return {
        className: 'grid-cols-1 grid-rows-7 lg:grid-cols-3 lg:grid-rows-5',
        content: (
          <>
            <div className="col-span-1 row-span-5">
              <div className="flex flex-col gap-4 h-full">
                {pagedPosts.slice(2, 7).map((post, idx) => (
                  <div key={post.id} className="min-h-0">
                    {renderPostCard(post, idx + 2, false)}
                  </div>
                ))}
              </div>
            </div>

            {pagedPosts[0] && (
              <div className="col-span-2 col-start-2 row-span-4 row-start-1">
                {renderPostCard(pagedPosts[0], 0, true)}
              </div>
            )}

            {pagedPosts[1] && (
              <div className="col-span-2 col-start-2 row-start-5">
                {renderPostCard(pagedPosts[1], 1, false, false, true)}
              </div>
            )}
          </>
        )
      };
    } else if (pagedPosts.length === 6) {
      return {
        className: 'grid-cols-1 grid-rows-6 lg:grid-cols-3 lg:grid-rows-4',
        content: (
          <>
            <div className="row-span-2 col-start-3 row-start-1">
              {renderPostCard(pagedPosts[1] ?? pagedPosts[0], 1, true)}
            </div>
            <div className="col-span-2 row-span-2 col-start-1 row-start-1">
              {renderPostCard(pagedPosts[0], 0, true)}
            </div>
            <div className="row-span-2 row-start-3 col-start-1">
              {renderPostCard(pagedPosts[2] ?? pagedPosts[0], 2, true)}
            </div>
            <div className="row-span-2 row-start-3 col-start-2">
              {renderPostCard(pagedPosts[3] ?? pagedPosts[1], 3, true)}
            </div>
            <div className="col-start-3 row-start-3">
              {renderPostCard(pagedPosts[4] ?? pagedPosts[2], 4, false, false, true)}
            </div>
            <div className="col-start-3 row-start-4">
              {renderPostCard(pagedPosts[5] ?? pagedPosts[3], 5, false, false, true)}
            </div>
          </>
        )
      };
    } else if (pagedPosts.length === 5) {
      return {
        className: 'grid-cols-1 grid-rows-5 lg:grid-cols-3 lg:grid-rows-4',
        content: (
          <>
            <div className="row-span-2 col-start-3 row-start-1">
              {renderPostCard(pagedPosts[1] ?? pagedPosts[0], 1, true)}
            </div>
            <div className="col-span-2 row-span-2 col-start-1 row-start-1">
              {renderPostCard(pagedPosts[0], 0, true)}
            </div>
            <div className="row-span-2 row-start-3 col-start-1">
              {renderPostCard(pagedPosts[2] ?? pagedPosts[0], 2, true)}
            </div>
            <div className="row-span-2 row-start-3 col-start-2">
              {renderPostCard(pagedPosts[3] ?? pagedPosts[1], 3, true)}
            </div>
            <div className="row-span-2 row-start-3 col-start-3">
              {renderPostCard(pagedPosts[4] ?? pagedPosts[2], 4, true)}
            </div>
          </>
        )
      };
    } else if (pagedPosts.length === 4) {
      return {
        className: 'grid-cols-1 grid-rows-4 lg:grid-cols-2 lg:grid-rows-2',
        content: (
          <>
            {pagedPosts.map((post, index) => (
              <div key={post.id} className="min-h-0">
                {renderPostCard(post, index, true, true)}
              </div>
            ))}
          </>
        )
      };
    } else if (pagedPosts.length === 3) {
      return {
        className: 'grid-cols-1 grid-rows-3',
        content: (
          <>
            {pagedPosts.map((post, index) => (
              <div key={post.id}>
                {renderPostCard(post, index, true, true)}
              </div>
            ))}
          </>
        )
      };
    } else if (pagedPosts.length === 2) {
      return {
        className: 'grid-cols-1 grid-rows-2',
        content: (
          <>
            {pagedPosts.map((post, index) => (
              <div key={post.id}>
                {renderPostCard(post, index, true, true)}
              </div>
            ))}
          </>
        )
      };
    } else {
      return {
        className: 'grid-cols-1 grid-rows-1',
        content: (
          <>
            {pagedPosts.map((post, index) => (
              <div key={post.id}>
                {renderPostCard(post, index, true, true)}
              </div>
            ))}
          </>
        )
      };
    }
  };

  const layout = getGridLayout();

  return (
    <>
      <motion.section className={`grid gap-6 ${layout.className}`}>
        {layout.content}
      </motion.section>

      {posts.length > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
