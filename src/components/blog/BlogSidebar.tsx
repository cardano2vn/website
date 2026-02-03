'use client';

import { BlogTag } from '~/constants/posts';

interface BlogSidebarProps {
  allTags: BlogTag[];
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
}

const activeClass = 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white';

export default function BlogSidebar({ allTags, selectedTagId, onSelectTag }: BlogSidebarProps) {
  return (
    <nav className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-white/10">
        <li>
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
              selectedTagId === null ? activeClass : 'text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-700'
            }`}
          >
            Tất cả
          </button>
        </li>
        {allTags.map((tag) => (
          <li key={tag.id}>
            <button
              type="button"
              onClick={() => onSelectTag(tag.id)}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-b border-gray-200 dark:border-white/10 last:border-b-0 ${
                selectedTagId === tag.id ? activeClass : 'text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-700'
              }`}
            >
              {tag.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
