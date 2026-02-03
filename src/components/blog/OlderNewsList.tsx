"use client";

import Link from "next/link";
import { isWithin24Hours } from "~/constants/posts";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
}

interface OlderNewsListProps {
  posts: PostItem[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function OlderNewsList({ posts }: OlderNewsListProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-4">
        Những tin cũ hơn
      </h2>
      <ul className="space-y-2">
        {posts.map((p) => {
          const isNew = isWithin24Hours(p.createdAt);
          return (
            <li key={p.id}>
              <Link
                href={`/blog/${p.slug || p.id}`}
                className="flex items-baseline gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="text-gray-400 dark:text-gray-500">&gt;</span>
                <span className="flex-1 min-w-0">
                  {p.title} ({formatDate(p.createdAt)})
                </span>
                {isNew && (
                  <span className="shrink-0 inline-flex px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded">
                    new
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
