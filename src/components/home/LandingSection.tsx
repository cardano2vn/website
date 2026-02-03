"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { images } from "~/public/images";
import LandingContentSection from "./LandingContentSection";
import FloatingNotification from "~/components/ui/FloatingNotification";

const SLIDE_INTERVAL_MS = 4000;

const initialFormData = {
  section: "hero",
  title: "",
  subtitle: "",
  description: "",
  mainText: "",
  media1Url: "",
  media2Url: "",
  media3Url: "",
  media4Url: "",
  publishStatus: "DRAFT" as "DRAFT" | "PUBLISHED",
};

export default function LandingSection() {
  const [formData, setFormData] = useState(initialFormData);
  const [slideIndex, setSlideIndex] = useState(0);

  const { data: landingContents = [] } = useQuery({
    queryKey: ["landing-content"],
    queryFn: async () => {
      const response = await fetch("/api/landing-content");
      if (!response.ok) throw new Error("Failed to fetch landing content");
      const data = await response.json();
      return data?.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (landingContents.length > 0) {
      const first = landingContents[0];
      setFormData({
        section: first.section ?? "hero",
        title: first.title ?? "",
        subtitle: first.subtitle ?? "",
        description: first.description ?? "",
        mainText: first.mainText ?? "",
        media1Url: first.media1Url ?? "",
        media2Url: first.media2Url ?? "",
        media3Url: first.media3Url ?? "",
        media4Url: first.media4Url ?? "",
        publishStatus: first.publishStatus ?? "DRAFT",
      });
    }
  }, [landingContents]);

  const mediaItems = useMemo(() => {
    const urls = [
      formData.media1Url,
      formData.media2Url,
      formData.media3Url,
      formData.media4Url,
    ].filter(Boolean);
    if (urls.length === 0) return [{ url: images.loading.src, title: formData.title || "" }];
    return urls.map((url) => ({ url: url!, title: formData.title || "" }));
  }, [
    formData.media1Url,
    formData.media2Url,
    formData.media3Url,
    formData.media4Url,
    formData.title,
  ]);

  useEffect(() => {
    if (mediaItems.length <= 1) return;
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % mediaItems.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [mediaItems.length]);

  const content = {
    title: formData.title || "",
    subtitle: formData.subtitle || "",
    description: formData.description || "",
    mainText: formData.mainText || "",
  };

  const currentSlide = mediaItems[slideIndex] ?? mediaItems[0];

  return (
    <>
      <section id="Landing" className="relative flex min-h-[80vh] items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40 w-full min-w-0 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16 items-center min-w-0">
            <LandingContentSection content={content} />
            <div className="hidden lg:block relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {currentSlide && (
                <img
                  key={currentSlide.url}
                  src={currentSlide.url}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover animate-in fade-in duration-500"
                />
              )}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {mediaItems.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlideIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === slideIndex
                          ? "w-6 bg-blue-600 dark:bg-blue-400"
                          : "w-1.5 bg-white/70 dark:bg-white/30 hover:bg-white/90 dark:hover:bg-white/50"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <FloatingNotification />
    </>
  );
}
