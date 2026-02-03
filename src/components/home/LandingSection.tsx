"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
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

  const totalLength =
    formData.title.length +
    formData.subtitle.length +
    formData.description.length +
    formData.mainText.length;
  const titleSize =
    totalLength > 500
      ? "text-3xl lg:text-5xl xl:text-6xl"
      : totalLength > 300
        ? "text-4xl lg:text-6xl xl:text-7xl"
        : "text-5xl lg:text-7xl xl:text-8xl";

  return (
    <>
      <section
        id="Landing"
        className="relative flex min-h-[80vh] items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40 w-full min-w-0 overflow-x-hidden"
      >
        <div className="absolute left-[10%] right-0 top-0 bottom-[20%] z-0 overflow-hidden rounded-bl-3xl">
          {currentSlide && (
            <img
              key={currentSlide.url}
              src={currentSlide.url}
              alt={currentSlide.title}
              className="w-full h-full object-cover animate-in fade-in duration-500"
            />
          )}
        </div>
        <div className="relative z-10 w-full min-w-0 pl-4 pr-4 pt-4 pb-12 sm:pl-6 sm:pt-6 lg:pl-8 lg:pt-8 lg:pb-20">
          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16 items-center min-w-0">
            <div className="relative max-w-2xl">
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-sm p-6 sm:p-8 lg:p-10 space-y-6">
                {formData.title ? (
                  <h1
                    className={`mb-4 lg:mb-6 font-bold text-gray-900 dark:text-white ${titleSize} text-justify`}
                  >
                    {formData.title}
                  </h1>
                ) : null}
                {formData.description ? (
                  <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed text-justify">
                    <TipTapPreview content={formData.description} />
                  </div>
                ) : null}
                {formData.mainText ? (
                  <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    <TipTapPreview content={formData.mainText} />
                  </div>
                ) : null}
                <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-8">
                  <Link
                    href={routers.service}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 dark:bg-blue-500 px-6 lg:px-8 py-3 lg:py-4 font-semibold text-white shadow-xl hover:bg-blue-700 dark:hover:bg-blue-600 text-base lg:text-lg transition-colors"
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
              </div>
            </div>
            <div className="hidden lg:block" aria-hidden />
          </div>
        </div>
      </section>
      <FloatingNotification />
    </>
  );
}
