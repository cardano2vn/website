"use client";

// import { protocols } from "~/constants/protocols";
// import Protocol from "~/components/protocol";
// import Action from "~/components/action";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import StarIcon from "~/components/ui/StarIcon";

type TabType = "latest" | "popular";

function getYoutubeIdFromUrl(url: string) {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getThumbnail(post: any): string {
  const media = post.media?.[0];
  if (media?.url) {
    const id = getYoutubeIdFromUrl(media.url);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    return media.url;
  }
  return "/images/common/loading.png";
}

function getExcerpt(html: string | undefined, maxLen = 72): string {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length <= maxLen ? text : text.slice(0, maxLen) + "...";
}

function formatPosted(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
}

export default function ProtocolSection() {
  const [activeTab, setActiveTab] = useState<TabType>("latest");

  const { data: postsData, isLoading } = useQuery({
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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <section id="protocol" className="relative border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40 w-full min-w-0 overflow-hidden scrollbar-hide">
      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden scrollbar-hide">
        <div className="mb-4 lg:mb-6 flex items-center gap-3">
          <StarIcon size="lg" className="w-16 h-16" />
          <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">Blog</h2>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex flex-wrap gap-3 overflow-x-hidden pb-2">
              <button
                onClick={() => handleTabChange("latest")}
                className={`py-2 px-2 sm:px-3 md:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "latest"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span className="hidden sm:inline">Top 3 New</span>
                <span className="sm:hidden">New</span>
              </button>
              <button
                onClick={() => handleTabChange("popular")}
                className={`py-2 px-2 sm:px-3 md:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "popular"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span className="hidden sm:inline">Top 3 Hot</span>
                <span className="sm:hidden">Hot</span>
              </button>
            </nav>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {isLoading ? (
              [...Array(3)].map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-lg rounded-b-xl" />
                  <div className="mt-3 h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                  <div className="mt-2 h-5 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                  <div className="mt-2 h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                  <div className="mt-1 h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5" />
                </div>
              ))
            ) : currentBlogs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                Chưa có bài viết.
              </div>
            ) : (
              currentBlogs.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug || post.id}`}
                  className="group flex flex-col"
                  onClick={() => {
                    const pid = post.slug || post.id;
                    fetch("/api/blog/seen", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ postId: pid }),
                    }).catch(() => {});
                  }}
                >
                  <div className="overflow-hidden rounded-t-lg rounded-b-xl bg-gray-100 dark:bg-gray-800">
                    <img
                      alt={post.title}
                      loading="lazy"
                      className="w-full aspect-video object-cover"
                      src={getThumbnail(post)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/common/loading.png";
                      }}
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    POSTED: {formatPosted(post.createdAt)}
                  </p>
                  <div className="relative group/title">
                    <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <div className="absolute left-0 top-full mt-2 opacity-0 group-hover/title:opacity-100 pointer-events-none z-20 transition-opacity">
                      <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded-lg whitespace-pre-line max-w-[80vw] md:max-w-xl relative">
                        {post.title}
                        <div className="absolute left-4 -top-2 border-b-8 border-b-gray-900 dark:border-b-gray-100 border-x-8 border-x-transparent" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {getExcerpt(post.content)}
                  </p>
                </Link>
              ))
            )}
          </div>
      </div>
    </section>
  );
} 