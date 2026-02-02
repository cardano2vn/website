"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Course } from "~/constants/admin";
import CourseModalText from "./CourseModalText";

interface CourseModalProps {
  course: Course | null;
  courses?: Course[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onEnroll?: (course: Course) => void;
}

export default function CourseModal({ course, courses = [], initialIndex = 0, isOpen, onClose, onEnroll }: CourseModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Filter courses that have valid data
  const validCourses = courses.filter(c => c && c.id);
  const hasMultipleCourses = validCourses.length > 1;
  
  useEffect(() => { 
    setMounted(true); 
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const goToPrevious = useCallback(() => {
    if (validCourses.length === 0) return;
    setCurrentIndex((prev) => 
      prev === 0 ? validCourses.length - 1 : prev - 1
    );
  }, [validCourses.length]);

  const goToNext = useCallback(() => {
    if (validCourses.length === 0) return;
    setCurrentIndex((prev) => 
      prev === validCourses.length - 1 ? 0 : prev + 1
    );
  }, [validCourses.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !hasMultipleCourses) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, hasMultipleCourses, goToPrevious, goToNext, onClose]);

  // Use current course from slide or fallback to single course prop
  const currentCourse = hasMultipleCourses ? validCourses[currentIndex] : course;
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !currentCourse) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ scale: 1, opacity: 1, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
            className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto transparent-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-600 rounded-[40px] shadow-2xl">
              <div className="p-8">
                <div className="space-y-6">
                  <div className="relative h-64 rounded-xl overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentCourse.id}
                        initial={{ opacity: 1, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0 }}
                        src={currentCourse.image || "/images/common/loading.png"}
                        alt={currentCourse.title || currentCourse.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/common/loading.png";
                        }}
                      />
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {hasMultipleCourses && (
                      <>
                        <button
                          onClick={goToPrevious}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                          title="Previous course"
                          aria-label="Previous course"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={goToNext}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                          title="Next course"
                          aria-label="Next course"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentCourse.id}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0 }}
                      >
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                          {currentCourse.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {currentCourse.name}
                          </span>
                          <span>
                            {(() => {
                              const created = new Date(currentCourse.createdAt as unknown as string);
                              const createdText = isNaN(created.getTime())
                                ? "-"
                                : created.toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  });
                              return <>Created: {createdText}</>;
                            })()}
                          </span>
                        </div>
                        
                        {/* Course Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Price */}
                            <div className="flex items-center gap-2 text-sm min-w-0">
                              <span className="text-gray-700 dark:text-gray-300">
                                <span
                                  className={`ml-1 inline-flex items-center px-3 py-1.5 rounded-full text-lg font-bold whitespace-nowrap ${
                                    currentCourse.price === 'free' || !currentCourse.price
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                  }`}
                                >
                                  {currentCourse.price === 'free' || !currentCourse.price
                                    ? 'Free'
                                    : `${currentCourse.price} ₳`}
                                </span>
                              </span>
                            </div>


                          {(currentCourse.location || currentCourse.locationRel?.name) && (
                            <div className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-gray-700 dark:text-gray-300">
                                <strong>Location:</strong> {currentCourse.location || currentCourse.locationRel?.name}
                              </span>
                            </div>
                          )}
                          
                          {currentCourse.startDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-700 dark:text-gray-300">
                                <strong>Start Date:</strong> {new Date(currentCourse.startDate).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit", 
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {currentCourse.description && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Course Description
                      </h4>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentCourse.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CourseModalText
                            text={currentCourse.description}
                            maxLength={200}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {/* Thumbnail Navigation */}
                  {hasMultipleCourses && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {validCourses.map((course, index) => (
                          <button
                            key={course.id}
                            onClick={() => setCurrentIndex(index)}
                            className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                              index === currentIndex
                                ? "border-blue-500"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                          >
                            <img
                              src={course.image || "/images/common/loading.png"}
                              alt={course.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        if (onEnroll && currentCourse) {
                          onEnroll(currentCourse);
                        }
                        onClose();
                      }}
                      className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                    >
                      Enroll in Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 button"
            title="Close modal"
            aria-label="Close modal"
            style={{
              width: "4em",
              height: "4em",
              border: "none",
              background: "rgba(180, 83, 107, 0.11)",
              borderRadius: "5px",
              transition: "background 0.5s",
              zIndex: 50,
            }}
          >
            <span
              className="X"
              style={{
                content: "",
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "2em",
                height: "1.5px",
                backgroundColor: "rgb(255, 255, 255)",
                transform: "translateX(-50%) rotate(45deg)",
              }}
            ></span>
            <span
              className="Y"
              style={{
                content: "",
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "2em",
                height: "1.5px",
                backgroundColor: "#fff",
                transform: "translateX(-50%) rotate(-45deg)",
              }}
            ></span>
            <div
              className="close"
              style={{
                position: "absolute",
                display: "flex",
                padding: "0.8rem 1.5rem",
                alignItems: "center",
                justifyContent: "center",
                transform: "translateX(-50%)",
                top: "-70%",
                left: "50%",
                width: "3em",
                height: "1.7em",
                fontSize: "12px",
                backgroundColor: "rgb(19, 22, 24)",
                color: "rgb(187, 229, 236)",
                border: "none",
                borderRadius: "3px",
                pointerEvents: "none",
                opacity: "0",
              }}
            >
              Close
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
