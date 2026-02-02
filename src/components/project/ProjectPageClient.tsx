"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Link from "next/link";
import TechnologyItem from "./ProjectItem";
import Pagination from "~/components/pagination";
import NotFoundInline from "~/components/ui/not-found-inline";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
import { TechnologyPageClientProps, Technology } from '~/constants/project';

export default function TechnologyPageClient({ isEmbedded = false, searchTerm = "" }: TechnologyPageClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 1;

  const {
    data: queryData,
    isLoading,
    error: technologiesError,
  } = useQuery({
    queryKey: ['project-public'],
    queryFn: async () => {
      const response = await fetch('/api/project');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (technologiesError) {

    }
  }, [technologiesError]);

  const technologies: Technology[] = queryData?.data || [];

  const filteredTechnologies = technologies.filter(technology => {
    const matchesSearch = technology.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technology.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technology.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredTechnologies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTechnologies = filteredTechnologies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (searchTerm && currentPage > 1) {
    setCurrentPage(1);
  }

  if (isEmbedded) {
    return (
      <div className="mb-16 grid grid-cols-1 gap-6">
        {isLoading ? (
          <>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
              <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
              <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
              <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </>
        ) : filteredTechnologies.length === 0 ? (
          <div>
            <NotFoundInline 
              onClearFilters={() => {

              }}
            />
          </div>
        ) : (
          <>
            {paginatedTechnologies.map((technology, index) => (
              <div key={technology.id}>
                <TechnologyItem technology={technology} />
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <main className="relative pt-20 bg-white dark:bg-gray-950">
      <BackgroundMotion />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="pb-20">
          
          {filteredTechnologies.length === 0 ? (
            <div>
              <NotFoundInline 
                onClearFilters={() => {

                }}
              />
            </div>
          ) : (
            <>
              {paginatedTechnologies.map((technology, index) => (
                <div key={technology.id}>
                  <TechnologyItem technology={technology} />
                </div>
              ))}

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
          
          <section className="mt-16 rounded-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 p-8 text-center backdrop-blur-sm">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Start Your Cardano2vn Journey Today
            </h2>
            <div>
              <Link href="https://cardano2vn.io">
                <button className="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-success p-1 text-md rounded-sm bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700">
                  Open Cardano2vn App
                </button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
} 