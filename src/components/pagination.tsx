"use client";

import React from "react";

type Props = {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
};

function range(start: number, end: number): number[] {
  const r: number[] = [];
  for (let i = start; i <= end; i++) r.push(i);
  return r;
}

const Pagination = ({ currentPage, totalPages, setCurrentPage }: Props) => {
  if (totalPages <= 1) {
    return null;
  }

  const showEllipsisStart = currentPage > 3;
  const showEllipsisEnd = currentPage < totalPages - 2;

  const pages: (number | "ellipsis")[] = [];
  pages.push(1);
  if (totalPages <= 5) {
    for (let p = 2; p < totalPages; p++) pages.push(p);
  } else {
    if (showEllipsisStart) pages.push("ellipsis");
    const midStart = showEllipsisStart ? Math.max(2, currentPage - 1) : 2;
    const midEnd = showEllipsisEnd ? Math.min(totalPages - 1, currentPage + 1) : totalPages - 1;
    for (let p = midStart; p <= midEnd; p++) {
      if (p !== 1 && p !== totalPages && !pages.includes(p)) pages.push(p);
    }
    if (showEllipsisEnd) pages.push("ellipsis");
  }
  if (totalPages > 1) pages.push(totalPages);

  const itemClass =
    "inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 text-sm font-medium transition-colors border-r border-gray-300 dark:border-gray-600 last:border-r-0 first:rounded-l-md last:rounded-r-md";

  return (
    <nav className="flex justify-center items-center mt-6" aria-label="Phân trang">
      <div className="inline-flex items-stretch rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
          className={`${itemClass} text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none`}
          aria-label="Trang đầu"
        >
          &#171;&#171;
        </button>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className={`${itemClass} text-gray-400 dark:text-gray-500 cursor-default`}
            >
              &#8230;
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              className={
                p === currentPage
                  ? `${itemClass} bg-blue-600 text-white dark:bg-blue-600 border-blue-600 dark:border-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700`
                  : `${itemClass} text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700`
              }
              aria-label={p === currentPage ? `Trang ${p} (hiện tại)` : `Trang ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`${itemClass} text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none`}
          aria-label="Trang cuối"
        >
          &#187;&#187;
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
