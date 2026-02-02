"use client";

import { useState, useMemo, useEffect } from "react";
import { flushSync } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { Course } from "~/constants/admin";
import CourseModal from "./CourseModal";
import { Pagination } from "~/components/ui/pagination";

import StarIcon from "../ui/StarIcon";
import ContestSection from "./ContestSection";

type TabType = "latest" | "all" | "quiz-blockchain";

export default function CourseSection() {
  const [activeTab, setActiveTab] = useState<TabType>("latest");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const handleHash = () => {
      if (typeof window === 'undefined') return;
      if (window.location.hash === '#quiz-blockchain') {
        setActiveTab('quiz-blockchain');
        const section = document.getElementById('courses');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const { data: coursesData, isLoading, error: coursesError } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      return data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });



  const courses = coursesData?.filter((c: Course) => c.isActive) || [];
  
  const latestCourses = courses
    .sort((a: Course, b: Course) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);
  
  const allCourses = courses.sort((a: Course, b: Course) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const currentCourses = activeTab === "all" ? allCourses : latestCourses;
  const displayCourses = [...currentCourses];
  while (displayCourses.length < 3) displayCourses.push(null);

  const handleCourseClick = (course: Course) => {
    flushSync(() => {
      setSelectedCourse(course);
      setIsModalOpen(true);
    });
  };

  // Find the index of the selected course in the current courses list
  const getSelectedCourseIndex = () => {
    if (!selectedCourse) return 0;
    return currentCourses.findIndex((c: Course | null) => c && c.id === selectedCourse.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleEnroll = (course: Course) => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      setTimeout(() => {
        const courseSelect = document.querySelector('select[name="your-course"]') as HTMLSelectElement;
        if (courseSelect) {
          courseSelect.value = course.name;
          const event = new Event('change', { bubbles: true });
          courseSelect.dispatchEvent(event);
        }
        
        if (course.location) {
          const locationSelect = document.querySelector('select[name="event-location"]') as HTMLSelectElement;
          if (locationSelect) {
            locationSelect.value = course.location;
            locationSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }, 500);
    }
  };

  const totalPages = Math.ceil(allCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allCourses, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "all") {
      setCurrentPage(1);
    }
    if (typeof window !== 'undefined') {
      if (tab === 'quiz-blockchain') {
        if (window.location.hash !== '#quiz-blockchain') {
          window.location.hash = 'quiz-blockchain';
        }
      } else if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  return (
    <section id="courses" className="relative flex min-h-[80vh] items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40 w-full min-w-0 overflow-x-hidden">
      <section className="mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative min-w-0">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <StarIcon size="lg" className="w-16 h-16" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">Our courses</h2>
            </div>
  
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="-mb-px flex flex-wrap gap-1 sm:gap-2 md:gap-8 overflow-x-auto pb-2">
              <button
                onClick={() => handleTabChange("latest")}
                className={`py-2 px-2 sm:px-3 md:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "latest"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                                     <span className="hidden sm:inline">3 Latest Courses</span>
                   <span className="sm:hidden">Latest</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange("all")}
                className={`py-2 px-2 sm:px-3 md:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                <span className="hidden sm:inline">All Courses</span>
                   <span className="sm:hidden">All</span>
                </div>
              </button>
              <button
                id="quiz-blockchain"
                onClick={() => handleTabChange("quiz-blockchain")}
                className={`py-2 px-2 sm:px-3 md:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "quiz-blockchain"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Quiz blockhain</span>
                  <span className="sm:hidden">Quiz blockhain</span>
                </div>
              </button>
            </nav>
          </div>

          {activeTab === "quiz-blockchain" ? (
            <ContestSection />
          ) : activeTab === "latest" ? (
            <div className="grid max-w-none min-w-0 w-full gap-6 sm:gap-8 md:gap-10 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                [...Array(3)].map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse"
                  >
                    <div className="bg-gray-300 dark:bg-gray-700 rounded-lg h-48 mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                ))
              ) : (
                displayCourses.map((course, idx) =>
                  course ? (
                    <div
                      key={course.id}
                      className="flex flex-col min-w-0"
                    >
                      <div className="rounded-xl border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-xl hover:border-gray-300 dark:hover:border-white/40 hover:shadow-2xl h-full flex flex-col overflow-hidden cursor-pointer min-w-0"
                        onClick={() => handleCourseClick(course)}
                      >
                        {/* Image Section - Fixed height */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={course.image || "/images/common/loading.png"}
                            alt={course.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/common/loading.png";
                            }}
                          />
                        </div>

                        {/* Content Section - Compact */}
                        <div className="p-4 flex flex-col">
                          {/* Title - Compact with tooltip */}
                          <div className="relative">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {course.title || course.name}
                            </h3>
                            <div className="absolute left-0 top-full mt-1 opacity-0 group-hover:opacity-100 pointer-events-none z-20">
                              <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-pre-line max-w-[80vw] md:max-w-sm relative">
                                {course.title || course.name}
                                <div className="absolute left-4 -top-2 border-b-8 border-b-gray-900 dark:border-b-gray-100 border-x-8 border-x-transparent"></div>
                              </div>
                            </div>
                          </div>

                          {/* Footer - Compact */}
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center justify-between">
                              <span className="font-mono">
                                {new Date(course.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric"
                                })}
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">View Course</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={idx}
                      className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-6 flex items-center justify-center"
                    >
                      <img src="/images/common/loading.png" alt="Loading" width={120} height={120} />
                    </div>
                  )
                )
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                [...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse"
                  >
                    <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="w-24 h-16 bg-gray-300 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : paginatedCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">No courses available</p>
                    <p className="text-sm">Please check back later for new courses</p>
                  </div>
                </div>
              ) : (
                <>
                  {paginatedCourses.map((course: Course, idx: number) => (
                    <div
                      key={course.id}
                      className="group"
                    >
                      <div 
                        className="flex gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer min-w-0"
                        onClick={() => handleCourseClick(course)}
                      >
                        <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={course.image || "/images/common/loading.png"}
                            alt={course.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/common/loading.png";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="relative">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {course.title || course.name}
                            </h3>
                            <div className="absolute left-0 top-full mt-1 opacity-0 group-hover:opacity-100 pointer-events-none z-20">
                              <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-pre-line max-w-[80vw] md:max-w-sm relative">
                                {course.title || course.name}
                                <div className="absolute left-4 -top-2 border-b-8 border-b-gray-900 dark:border-b-gray-100 border-x-8 border-x-transparent"></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>
                              {new Date(course.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                              })}
                            </span>
                            <span>•</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">View Course</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={allCourses.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
        )}
        </div>
      </section>

      <CourseModal
        course={selectedCourse}
        courses={currentCourses}
        initialIndex={getSelectedCourseIndex()}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEnroll={handleEnroll}
      />
    </section>
  );
}
