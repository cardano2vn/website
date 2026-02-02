"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import VideoSectionSkeleton from "./VideoSectionSkeleton";
import NotFoundInline from "~/components/ui/not-found-inline";
import StarIcon from "../ui/StarIcon";

interface Video {
  id: string;
  videoId: string;
  channelName: string;
  videoUrl: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

async function fetchVideos(): Promise<Video[]> {
  const res = await fetch("/api/video-section");
  if (!res.ok) {
    throw new Error("Failed to fetch videos");
  }
  const data = await res.json();
  return data?.data || [];
}

export default function VideoSection() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const playerRef = useRef<any>(null);
  const [ytReady, setYtReady] = useState(false);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const {
    data: videos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["video-section"],
    queryFn: fetchVideos,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (error) {

    }
  }, [error]);

  React.useEffect(() => {
    if (videos.length > 0 && !currentVideo) {
      const featuredVideo = videos.find((video: Video) => video.isFeatured);
      setCurrentVideo(featuredVideo || videos[0]);
    }
  }, [videos, currentVideo]);

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
  };

  const updateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 320;
    const tooltipHeight = 100; 
    const margin = 12;

    let left = rect.left;
    let top = rect.bottom + margin;

    if (left + tooltipWidth > viewportWidth - margin) {
      left = viewportWidth - tooltipWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    if (top + tooltipHeight > viewportHeight - margin) {
      top = rect.top - tooltipHeight - margin;
    }

    setTooltipStyle({
      position: 'fixed',
      left: Math.max(margin, left),
      top: Math.max(margin, top),
      zIndex: 9999
    });
  };

  const sortedVideos = Array.isArray(videos) ? videos.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    
    if (!a.isFeatured && !b.isFeatured) {
      return (a.order || 0) - (b.order || 0);
    }
    
    return 0;
  }) : [];

  const displayedVideos = sortedVideos;

  function getYoutubeIdFromUrl(url: string) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)\s*([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  function getThumbnail(video: Video) {
    const youtubeId = getYoutubeIdFromUrl(video.videoUrl || "") || (video.videoId && video.videoId.length === 11 ? video.videoId : null);
    if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    if (video.thumbnailUrl && video.thumbnailUrl.trim() !== "") return video.thumbnailUrl.trim();
    return "/images/common/loading.png";
  }

  function formatDateDmy(dateString: string) {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return "";
    }
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
    if (!ytReady || !currentVideo) return;
    const YT = (window as any).YT;
    const handleStateChange = (event: any) => {
      const PlayerState = YT?.PlayerState || {};
      if (event?.data === PlayerState.ENDED) {
        const list = Array.isArray(sortedVideos) ? sortedVideos : [];
        const currentIdx = list.findIndex(v => v.id === currentVideo.id);
        
        let nextVideo;
        if (currentIdx >= 0 && currentIdx + 1 < list.length) {
          nextVideo = list[currentIdx + 1];
        } else {
          nextVideo = list.find(v => v.isFeatured) || list[0];
        }
        
        if (nextVideo && nextVideo.id !== currentVideo.id) {
          setCurrentVideo(nextVideo);
        }
      }
    };

    if (playerRef.current) {
      try {
        playerRef.current.loadVideoById(currentVideo.videoId);
        playerRef.current.playVideo?.();
      } catch {}
      return;
    }

    playerRef.current = new YT.Player('video-player', {
      videoId: currentVideo.videoId,
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
  }, [ytReady, currentVideo, sortedVideos]);

  if (isLoading) {
    return <VideoSectionSkeleton />;
  }

  if (error || !videos || videos.length === 0) {
    return (
      <section id="videos" className="relative flex min-h-screen items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40 w-full min-w-0 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative min-w-0">
            <div className="mb-8 lg:mb-16">
              <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-4">
                <StarIcon size="lg" className="w-16 h-16" />
                <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">The Cardano2vn Videos</h2>
              </div>
            </div>
            <NotFoundInline 
              onClearFilters={() => {
                window.location.reload();
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  if (!currentVideo) {
    return (
      <section id="videos" className="relative flex min-h-screen items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40 w-full min-w-0 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative min-w-0">
            <div className="mb-8 lg:mb-16">
              <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-4">
                <StarIcon size="lg" className="w-16 h-16" />
                <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">The Cardano2vn Videos</h2>
              </div>
              <p className="max-w-3xl text-base lg:text-xl text-gray-700 dark:text-gray-300">Watch our latest videos and memorable moments.</p>
            </div>
            <NotFoundInline 
              onClearFilters={() => {
                window.location.reload();
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="videos" className="relative flex min-h-screen items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40">
      <div className="mx-auto w-5/6 max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-20">
        <div className="relative">
          <div className="mb-8 lg:mb-16">
            <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-4">
              <StarIcon size="lg" className="w-16 h-16" />
              <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">Videos</h2>
            </div>
            <p className="max-w-3xl text-base lg:text-xl text-gray-700 dark:text-gray-300">Xem những video mới nhất và những khoảnh khắc đáng nhớ về chúng tôi.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            <div className="w-full lg:w-[60%]">
              <div className="relative w-full aspect-video rounded-lg lg:rounded-xl overflow-hidden mb-4 lg:mb-6 shadow-lg lg:shadow-2xl">
                <div id="video-player" className="w-full h-full"></div>
              </div>
              <div className="relative group">
                <h3 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 lg:mb-2 line-clamp-2">
                  {currentVideo.title}
                </h3>
                {currentVideo.description && (
                  <div className="absolute left-0 top-full mt-2 opacity-0 group-hover:opacity-100 pointer-events-none z-[9999]">
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded-lg shadow-lg whitespace-pre-line max-w-[90vw] md:max-w-2xl relative">
                      {currentVideo.description}
                      <div className="absolute left-4 -top-2 border-b-8 border-b-gray-900 dark:border-b-gray-100 border-x-8 border-x-transparent"></div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm lg:text-lg text-gray-600 dark:text-gray-400 font-medium">{currentVideo.channelName}</p>
            </div>

            <div className="w-full lg:w-[40%] min-w-0">
              <div className="mb-4 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1 lg:mb-2">Playlist – Videos Cardano2vn</h3>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Select a video to watch</p>
              </div>

              <div className="rounded-md ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto custom-scrollbar">
                  {displayedVideos.map((video, idx) => (
                    <div
                      key={video.id}
                      className={`group relative flex items-center py-3 px-3 cursor-pointer ${
                        currentVideo.id === video.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                      onClick={() => handleVideoSelect(video)}
                    >
                      <div className="w-0.5 bg-indigo-400/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-0 top-0 bottom-0"></div>
                      
                      <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden mr-3">
                        <img src={getThumbnail(video)} alt={video.title} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <div 
                            className="relative"
                            onMouseEnter={(e) => {
                              if (video.description) {
                                setHoveredVideoId(video.id);
                                updateTooltipPosition(e.currentTarget);
                              }
                            }}
                            onMouseMove={(e) => {
                              if (hoveredVideoId === video.id) {
                                updateTooltipPosition(e.currentTarget);
                              }
                            }}
                            onMouseLeave={() => setHoveredVideoId(null)}
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 leading-tight">
                              {video.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {video.channelName}
                            </p>
                            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDateDmy(video.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {mounted && hoveredVideoId && (() => {
        const hoveredVideo = displayedVideos.find(v => v.id === hoveredVideoId);
        return hoveredVideo?.description && createPortal(
          <div style={tooltipStyle} className="pointer-events-none">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded-lg shadow-lg whitespace-pre-line max-w-[80vw] md:max-w-md relative">
              {hoveredVideo.description}
              <div className="absolute left-4 -top-2 border-b-8 border-b-gray-900 dark:border-b-gray-100 border-x-8 border-x-transparent"></div>
            </div>
          </div>,
          document.body
        );
      })()}
    </section>
  );
}
