'use client';

import Title from "~/components/title";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BlogFilters from "~/components/blog/BlogFilters";
import BlogGrid from "~/components/blog/BlogGrid";
import BlogSkeleton from "~/components/blog/BlogSkeleton";
import Pagination from "~/components/pagination";
import { useQuery } from '@tanstack/react-query';
import NotFoundInline from "~/components/ui/not-found-inline";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
import { BlogPost, BlogTag } from '~/constants/posts';
import { useNotifications } from "~/hooks/useNotifications";


export default function BlogPageClient() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  
  useNotifications();

  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
  } = useQuery({
    queryKey: ['public-posts', currentPage, selectedTags, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        public: '1',
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (search) params.append('title', search);
      if (selectedTags.length > 0) {
        selectedTags.forEach(tag => params.append('tags', tag));
      }
      
      const res = await fetch(`/api/public/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (postsError) {

    }
  }, [postsError]);
  const posts: BlogPost[] = postsData?.data || [];
  const pagination = postsData?.pagination || { page: 1, limit: pageSize, total: 0, totalPages: 1, hasNext: false, hasPrev: false };

  const { data: tagsData } = useQuery({
    queryKey: ['public-tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags');
      if (!res.ok) throw new Error('Failed to fetch tags');
      const data = await res.json();
      return data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
  const allTags: BlogTag[] = tagsData || [];

  const paginatedPosts = posts;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTags]);

  return (
    <main className="relative pt-20 bg-white dark:bg-gray-950 overflow-x-hidden scrollbar-hide">
      <BackgroundMotion />
      <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Title
            title="Blog"
            description="Chào mừng đến với blog kỹ thuật của cardano2vn – nguồn tài nguyên dành cho nhà đầu tư, nhà phát triển muốn chinh phục hệ sinh thái Cardano và Midnight. Chúng tôi tập trung vào việc cung cấp các bài viết phân tích, hướng dẫn chi tiết và chuyên sâu về kỹ thuật công nghệ, các ngôn ngữ lập trình hợp đồng thông minh như Plutus, Opshin, Aiken trên Cardano, Compact trên Midnight, giúp bạn tự tin xây dựng và phát triển các ứng dụng phi tập trung đột phá."
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BlogFilters
            search={search}
            setSearch={setSearch}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            allTags={allTags}
          />
        </motion.div>
        
        {paginatedPosts.length === 0 && posts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            <NotFoundInline 
              onClearFilters={() => {
                setSearch('');
                setSelectedTags([]);
              }}
            />
          </motion.div>
        ) : (
          <>
            {postsLoading ? (
              <BlogSkeleton postCount={pageSize} />
            ) : posts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters.</p>
                </div>
              </div>
            ) : (
              <BlogGrid posts={paginatedPosts} pageSize={pageSize} />
            )}
          </>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            setCurrentPage={setCurrentPage}
          />
        </motion.div>
      </div>
    </main>
  );
}