import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { StaticImageData } from "next/image";
import { SimpleRichPreview } from "~/components/ui/simple-rich-editor";
import { MemberModalProps, MemberType } from '~/constants/members';

interface EnhancedMemberModalProps extends MemberModalProps {
  members?: MemberType[];
  initialIndex?: number;
}

export default function MemberModal({ member, members = [], initialIndex = 0, isOpen, onClose }: EnhancedMemberModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Filter members that have valid data
  const validMembers = members.filter(m => m && m.id);
  const hasMultipleMembers = validMembers.length > 1;
  
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const goToPrevious = useCallback(() => {
    if (validMembers.length === 0) return;
    setCurrentIndex((prev) => 
      prev === 0 ? validMembers.length - 1 : prev - 1
    );
  }, [validMembers.length]);

  const goToNext = useCallback(() => {
    if (validMembers.length === 0) return;
    setCurrentIndex((prev) => 
      prev === validMembers.length - 1 ? 0 : prev + 1
    );
  }, [validMembers.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !hasMultipleMembers) return;
      
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
  }, [isOpen, hasMultipleMembers, goToPrevious, goToNext, onClose]);

  // Use current member from slide or fallback to single member prop
  const currentMember = hasMultipleMembers ? validMembers[currentIndex] : member;

  if (!currentMember) return null;

  return (
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
        >
          <motion.div
            initial={{ scale: 1, opacity: 1, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-600 rounded-[40px] overflow-hidden shadow-2xl">
              <div className="flex h-96">
                <div className="w-2/5 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentMember.id}
                      src={currentMember.image}
                      alt={currentMember.name}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </AnimatePresence>
  
                  <div className="absolute top-4 left-4">
                    <div className="w-8 h-0.5 bg-gray-400/60 dark:bg-white/60 rounded-full"></div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="text-gray-200/90 dark:text-white/90 text-xs font-medium">Cardano2VN</div>
                  </div>

                  {/* Navigation Arrows */}
                  {hasMultipleMembers && (
                    <>
                      <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        title="Previous member"
                        aria-label="Previous member"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        title="Next member"
                        aria-label="Next member"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>
                <div className="w-3/5 flex flex-col overflow-hidden">
                  <div className="p-8 overflow-y-auto flex-1 transparent-scrollbar">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentMember.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            {currentMember.name}
                          </h2>
                          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                            {currentMember.role}
                          </div>
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                          <SimpleRichPreview content={currentMember.description} />
                        </div>
                        {currentMember.skills && currentMember.skills.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {currentMember.skills.map((skill: string, index: number) => (
                                <span
                                  key={skill}
                                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact</h3>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-gray-400/60 dark:bg-white/60 rounded-full"></div>
                              <span>{currentMember.email || "cardano2vn@gmail.com"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-gray-400/60 dark:bg-white/60 rounded-full"></div>
                              <span>LinkedIn</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {hasMultipleMembers && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {validMembers.map((member, index) => (
                      <button
                        key={member.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                          index === currentIndex
                            ? "border-blue-500"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="Close modal"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 