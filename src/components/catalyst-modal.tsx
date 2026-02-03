"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Link from "next/link";
// import { Project } from "~/constants/catalyst";
import { ProjectModalProps } from "~/constants/catalyst";
import { TipTapPreview } from "~/components/ui/tiptap-preview";

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
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
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
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto transparent-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-600 rounded-[40px]">
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
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
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
                    {project?.description ? (
                      <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                        <TipTapPreview content={project.description} />
                      </div>
                    ) : project ? null : (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    )}
                  </div>
                  
                  {project?.href && (
                    <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                      >
                        View Full Proposal
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
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
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
