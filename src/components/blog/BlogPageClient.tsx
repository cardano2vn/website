'use client';

import Title from '~/components/title';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BlogSidebar from '~/components/blog/BlogSidebar';
import BlogPostListRow from '~/components/blog/BlogPostListRow';
import FeaturedBlogCard from '~/components/blog/FeaturedBlogCard';
import Pagination from '~/components/pagination';
import { useQuery } from '@tanstack/react-query';
import NotFoundInline from '~/components/ui/not-found-inline';
import BackgroundMotion from '~/components/ui/BackgroundMotion';
import { BlogPost, BlogTag } from '~/constants/posts';
import { useNotifications } from '~/hooks/useNotifications';

const PAGE_SIZE = 10;

export default function BlogPageClient() {
  const searchParams = useSearchParams();
  const tagFromUrl = searchParams.get('tag');
  const [search, setSearch] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(() => tagFromUrl || null);
  const [currentPage, setCurrentPage] = useState(1);

  useNotifications();

  useEffect(() => {
    setSelectedTagId(tagFromUrl || null);
  }, [tagFromUrl]);

  const { data: tagsData } = useQuery({
    queryKey: ['public-tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags');
      if (!res.ok) throw new Error('Failed to fetch tags');
      const data = await res.json();
      return data?.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
  const allTags: BlogTag[] = tagsData ?? [];

  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
  } = useQuery({
    queryKey: ['public-posts', currentPage, selectedTagId, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        public: '1',
        page: currentPage.toString(),
        limit: PAGE_SIZE.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (search) params.append('title', search);
      const tagName = selectedTagId ? allTags.find((t) => t.id === selectedTagId)?.name : null;
      if (tagName) params.append('tags', tagName);

      const res = await fetch(`/api/public/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (postsError) {
      // handle error if needed
    }
  }, [postsError]);

  const posts: BlogPost[] = postsData?.data ?? [];
  const pagination = postsData?.pagination ?? {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTagId]);

  const featuredPost = posts[0] ?? null;
  const listPosts = featuredPost ? posts.slice(1) : posts;
  const hasFilters = search || selectedTagId;

  return (
    <main className="relative pt-16 bg-white dark:bg-gray-950 overflow-x-hidden scrollbar-hide">
      <BackgroundMotion />
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-8 lg:pb-20">
        <div>
          <Title
            title="Blog"
            description="Chào mừng đến với blog kỹ thuật của cardano2vn – nguồn tài nguyên dành cho nhà đầu tư, nhà phát triển muốn chinh phục hệ sinh thái Cardano và Midnight. Chúng tôi tập trung vào việc cung cấp các bài viết phân tích, hướng dẫn chi tiết và chuyên sâu về kỹ thuật công nghệ, các ngôn ngữ lập trình hợp đồng thông minh như Plutus, Opshin, Aiken trên Cardano, Compact trên Midnight, giúp bạn tự tin xây dựng và phát triển các ứng dụng phi tập trung đột phá."
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Sidebar - categories */}
          <aside className="w-full lg:w-56 xl:w-64 flex-shrink-0">
            <BlogSidebar
              allTags={allTags}
              selectedTagId={selectedTagId}
              onSelectTag={setSelectedTagId}
            />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm theo tiêu đề..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {hasFilters && posts.length === 0 && !postsLoading ? (
              <NotFoundInline
                onClearFilters={() => {
                  setSearch('');
                  setSelectedTagId(null);
                }}
              />
            ) : postsLoading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Chưa có bài viết
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Thử đổi bộ lọc hoặc từ khóa tìm kiếm.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {featuredPost && (
                  <section>
                    <FeaturedBlogCard post={featuredPost} />
                  </section>
                )}
                <section className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 overflow-hidden">
                  {listPosts.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-white/10">
                      {listPosts.map((post) => (
                        <BlogPostListRow key={post.id} post={post} />
                      ))}
                    </div>
                  ) : null}
                </section>
              </div>
            )}

            {!postsLoading && posts.length > 0 && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
