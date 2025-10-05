"use client";

import { motion } from "framer-motion";
import { XIcon, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { Event, EventCardProps } from "~/constants/events";

export default function EventCard({ event, index, editMode, onEditClick, onUpload, className, onImageClick }: EventCardProps) {
  const [maxChars, setMaxChars] = useState(30);

  useEffect(() => {
    const updateMaxChars = () => {
      const width = window.innerWidth;
      if (width < 640) setMaxChars(25);
      else if (width < 1024) setMaxChars(30);
      else setMaxChars(30);
    };

    updateMaxChars();
    window.addEventListener("resize", updateMaxChars);
    return () => window.removeEventListener("resize", updateMaxChars);
  }, []);

  const handleImageClick = () => {
    if (!editMode && event.imageUrl && onImageClick) {
      onImageClick(index);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: editMode ? 1 : 1.02 }}
        whileTap={{ scale: editMode ? 1 : 0.98 }}
        className={`relative rounded-xl overflow-hidden shadow-lg group cursor-pointer ${className}`}
      >
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {event.imageUrl ? (
          <>
            <img
              src={event.imageUrl}
              alt={event.title}
              className={`object-cover w-full h-full transition-all ${editMode ? "opacity-80" : ""}`}
              onClick={handleImageClick}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.classList.remove('hidden');
                  fallback.classList.add('flex');
                }
              }}
            />
            <div className="hidden w-full h-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">Image not available</span>
            </div>
            {editMode && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick?.(index);
                }}
                className="absolute top-0 right-0 p-1.5 rounded-full cursor-pointer bg-transparent"
              >
                <XIcon className="h-6 w-6 text-red-700 dark:text-red-400" />
              </div>
            )}
            {!editMode && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/85 via-black/55 to-transparent dark:from-black/70 dark:via-black/45 dark:to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                  <h4 className="block max-w-full text-lg font-semibold truncate text-white drop-shadow-xl mb-1">
                    {event.title.length > maxChars ? event.title.slice(0, maxChars) + "..." : event.title}
                  </h4>
                  <p className="block text-sm text-white/90 drop-shadow">
                    {event.location}
                  </p>
                </div>
              </>
            )}
          </>
        ) : editMode ? (
          <div
            className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg transition cursor-pointer border-blue-300 bg-white dark:bg-gray-800"
            onClick={() => onEditClick?.(index)}
          >
            <UploadCloud className="h-12 w-12 text-blue-500 dark:text-blue-400 mb-2" />
            <p className="text-sm font-medium text-blue-500 dark:text-blue-400">Click to add event</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <img
              src="/images/common/loading.png"
              alt="Loading placeholder"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </motion.div>

    </>
  );
}
