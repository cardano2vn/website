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

function formatPosted(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
}

const ITEMS_PER_PAGE = 6;

export default function CourseSection() {
  const [activeTab, setActiveTab] = useState<TabType>("latest");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fn = () => {
      if (typeof window === "undefined") return;
      if (window.location.hash === "#quiz-blockchain") {
        setActiveTab("quiz-blockchain");
        document.getElementById("courses")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    fn();
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      return data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const courses = (coursesData?.filter((c: Course) => c.isActive) || []) as Course[];
  const sorted = [...courses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latestCourses = sorted.slice(0, 3);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginatedCourses = useMemo(
    () => sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [sorted, currentPage]
  );

  const displayList = activeTab === "latest" ? latestCourses : paginatedCourses;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "all") setCurrentPage(1);
    if (typeof window !== "undefined") {
      if (tab === "quiz-blockchain") window.location.hash = "quiz-blockchain";
      else if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  const handleCourseClick = (course: Course) => {
    flushSync(() => {
      setSelectedCourse(course);
      setIsModalOpen(true);
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleEnroll = (course: Course) => {
    const el = document.getElementById("contact");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const sel = document.querySelector('select[name="your-course"]') as HTMLSelectElement;
      if (sel) {
        sel.value = course.name;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (course.location) {
        const loc = document.querySelector('select[name="event-location"]') as HTMLSelectElement;
        if (loc) {
          loc.value = course.location;
          loc.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    }, 500);
  };

  const tabCn = (active: boolean) =>
    `py-2 px-2 sm:px-3 md:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
      active ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
    }`;

  return (
    <section id="courses" className="relative border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40 w-full min-w-0 overflow-hidden scrollbar-hide">
      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden scrollbar-hide">
        <div className="mb-4 lg:mb-6 flex items-center gap-3">
          <StarIcon size="lg" className="w-16 h-16" />
          <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">Our courses</h2>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex flex-wrap gap-2 overflow-x-hidden pb-2">
            <button onClick={() => handleTabChange("latest")} className={tabCn(activeTab === "latest")}>
              <span className="hidden sm:inline">3 Latest Courses</span>
              <span className="sm:hidden">Latest</span>
            </button>
            <button onClick={() => handleTabChange("all")} className={tabCn(activeTab === "all")}>
              <span className="hidden sm:inline">All Courses</span>
              <span className="sm:hidden">All</span>
            </button>
            <button id="quiz-blockchain" onClick={() => handleTabChange("quiz-blockchain")} className={tabCn(activeTab === "quiz-blockchain")}>
              Quiz blockchain
            </button>
          </nav>
        </div>

        {activeTab === "quiz-blockchain" ? (
          <ContestSection />
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-lg rounded-b-xl" />
                <div className="mt-3 h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                <div className="mt-2 h-5 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                <div className="mt-2 h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
              </div>
            ))
          ) : displayList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 text-sm">Chưa có khóa học.</div>
          ) : (
            displayList.map((course) => (
              <button
                key={course.id}
                type="button"
                className="group flex flex-col text-left w-full"
                onClick={() => handleCourseClick(course)}
              >
                <div className="overflow-hidden rounded-t-lg rounded-b-xl bg-gray-100 dark:bg-gray-800">
                  <img
                    src={course.image || "/images/common/loading.png"}
                    alt={course.name}
                    loading="lazy"
                    className="w-full aspect-video object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    onError={(e) => ((e.target as HTMLImageElement).src = "/images/common/loading.png")}
                  />
                </div>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">POSTED: {formatPosted(course.createdAt)}</p>
                <div className="relative group/title">
                  <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title || course.name}
                  </h3>
                  <div className="absolute left-0 top-full mt-2 opacity-0 group-hover/title:opacity-100 pointer-events-none z-20 transition-opacity">
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded-lg whitespace-pre-line max-w-[80vw] md:max-w-xl relative">
                      {course.title || course.name}
                      <div className="absolute left-4 -top-2 border-b-8 border-b-gray-900 dark:border-b-gray-100 border-x-8 border-x-transparent" />
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        )}

        {activeTab === "all" && !isLoading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={sorted.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <CourseModal course={selectedCourse} isOpen={isModalOpen} onClose={handleCloseModal} onEnroll={handleEnroll} />
    </section>
  );
}
