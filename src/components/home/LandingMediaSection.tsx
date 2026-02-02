"use client";

import React, { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import LandingMediaSliderModal from "./LandingMediaSliderModal";

interface MediaItem {
  url: string;
  type: string;
  title: string;
}

interface LandingMediaSectionProps {
  mediaItems: MediaItem[];
}

export default function LandingMediaSection({ mediaItems }: LandingMediaSectionProps) {
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [sliderInitialIndex, setSliderInitialIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (mediaItem: MediaItem) => {
    const index = mediaItems.findIndex(item => item.url === mediaItem.url);
    flushSync(() => {
      setSliderInitialIndex(index);
      setIsSliderModalOpen(true);
    });
  };

  const goToPrevious = () => {
    if (mediaItems.length === 0) return;
    setCurrentIndex((prev) => prev === 0 ? mediaItems.length - 1 : prev - 1);
  };

  const goToNext = () => {
    if (mediaItems.length === 0) return;
    setCurrentIndex((prev) => prev === mediaItems.length - 1 ? 0 : prev + 1);
  };

  useEffect(() => {
    if (mediaItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev === mediaItems.length - 1 ? 0 : prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [mediaItems.length]);

  if (mediaItems.length === 0) return null;

  const currentMedia = mediaItems[currentIndex];

  return (
    <>
      <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:flex items-center justify-center">
        {currentMedia && (
          <div className="relative">
            <div
              className="relative cursor-pointer rounded-lg overflow-hidden"
              onClick={() => handleImageClick(currentMedia)}
              style={{
                width: '500px',
                height: '500px',
              }}
            >
              <img
                src={currentMedia.url}
                alt={currentMedia.title || "Cardano2vn event"}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold z-10 drop-shadow-lg">
                cardano2vn
              </div>
            </div>

            {mediaItems.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                    className={`h-2 rounded-full ${
                      index === currentIndex
                        ? 'bg-blue-600 dark:bg-blue-400 w-8'
                        : 'bg-gray-300 dark:bg-gray-600 w-2'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>


      <LandingMediaSliderModal
        isOpen={isSliderModalOpen}
        onClose={() => setIsSliderModalOpen(false)}
        mediaItems={mediaItems}
        initialIndex={sliderInitialIndex}
      />
    </>
  );
}
