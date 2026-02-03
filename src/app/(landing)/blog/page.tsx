export const metadata = {
  title: 'Blog | Cardano2vn',
  description: 'Insights, updates, and stories from the Cardano2vn ecosystem.',
};

import { Suspense } from 'react';
import BlogPageClient from '~/components/blog/BlogPageClient';

function BlogFallback() {
  return (
    <main className="relative pt-16 bg-white dark:bg-gray-950 overflow-x-hidden scrollbar-hide">
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-8 lg:pb-20">
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    </main>
  );
}

export default function BlogsPage() {
  return (
    <Suspense fallback={<BlogFallback />}>
      <BlogPageClient />
    </Suspense>
  );
}