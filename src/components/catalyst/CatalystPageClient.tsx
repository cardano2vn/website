"use client";
import { useState, useEffect, Suspense } from "react";
import { flushSync } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProjectCard from "~/components/catalyst-card";
import ProjectModal from "~/components/catalyst-modal";
import ProjectSkeleton from "~/components/catalyst/CatalystSkeleton";
import Pagination from "~/components/pagination";
import Navigation from "~/components/navigation";
import Title from "~/components/title";
import TechnologyPageClient from "~/components/project/ProjectPageClient";
import NotFoundInline from "~/components/ui/not-found-inline";
import Loading from "~/components/ui/Loading";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
import { useNotifications } from "~/hooks/useNotifications";

function ProjectPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [year, setYear] = useState<number | null>(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fundFilter, setFundFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("catalyst");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const ITEMS_PER_PAGE = 6;
  
  useNotifications();
  
  const { data, isLoading } = useQuery({
    queryKey: ['catalyst'],
    queryFn: async () => {
      const response = await fetch('/api/catalyst');
      if (!response.ok) throw new Error('Failed to fetch catalyst');
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
  
  const projects = data?.data || [];
  const years = Array.from(new Set(projects.map((p: any) => p.year))).sort((a: unknown, b: unknown) => (a as number) - (b as number)) as number[];
  
  useEffect(() => {
    if (years.length > 0 && year === null) {
      setYear(years[0]);
    }
  }, [years, year]);
  useEffect(() => {
    const urlTypeFilter = searchParams.get('typeFilter');
    const urlYear = searchParams.get('year');
    const urlSearch = searchParams.get('search');
    const urlStatus = searchParams.get('status');
    const urlFund = searchParams.get('fund');
    if (!urlTypeFilter && !isInitialized) {
      setTypeFilter("catalyst");
      setIsInitialized(true);
      const params = new URLSearchParams();
      params.set('typeFilter', 'catalyst');
      const allFunds = Array.from(new Set(projects.map((p: any) => p.fund))).filter(Boolean) as string[];
      if (allFunds.length > 0) {
        const highestFund = allFunds.sort((a, b) => parseInt(b.replace(/\D/g, '')) - parseInt(a.replace(/\D/g, '')))[0] || 'all';
        params.set('fund', highestFund);
        setFundFilter(highestFund);
      }
      router.push(`${pathname}?${params.toString()}`);
      return;
    }
    
    if (urlTypeFilter && (urlTypeFilter === 'catalyst' || urlTypeFilter === 'project')) {
      setTypeFilter(urlTypeFilter);
      if (urlTypeFilter === 'catalyst' && !urlFund) {
        const allFunds = Array.from(new Set(projects.map((p: any) => p.fund))).filter(Boolean) as string[];
        if (allFunds.length > 0) {
          const highestFund = allFunds.sort((a, b) => parseInt(b.replace(/\D/g, '')) - parseInt(a.replace(/\D/g, '')))[0] || 'all';
          setFundFilter(highestFund);
          const params = new URLSearchParams(searchParams.toString());
          params.set('fund', highestFund);
          router.push(`${pathname}?${params.toString()}`);
          return;
        }
      }
    }
    
    if (urlYear) {
      const yearNum = parseInt(urlYear);
      if (!isNaN(yearNum)) {
        setYear(yearNum);
      }
    }
    
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
    
    if (urlStatus) {
      setStatusFilter(urlStatus);
    }
    
    if (urlFund) {
      setFundFilter(urlFund);
    }
    
    setCurrentPage(1);
    setIsInitialized(true);
  }, [searchParams, router, pathname, isInitialized]);
  
  const filteredProjects = projects.filter((proposal: any) => {
    const matchesYear = year === null || proposal.year === year;
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatusFilter = statusFilter === 'all' || proposal.status === statusFilter;
    const matchesFundFilter = fundFilter === 'all' || proposal.fund === fundFilter;
    return matchesYear && matchesSearch && matchesStatusFilter && matchesFundFilter;
  });
  
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  

  
  const handleFilterChange = () => {
    setCurrentPage(1);
  };
  
  const updateURL = (newTypeFilter?: string, newYear?: number, newSearch?: string, newStatus?: string, newFund?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newTypeFilter !== undefined) {
      params.set('typeFilter', newTypeFilter);
    }
    if (newYear !== undefined) {
      params.set('year', newYear.toString());
    }
    if (newSearch !== undefined) {
      if (newSearch) {
        params.set('search', newSearch);
      } else {
        params.delete('search');
      }
    }
    if (newStatus !== undefined) {
      if (newStatus && newStatus !== 'all') {
        params.set('status', newStatus);
      } else {
        params.delete('status');
      }
    }
    if (newFund !== undefined) {
      if (newFund && newFund !== 'all') {
        params.set('fund', newFund);
      } else {
        params.delete('fund');
      }
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    setCurrentPage(1);
    setSearchTerm("");
    setStatusFilter("all");
    setFundFilter("all");
    setTypeFilter("catalyst");
    updateURL("catalyst", newYear, "", "all", "all");
  };

  const handleOpenModal = (project: any) => {
    flushSync(() => {
      setSelectedProject(project);
      setIsModalOpen(true);
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };
  
  return (
    <main className="relative pt-20 bg-white dark:bg-gray-950">
      <BackgroundMotion />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 lg:px-8">
        <div>
          <Title
            title="Cardano2vn Catalyst"
            description="Hành trình của chúng tôi trong việc xây dựng nền tảng và hệ sinh thái Cardano2VN, từ những ngày đầu thành lập cho đến hiện tại — và hướng tới tương lai."
          />
        </div>

        <div className="relative">
          <div className="relative z-10">
            <div className="mb-8 mt-2">
              <div dir="ltr" data-orientation="vertical" className="flex flex-col md:flex-row">
                <div>
                  <Navigation 
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                    fundFilter={fundFilter}
                    typeFilter={typeFilter}
                    projects={projects}
                    years={years}
                    selectedYear={year || 0}
                    onSearchChange={(value) => {
                      setSearchTerm(value);
                      updateURL(undefined, undefined, value);
                      handleFilterChange();
                    }}
                    onStatusChange={(value) => {
                      setStatusFilter(value);
                      updateURL(undefined, undefined, undefined, value);
                      handleFilterChange();
                    }}
                    onFundChange={(value) => {
                      setFundFilter(value);
                      updateURL(undefined, undefined, undefined, undefined, value);
                      handleFilterChange();
                    }}
                    onTypeChange={(value) => {
                      setTypeFilter(value);
                      updateURL(value);
                      handleFilterChange();
                    }}
                    onYearChange={handleYearChange}
                  />
                </div>
                
                <div className="mt-6 flex-1 md:-mt-12">
                  {typeFilter === "catalyst" ? (
                    <div
                      data-state="active"
                      data-orientation="vertical"
                      role="tabpanel"
                      aria-labelledby="radix-:ri:-trigger-2023"
                      id="radix-:ri:-content-2023"
                      className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-0"
                    >
                      <div className="mb-8 text-right">
                        <h2 className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-6xl font-bold tracking-tight text-transparent">
                          {year}
                        </h2>
                      </div>
                      
                      <div className="mb-16 grid grid-cols-1 gap-6">
                        {isLoading ? (
                          <>
                            {[...Array(5)].map((_, idx) => (
                              <div key={idx}>
                                <ProjectSkeleton />
                              </div>
                            ))}
                          </>
                        ) : filteredProjects.length === 0 ? (
                          <div>
                            <NotFoundInline 
                              onClearFilters={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setFundFilter('all');
                                updateURL(undefined, undefined, '', 'all', 'all');
                              }}
                            />
                          </div>
                        ) : (
                          <>
                            {paginatedProjects.map((proposal: any, index: number) => (
                              <div key={index}>
                                <ProjectCard project={proposal} onOpenModal={handleOpenModal} />
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
                      </div>
                    </div>
                  ) : (
                    <div>
                      <TechnologyPageClient isEmbedded={true} searchTerm={searchTerm} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
}

export default function ProjectPageClient() {
  return (
    <Suspense fallback={<Loading />}>
      <ProjectPageContent />
    </Suspense>
  );
} 