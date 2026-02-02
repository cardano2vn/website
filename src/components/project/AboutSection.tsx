"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AboutContent } from '~/constants/about';
import { TipTapPreview } from "~/components/ui/tiptap-preview";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function AboutSection() {
  const [ytReady, setYtReady] = useState(false);
  const playerRef = useRef<any>(null);

  const { data: queryData, isLoading, error: aboutError } = useQuery({
    queryKey: ['about-content'],
    queryFn: async () => {
      const response = await fetch('/api/about');
      if (!response.ok) {
        throw new Error('Failed to fetch about content');
      }
      return response.json();
    }
  });

  useEffect(() => {
    if (aboutError) {

    }
  }, [aboutError]);

  const aboutContent: AboutContent | null = queryData?.data || null;

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
        <aside className="mx-auto my-0 flex w-full max-w-[1200px] flex-col gap-2">
          <div className="flex w-full gap-7 max-sm:flex-col">
            <div className='m relative aspect-video w-[60%] rounded-3xl before:absolute before:left-8 before:top-8 before:h-full before:w-full before:rounded-3xl before:bg-gray-300 dark:before:bg-slate-900 before:shadow-xl before:content-[""] max-sm:w-full animate-pulse'>
              <div className="absolute inset-0 z-10 block h-full w-full rounded-xl bg-gray-300 dark:bg-gray-700"></div>
            </div>
            <div className="z-10 flex w-[40%] flex-col items-start gap-[15px] max-md:gap-3 max-sm:w-full">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full animate-pulse"></div>
              <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded w-full animate-pulse"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </aside>
      </section>
    );
  }

  if (!aboutContent) {
    return null;
  }

  return (
    <section className="mb-16 text-left overflow-hidden">
      <aside className="mx-auto my-0 flex w-full max-w-[1200px] flex-col gap-2 overflow-hidden">
        <div className="flex w-full gap-7 max-sm:flex-col items-start overflow-hidden min-w-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            className='relative aspect-video w-[60%] rounded-3xl before:absolute before:left-8 before:top-8 before:h-full before:w-full before:rounded-3xl before:bg-gray-300 dark:before:bg-slate-900 before:shadow-xl before:content-[""] max-sm:w-full flex-shrink-0 self-start'
          >
            <div id="about-video-player" className="absolute inset-0 z-10 block h-full w-full rounded-xl"></div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut",
              delay: 0.2
            }}
            className="z-10 flex w-[40%] flex-col items-start gap-[15px] max-md:gap-3 max-sm:w-full flex-shrink-0 min-w-0 overflow-hidden"
          >
            <h2 className="text-left text-[25px] font-bold max-md:text-xl text-gray-900 dark:text-white">{aboutContent.title}</h2>
            <p className="mb-1 text-[20px] font-normal max-md:text-lg text-gray-700 dark:text-gray-300">{aboutContent.subtitle}</p>
            <div className="text-left leading-[1.8] max-md:text-base text-gray-600 dark:text-gray-300 prose prose-sm max-w-none overflow-hidden">
              <TipTapPreview content={aboutContent.description} />
            </div>
            <Link href={aboutContent.buttonUrl} target="_blank">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-success p-1 text-md rounded-sm bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700"
              >
                {aboutContent.buttonText}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </aside>
    </section>
  );
}