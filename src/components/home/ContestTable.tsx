"use client";

import React from "react";
import Pagination from "~/components/pagination";

export default function ContestTable({ page: initialPage = 1, pageSize: initialPageSize = 10 }: { page?: number; pageSize?: number }) {
  const [rows, setRows] = React.useState<string[][] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState<number>(initialPage);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const pageSize = initialPageSize || 10;

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        params.set('period', 'all');
        const res = await fetch(`/api/contest/list?${params.toString()}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.error || 'Failed');
        let values: string[][] = data.data?.values || [];
        const metaTotalPages = Number(data?.data?.totalPages) || 1;
        if (!cancelled) setTotalPages(metaTotalPages);
        if (values.length > 1) {
          const headers = values[0].map((h: string) => (h || '').toString().trim().toLowerCase());
          const emailIdx = headers.indexOf('your-email');
          if (emailIdx >= 0) {
            const maskEmail = (email: string) => {
              const str = (email || '').toString();
              const at = str.indexOf('@');
              if (at <= 0) return str;
              const local = str.slice(0, at);
              const domain = str.slice(at);
              const keep = Math.ceil(local.length * 0.7); 
              const masked = local.slice(0, keep) + '*'.repeat(Math.max(0, local.length - keep));
              return masked + domain;
            };
            values = [values[0], ...values.slice(1).map((r: string[]) => {
              const c = [...r];
              c[emailIdx] = maskEmail(c[emailIdx] || '');
              return c;
            })];
          }
        }
        if (!cancelled) setRows(values);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, pageSize]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse">
        <div className="p-4">
          <div className="h-5 w-44 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>;
  if (!rows || rows.length === 0) return <div className="text-sm text-gray-500">No data</div>;

  const originalHeaders = rows[0].map((h) => (h || '').toString().trim().toLowerCase());
  const headerMap: Record<string, string> = {
    'stt': 'SBD',
    'your-email': 'USER',
    'score': 'SCORE',
    'date': 'DATE',
  };
  const displayHeaders = ['STT', ...originalHeaders.map((h) => headerMap[h] || h.toUpperCase())];

  return (
    <div className="overflow-auto rounded-md ring-1 ring-gray-200 dark:ring-gray-700 w-full">
      <table className="min-w-full text-sm w-full">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <tr>
            {displayHeaders.map((cell, i) => (
              <th
                key={i}
                className={`px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700 ${i === 0 ? 'w-24 min-w-[6rem]' : ''}`}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {rows.slice(1).map((r, ri) => {
            const overallIndex = (page - 1) * pageSize + ri;
            const topClass = overallIndex === 0
              ? 'bg-blue-500/20 dark:bg-blue-500/5'
              : overallIndex === 1
                ? 'bg-blue-500/12 dark:bg-blue-500/10'
                : overallIndex === 2
                  ? 'bg-blue-500/8 dark:bg-blue-500/15'
                  : '';

                  const Medal = () => {
                    const Wrapper = ({ color, children }: { color: string; children: React.ReactNode }) => (
                      <span className="relative inline-flex items-center justify-center w-5 h-5 mr-1">
                        <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-70 animate-ping`}></span>
                        <span className="relative z-10">{children}</span>
                      </span>
                    );
                    if (overallIndex === 0) {
                      return (
                        <Wrapper color="bg-cyan-400">
                          <svg
                            aria-label="Top 1 - Kim cương"
                            className="w-4 h-4 shrink-0"
                            viewBox="0 0 64 64"
                          >
                            <defs>
                              <radialGradient id="diamondGradient" cx="50%" cy="40%" r="60%">
                                <stop offset="0%" stopColor="#e0faff" />
                                <stop offset="40%" stopColor="#7dd3fc" />
                                <stop offset="100%" stopColor="#0ea5e9" />
                              </radialGradient>
                              <filter id="glowDiamond">
                                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                <feMerge>
                                  <feMergeNode in="coloredBlur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>
                            <path
                              d="M32 4L8 20l24 40 24-40L32 4z"
                              fill="url(#diamondGradient)"
                              stroke="#bae6fd"
                              strokeWidth="2"
                              filter="url(#glowDiamond)"
                            />
                            <circle cx="32" cy="20" r="8" fill="white" opacity="0.4">
                              <animate
                                attributeName="opacity"
                                values="0.2;0.8;0.2"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </svg>
                        </Wrapper>
                      );
                    }
                    if (overallIndex === 1) {
                      return (
                        <Wrapper color="bg-yellow-400">
                          <svg
                            aria-label="Top 2 - Vàng"
                            className="w-4 h-4 shrink-0"
                            viewBox="0 0 64 64"
                          >
                            <defs>
                              <radialGradient id="goldGradient" cx="50%" cy="50%" r="60%">
                                <stop offset="0%" stopColor="#fff9c4" />
                                <stop offset="40%" stopColor="#facc15" />
                                <stop offset="100%" stopColor="#ca8a04" />
                              </radialGradient>
                              <filter id="glowGold">
                                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                <feMerge>
                                  <feMergeNode in="coloredBlur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>
                            <path
                              d="M32 6l7.5 15.2 16.8 2.4-12.2 11.9 2.9 16.8L32 43.6l-14.9 8.7 2.9-16.8-12.2-11.9 16.8-2.4L32 6z"
                              fill="url(#goldGradient)"
                              stroke="#fef08a"
                              strokeWidth="2"
                              filter="url(#glowGold)"
                            />
                            <circle cx="32" cy="20" r="6" fill="white" opacity="0.3">
                              <animate
                                attributeName="opacity"
                                values="0.3;1;0.3"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </svg>
                        </Wrapper>
                      );
                    }
                  
                    if (overallIndex === 2) {
                      return (
                        <Wrapper color="bg-amber-500">
                          <svg
                            aria-label="Top 3 - Đồng"
                            className="w-4 h-4 shrink-0"
                            viewBox="0 0 64 64"
                          >
                            <defs>
                              <radialGradient id="bronzeGradient" cx="50%" cy="50%" r="60%">
                                <stop offset="0%" stopColor="#fde68a" />
                                <stop offset="40%" stopColor="#d97706" />
                                <stop offset="100%" stopColor="#78350f" />
                              </radialGradient>
                              <filter id="glowBronze">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                  <feMergeNode in="coloredBlur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>
                            <path
                              d="M32 6l7.5 15.2 16.8 2.4-12.2 11.9 2.9 16.8L32 43.6l-14.9 8.7 2.9-16.8-12.2-11.9 16.8-2.4L32 6z"
                              fill="url(#bronzeGradient)"
                              stroke="#fbbf24"
                              strokeWidth="2"
                              filter="url(#glowBronze)"
                            />
                            <circle cx="32" cy="22" r="5" fill="white" opacity="0.25">
                              <animate
                                attributeName="opacity"
                                values="0.2;0.7;0.2"
                                dur="2.4s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </svg>
                        </Wrapper>
                      );
                    }
                    
                    return (
                      <svg
                        aria-label="Rank"
                        className="w-4 h-4 mr-1 shrink-0 fill-current text-gray-400 dark:text-gray-500"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26 6.91 1.01-5 4.87 1.18 6.86L12 18.77l-6.18 3.23L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    );
                  };
                  
            return (
              <tr key={ri} className={`border-b border-gray-100 dark:border-gray-800 ${topClass}`}>
                <td className="px-3 py-2 whitespace-nowrap text-gray-800 dark:text-gray-100">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-flex items-center justify-center w-5 h-5">
                      <Medal />
                    </span>
                    <span className="tabular-nums w-5 text-center">{overallIndex + 1}</span>
                  </span>
                </td>
              {r.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 whitespace-nowrap text-gray-800 dark:text-gray-100">{cell}</td>
              ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination currentPage={page} totalPages={totalPages} setCurrentPage={setPage} />
    </div>
  );
}


