"use client";

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
      <div
        className={`relative rounded-xl overflow-hidden shadow-lg group cursor-pointer min-w-0 w-full ${className}`}
      >
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {event.imageUrl ? (
          <>
            <img
              src={event.imageUrl}
              alt={event.title}
              className={`object-cover w-full h-full ${editMode ? "opacity-80" : ""}`}
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick?.(index);
                }}
                className="absolute top-3 right-3 z-10 rounded-md bg-red-500/80 hover:bg-red-600/90 transition-colors w-8 h-8 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-white/60"
                title="Remove image"
                aria-label="Remove image"
              >
                <span className="relative block w-3.5 h-3.5">
                  <span className="absolute left-1/2 top-1/2 w-full h-[2px] bg-white rotate-45 -translate-x-1/2 -translate-y-1/2"></span>
                  <span className="absolute left-1/2 top-1/2 w-full h-[2px] bg-white -rotate-45 -translate-x-1/2 -translate-y-1/2"></span>
                </span>
              </button>
            )}
            {!editMode && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/70 dark:bg-black/50 pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                  <div className="relative group">
                    <h4 className="block max-w-full text-lg font-semibold truncate text-white drop-shadow-xl mb-1">
                      {event.title.length > maxChars ? event.title.slice(0, maxChars) + "..." : event.title}
                    </h4>
                    <div className="absolute left-0 -top-9 opacity-0 group-hover:opacity-100 pointer-events-none">
                      <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-pre-line max-w-[80vw] md:max-w-md relative">
                        {event.title}
                        <div className="absolute left-4 -bottom-2 border-t-8 border-t-gray-900 dark:border-t-white border-x-8 border-x-transparent"></div>
                      </div>
                    </div>
                  </div>
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
    </div>

    </>
  );
}