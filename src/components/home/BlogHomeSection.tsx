"use client";

// import { protocols } from "~/constants/protocols";
// import Protocol from "~/components/protocol";
// import Action from "~/components/action";
import { useEffect, useState } from "react";
// import Blog from "~/components/blog";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import StarIcon from "~/components/ui/StarIcon";

type TabType = "latest" | "popular";

function getYoutubeIdFromUrl(url: string) {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function ProtocolSection() {
  const [activeTab, setActiveTab] = useState<TabType>("latest");

  const { data: postsData, isLoading, error: postsError } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/posts");
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (postsError) {

    }
  }, [postsError]);

  const posts = Array.isArray(postsData) ? postsData.filter((p: any) => p.status === "PUBLISHED") : [];
  
  const postsWithEngagement = Array.isArray(posts) ? posts.map((post: any) => {
    const totalReactions = (post.LIKE || 0) + (post.HEART || 0) + (post.HAHA || 0) + 
                          (post.SAD || 0) + (post.ANGRY || 0) + (post.WOW || 0) + (post.SHARE || 0);
    const totalComments = post.comments || 0;
    const totalEngagement = totalReactions + totalComments;
    
    return {
      ...post,
      totalEngagement,
      totalReactions,
      totalComments
    };
  }) : [];
  
  const latestBlogs = Array.isArray(postsWithEngagement) ? postsWithEngagement.sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3) : [];
  
  const popularBlogs = Array.isArray(postsWithEngagement) ? postsWithEngagement.sort((a: any, b: any) => 
    b.totalEngagement - a.totalEngagement
  ).slice(0, 3) : [];

  const currentBlogs = activeTab === "latest" ? latestBlogs : popularBlogs;
  const displayBlogs = [...currentBlogs];
  while (displayBlogs.length < 3) displayBlogs.push(null);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <section id="protocol" className="relative flex min-h-[80vh] items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40 w-full min-w-0 overflow-x-hidden">
      <section className="mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative min-w-0">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <StarIcon size="lg" className="w-16 h-16" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">Blog</h2>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="-mb-px flex flex-wrap gap-1 sm:gap-2 md:gap-8 overflow-x-auto pb-2">
              <button
                onClick={() => handleTabChange("latest")}
                className={`py-2 px-2 sm:px-3 md:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "latest"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Top 3 New</span>
                  <span className="sm:hidden">New</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange("popular")}
                className={`py-2 px-2 sm:px-3 md:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "popular"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Top 3 Hot</span>
                  <span className="sm:hidden">Hot</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse"
                >
                  <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-24 h-16 bg-gray-300 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              displayBlogs.map((post, idx) =>
                post ? (
                  <div
                    key={post.id}
                    className="group"
                  >
                    <Link 
                      href={`/blog/${post.slug || post.id}`}
                      className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      onClick={() => {
                        const pid = post.slug || post.id;
                        try {
                          fetch('/api/blog/seen', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ postId: pid }),
                          }).catch(() => {});
                        } catch {}
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden">
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

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title with tooltip */}
                        <div className="relative group">
                          <h3
                            className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          >
                            {post.title}
                          </h3>
                          <div className="absolute left-0 top-full mt-2 opacity-0 group-hover:opacity-100 pointer-events-none z-20">
                            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded-lg shadow-lg whitespace-pre-line max-w-[80vw] md:max-w-xl relative">
                              {post.title}
                              <div className="absolute left-4 -top-2 border-b-8 border-b-gray-900 dark:border-b-gray-100 border-x-8 border-x-transparent"></div>
                            </div>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <span>
                              {new Date(post.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                              })}
                            </span>
                            {post.totalComments > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8 9 8s9 3.582 9 8z" />
                                  </svg>
                                  {post.totalComments}
                                </span>
                              </>
                            )}
                            {Array.isArray(post.tags) && post.tags.length > 0 && (
                              <>
                                <span className="shrink-0">•</span>
                                <span className="flex flex-wrap items-center gap-1 min-w-0">
                                  {post.tags.slice(0, 2).map((tag: any, i: number) => {
                                    const name = typeof tag === 'string' ? tag : (tag?.name || '');
                                    if (!name) return null;
                                    return (
                                      <span
                                        key={i}
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 shrink-0"
                                      >
                                        {name}
                                      </span>
                                    );
                                  })}
                                  {post.tags.length > 2 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">+{post.tags.length - 2}</span>
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="shrink-0 truncate max-w-[40%] text-right">{post.author || "Admin"}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700 items-center justify-center"
                  >
                    <img src="/images/common/loading.png" alt="Loading" width={60} height={40} />
                  </div>
                )
              )
            )}
          </div>
        </div>
      </section>
      {/* <Action title="Next" href="#cardano" /> */}
    </section>
  );
} 