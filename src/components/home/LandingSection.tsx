"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ImageModal } from "~/components/ui/ImageModal";
import { images } from "~/public/images";
import { routers } from "~/constants/routers";
import { TipTapPreview } from "~/components/ui/tiptap-preview";
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
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

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

  const currentSlide = mediaItems[slideIndex] ?? mediaItems[0];

  const scrollToContact = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const el = document.getElementById("contact");
    if (el) {
      const headerOffset = 100;
      const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      window.location.assign("/#contact");
    }
  };

  const titleSize =
    formData.title.length > 50
      ? "text-3xl lg:text-5xl"
      : formData.title.length > 30
        ? "text-4xl lg:text-6xl"
        : "text-5xl lg:text-7xl";

  return (
    <>
      <section
        id="Landing"
        className="relative border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40 w-full min-w-0 overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[calc(100vh-5rem)]">
          <div className="relative flex items-center bg-white dark:bg-gray-950 px-6 sm:px-10 lg:px-14 xl:px-18">
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-800 to-transparent hidden lg:block" />
            <div className="max-w-xl w-full py-12 lg:py-0">
              {formData.subtitle ? (
                <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200/60 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/50 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
                  {formData.subtitle}
                </div>
              ) : null}
              {formData.title ? (
                <h1 className={`font-bold text-gray-900 dark:text-white ${titleSize} leading-[1.1] tracking-tight`}>
                  {formData.title}
                </h1>
              ) : null}
              {formData.description ? (
                <div className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  <TipTapPreview content={formData.description} />
                </div>
              ) : null}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 lg:mt-10">
                <Link
                  href={routers.service}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 dark:bg-blue-500 px-6 lg:px-8 py-3 lg:py-4 font-semibold text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-base lg:text-lg transition-colors"
                >
                  About Us
                </Link>
                <button
                  type="button"
                  onClick={scrollToContact}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 lg:px-8 py-3 lg:py-4 font-semibold text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm lg:text-base transition-colors"
                  aria-label="Register our course"
                >
                  Register our course
                </button>
              </div>
              {formData.mainText ? (
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
                  <TipTapPreview content={formData.mainText} />
                </div>
              ) : null}
            </div>
          </div>
          <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900/80">
            <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_0.5px,transparent_0.5px)] dark:bg-[radial-gradient(#374151_0.5px,transparent_0.5px)] bg-[length:24px_24px]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/40 dark:via-blue-800/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/40 dark:via-blue-800/40 to-transparent" />
            <svg className="absolute -top-20 -right-20 w-64 h-64 text-blue-500/[0.03] dark:text-blue-400/[0.03]" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="0.5" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeWidth="0.3" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="0.3" />
            </svg>
            <svg className="absolute -bottom-16 -left-16 w-48 h-48 text-blue-500/[0.03] dark:text-blue-400/[0.03]" viewBox="0 0 200 200" fill="none">
              <rect x="20" y="20" width="160" height="160" rx="10" stroke="currentColor" strokeWidth="0.5" />
              <rect x="40" y="40" width="120" height="120" rx="6" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            <div className="relative w-[80%] max-w-lg">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-blue-200/20 via-transparent to-blue-200/10 dark:from-blue-800/20 dark:to-blue-800/10 blur-sm" />
              <div className="relative rounded-2xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 shadow-2xl bg-white dark:bg-gray-800">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/40 via-blue-500/40 to-blue-400/40 dark:from-blue-500/40 dark:via-blue-400/40 dark:to-blue-500/40" />
                {currentSlide && (
                  <img
                    key={currentSlide.url}
                    src={currentSlide.url}
                    alt={currentSlide.title}
                    className="w-full aspect-[4/3] object-cover animate-in fade-in duration-500 cursor-zoom-in"
                    onClick={() => setLightboxImage(currentSlide)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setLightboxImage(currentSlide)}
                    aria-label="View image"
                  />
                )}
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-blue-400/30 dark:bg-blue-500/30" />
              <div className="absolute -bottom-1 left-1/3 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
          <div className="relative h-[50vh] lg:hidden overflow-hidden bg-gray-100 dark:bg-gray-900">
            <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_0.5px,transparent_0.5px)] dark:bg-[radial-gradient(#374151_0.5px,transparent_0.5px)] bg-[length:20px_20px]" />
            {currentSlide && (
              <img
                key={currentSlide.url}
                src={currentSlide.url}
                alt={currentSlide.title}
                className="w-full h-full object-cover animate-in fade-in duration-500 cursor-zoom-in"
                onClick={() => setLightboxImage(currentSlide)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setLightboxImage(currentSlide)}
                aria-label="View image"
              />
            )}
          </div>
        </div>
        <ImageModal
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage?.url ?? ""}
          alt={lightboxImage?.title ?? ""}
        />
      </section>
      <FloatingNotification />
    </>
  );
}
