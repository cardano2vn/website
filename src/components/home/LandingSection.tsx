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
            <div className="max-w-xl w-full py-12 lg:py-0">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                {formData.subtitle ? (
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {formData.subtitle}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    WELCOME
                  </span>
                )}
              </div>
              {formData.title ? (
                <h1 className={`font-bold text-gray-900 dark:text-white ${titleSize} leading-[1.15] tracking-tight`}>
                  {formData.title}
                </h1>
              ) : null}
              {formData.description ? (
                <div className="mt-6 text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                  <TipTapPreview content={formData.description} />
                </div>
              ) : null}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 lg:mt-10">
                <Link
                  href={routers.service}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 dark:bg-blue-500 px-6 lg:px-8 py-3 lg:py-3 font-semibold text-white shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 text-sm lg:text-base transition-colors"
                >
                  About Us
                </Link>
                <button
                  type="button"
                  onClick={scrollToContact}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 lg:px-8 py-3 lg:py-3 font-semibold text-gray-900 dark:text-white shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm lg:text-base transition-colors"
                  aria-label="Register our course"
                >
                  Register our course
                </button>
              </div>
              {formData.mainText ? (
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                  <TipTapPreview content={formData.mainText} />
                </div>
              ) : null}
            </div>
          </div>
          <div className="relative hidden lg:flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
            <div className="relative w-4/5 max-w-lg">
              <div className="rounded-xl overflow-hidden shadow-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200/60 dark:ring-gray-700/60">
                {currentSlide && (
                  <img
                    key={currentSlide.url}
                    src={currentSlide.url}
                    alt={currentSlide.title}
                    className="w-full aspect-[16/11] object-cover animate-in fade-in duration-500 cursor-zoom-in"
                    onClick={() => setLightboxImage(currentSlide)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setLightboxImage(currentSlide)}
                    aria-label="View image"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="relative h-[50vh] lg:hidden overflow-hidden bg-gray-100 dark:bg-gray-900">
            {currentSlide && (
              <img
                key={currentSlide.url}
                src={currentSlide.url}
                alt={currentSlide.title}
                className="w-full h-full object-cover animate-in fade-in duration-500"
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
