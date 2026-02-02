"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Link from "next/link";
// import { Project } from "~/constants/catalyst";
import { ProjectModalProps } from "~/constants/catalyst";
import CourseModalText from "~/components/home/CourseModalText";

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { 
    setMounted(true); 
  }, []);
  
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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 1, scaleX: 1, filter: "blur(0px)", transformOrigin: "right" }}
          animate={{ opacity: 1, scaleX: 1, filter: "blur(0px)", transformOrigin: "right" }}
          exit={{
              opacity: 0,
              scaleX: 0,
              filter: "blur(12px)",
              transformOrigin: "right",
          }}
          transition={{ duration: 0, ease: [0.25, 1, 0.5, 1] }}
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
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto transparent-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-600 rounded-[40px] shadow-2xl">
              <div className="p-8">
                <div className="space-y-6">
                  {/* <div className="relative h-64 rounded-xl overflow-hidden">
                    <img
                      src={'/images/common/loading.png'}
                      alt={project ? project.title : 'Catalyst'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div> */}
                  
                  <div>
                    {project ? (
                      <>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {project.fund || project.status}
                          </span>
                          <span>
                            Created: {new Date(project.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {project ? (
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Start Date:</strong> {project.quarterly ? `${project.quarterly}/${project.year}` : project.year}
                          </span>
                        ) : (
                          <span className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded inline-block"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                        </svg>
                        {project ? (
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Status:</strong> {project.status.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded inline-block"></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Project Description</h4>
                    {project ? (
                      <CourseModalText text={project.description} maxLength={200} />
                    ) : (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                    {project && project.href && (
                      <Link
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                      >
                        View Full Proposal
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0 }}
            onClick={onClose}
            className="absolute button"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '4em',
              height: '4em',
              border: 'none',
              background: 'rgba(180, 83, 107, 0.11)',
              borderRadius: '5px',
              transition: 'background 0.5s',
              zIndex: 50
            }}
          >
            <span 
              className="X"
              style={{
                content: "",
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2em',
                height: '1.5px',
                backgroundColor: 'rgb(255, 255, 255)',
                transform: 'translateX(-50%) rotate(45deg)'
              }}
            ></span>
            <span 
              className="Y"
              style={{
                content: "",
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2em',
                height: '1.5px',
                backgroundColor: '#fff',
                transform: 'translateX(-50%) rotate(-45deg)'
              }}
            ></span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
