"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Course } from "~/constants/admin";
import { TipTapPreview } from "~/components/ui/tiptap-preview";

interface CourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEnroll?: (course: Course) => void;
}

export default function CourseModal({ course, isOpen, onClose, onEnroll }: CourseModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", fn);
      return () => window.removeEventListener("keydown", fn);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !course) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto transparent-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-600 rounded-[40px]">
          <div className="relative h-64 rounded-t-[40px] overflow-hidden">
            <img
              src={course.image || "/images/common/loading.png"}
              alt={course.name}
              className="w-full h-full object-cover"
              onError={(e) => ((e.target as HTMLImageElement).src = "/images/common/loading.png")}
            />
          </div>
          <div className="p-8">
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {course.title || course.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {course.name}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      course.price === "free" || !course.price
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}
                  >
                    {course.price === "free" || !course.price ? "Free" : `${course.price} ₳`}
                  </span>
                  <span>
                    Created:{" "}
                    {new Date(course.createdAt as unknown as string).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {course.description && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Course Description
                  </h4>
                  <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    <TipTapPreview content={course.description} />
                  </div>
                </div>
              )}

              {(onEnroll && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      onEnroll(course);
                      onClose();
                    }}
                    className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  >
                    Enroll
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
