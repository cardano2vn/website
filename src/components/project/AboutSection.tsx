"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AboutContent } from '~/constants/about';
import { TipTapPreview } from "~/components/ui/tiptap-preview";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AboutSection() {
  const [ytReady, setYtReady] = useState(false);
  const playerRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: queryData, isLoading, error: aboutError } = useQuery({
    queryKey: ['about-content'],
    queryFn: async () => {
      const response = await fetch('/api/about');
      if (!response.ok) throw new Error('Failed to fetch about content');
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (aboutError) {

    }
  }, [aboutError]);

  const aboutContent: AboutContent | null = queryData?.data || null;

  const slides = aboutContent ? [
    {
      id: 'video',
      type: 'video' as const,
      content: aboutContent
    },
    {
      id: 'stats',
      type: 'stats' as const,
      content: aboutContent
    }
  ] : [];

  const goToPrevious = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => prev === 0 ? slides.length - 1 : prev - 1);
  };

  const goToNext = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => prev === slides.length - 1 ? 0 : prev + 1);
  };

  function getYoutubeIdFromUrl(url: string) {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)\s*([A-Za-z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([A-Za-z0-9_-]{11})/,
      /youtu\.be\/([A-Za-z0-9_-]{11})/,
      /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).YT && (window as any).YT.Player) {
      setYtReady(true);
      return;
    }
    const existing = document.getElementById('youtube-iframe-api');
    if (!existing) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    (window as any).onYouTubeIframeAPIReady = () => setYtReady(true);
    const poll = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        clearInterval(poll);
        setYtReady(true);
      }
    }, 100);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (!ytReady || !aboutContent) return;

    const videoId = getYoutubeIdFromUrl(aboutContent.youtubeUrl);
    if (!videoId) {

      const playerElement = document.getElementById('about-video-player');
      if (playerElement) {
        playerElement.innerHTML = `
          <iframe
            class="w-full h-full rounded-xl"
            src="${aboutContent.youtubeUrl}"
            title="${aboutContent.title}"
            frameborder="none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        `;
      }
      return;
    }

    const YT = (window as any).YT;
    const handleStateChange = (event: any) => {
      const PlayerState = YT?.PlayerState || {};
    };

    if (playerRef.current) {
      try {
        playerRef.current.loadVideoById(videoId);
        playerRef.current.playVideo?.();
      } catch {}
      return;
    }

    playerRef.current = new YT.Player('about-video-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        rel: 0,
        controls: 1,
        modestbranding: 1,
        playsinline: 1,
        mute: 1,
      },
      events: {
        onReady: () => {
          try {
            playerRef.current?.mute?.();
            playerRef.current?.playVideo?.();
          } catch {}
        },
        onStateChange: handleStateChange,
      },
    });
  }, [ytReady, aboutContent]);

  if (isLoading) {
    return (
      <section className="mb-16 text-left">
        <aside className="mx-auto my-0 flex w-full max-w-[1200px] flex-col gap-6">
          <div className="w-full animate-pulse">
            <div className="relative aspect-video w-full rounded-2xl bg-gray-300 dark:bg-gray-700 mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </aside>
      </section>
    );
  }

  if (!aboutContent || slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <section className="mb-16 text-left">
      <aside className="mx-auto my-0 flex w-full max-w-[1200px] flex-col gap-6">
        <div className="relative w-full rounded-2xl border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 shadow-xl overflow-hidden">
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {currentSlideData.type === 'video' && (
            <>
              <div className="relative aspect-video w-full">
                <div id="about-video-player" className="absolute inset-0 w-full h-full"></div>
              </div>
              <div className="p-6 lg:p-8 space-y-4">
                <div>
                  <h2 className="text-left text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">{aboutContent.title}</h2>
                  <p className="text-lg lg:text-xl font-normal text-gray-700 dark:text-gray-300 mb-4">{aboutContent.subtitle}</p>
                </div>
                <div className="text-left leading-relaxed text-base lg:text-lg text-gray-600 dark:text-gray-300 prose prose-sm max-w-none">
                  <TipTapPreview content={aboutContent.description} />
                </div>
                <div className="pt-4">
                  <Link href={aboutContent.buttonUrl} target="_blank">
                    <button className="inline-flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-md rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg hover:bg-blue-700">
                      {aboutContent.buttonText}
                    </button>
                  </Link>
                </div>
              </div>
            </>
          )}

          {currentSlideData.type === 'stats' && (
            <div className="p-6 lg:p-8">
              <h2 className="text-left text-2xl lg:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{aboutContent.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">82+</div>
                  <div className="text-gray-700 dark:text-gray-300">Meetups/Workshops</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Đã tiếp cận hơn 2000 học viên</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">55</div>
                  <div className="text-gray-700 dark:text-gray-300">Educational Videos</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Với hơn 10,000 lượt xem</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">150+</div>
                  <div className="text-gray-700 dark:text-gray-300">Giờ hướng dẫn</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hướng dẫn sinh viên</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100+</div>
                  <div className="text-gray-700 dark:text-gray-300">Người tham dự</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tổ chức Hackathon</div>
                </div>
              </div>
            </div>
          )}

          {slides.length > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-white/20">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSlide
                      ? 'bg-blue-600 dark:bg-blue-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
