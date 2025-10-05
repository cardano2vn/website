"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CTAImageSliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Array<{
    id: string;
    title: string;
    location: string;
    imageUrl: string;
    orderNumber: number;
  }>;
  initialIndex?: number;
}

export default function CTAImageSliderModal({ 
  isOpen, 
  onClose, 
  events, 
  initialIndex = 0 
}: CTAImageSliderModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(false);

  const eventsWithImages = events.filter(event => event.imageUrl && event.imageUrl.trim() !== "");

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsLoading(false);
    }
  }, [isOpen, initialIndex]);

  const goToPrevious = () => {
    if (eventsWithImages.length === 0) return;
    setCurrentIndex((prev) => 
      prev === 0 ? eventsWithImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    if (eventsWithImages.length === 0) return;
    setCurrentIndex((prev) => 
      prev === eventsWithImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
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

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentIndex]);

  const currentEvent = eventsWithImages[currentIndex];

  if (eventsWithImages.length === 0) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-center shadow-xl transition-all">
                  <div className="text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No images available</p>
                    <p className="text-sm mt-2">There are no event images to display.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Close
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 button"
                  title="Close gallery"
                  aria-label="Close gallery"
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

                {/* Image Container */}
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      <img
                        src={currentEvent?.imageUrl}
                        alt={currentEvent?.title || "Event image"}
                        className="w-full h-[60vh] max-h-[500px] object-cover"
                        onLoad={() => setIsLoading(false)}
                        onLoadStart={() => setIsLoading(true)}
                      />
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  {eventsWithImages.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        disabled={isLoading}
                        title="Previous image"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        disabled={isLoading}
                        title="Next image"
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>

                {/* Event Info */}
                {currentEvent && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                      {currentEvent.title}
                    </h4>
                    {currentEvent.location && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {currentEvent.location}
                      </p>
                    )}
                  </div>
                )}

                {/* Thumbnail Navigation */}
                {eventsWithImages.length > 1 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {eventsWithImages.map((event, index) => (
                        <button
                          key={event.id}
                          onClick={() => setCurrentIndex(index)}
                          className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                            index === currentIndex
                              ? "border-blue-500"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                        >
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
