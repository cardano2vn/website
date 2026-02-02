"use client";

import React from 'react';
import { LandingMediaProps } from '~/constants/admin';

export default function LandingMedia({ mediaItems }: LandingMediaProps) {
  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {mediaItems.map((mediaUrl, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg shadow-lg"
          >
            <img
              src={mediaUrl}
              alt={`Media ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}