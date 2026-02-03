"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import NotFoundInline from "~/components/ui/not-found-inline";
import StarIcon from "../ui/StarIcon";
import { VideoItem } from "~/constants/video-section";

const sectionCls = "relative flex min-h-screen items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40";
const wrapCls = "mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 lg:py-20";
const headerCls = "mb-4 lg:mb-6 flex items-center gap-3";

const getThumb = (v: VideoItem) => {
  const id = (v.videoUrl?.match(/(?:v=|\/)([A-Za-z0-9_-]{11})/)?.[1]) || (v.videoId?.length === 11 ? v.videoId : null);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : (v.thumbnailUrl?.trim() || "/images/common/loading.png");
};
const fmt = (s: string) => { try { const d = new Date(s); return isNaN(d.getTime()) ? "" : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); } catch { return ""; } };

export default function VideoSection() {
  const [current, setCurrent] = useState<VideoItem | null>(null);
  const playerRef = useRef<any>(null);
  const [ytReady, setYtReady] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tipPos, setTipPos] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const { data: videos = [], isLoading, error } = useQuery({
    queryKey: ["video-section"],
    queryFn: async () => { const r = await fetch("/api/video-section"); if (!r.ok) throw new Error(""); const j = await r.json(); return j?.data ?? []; },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const list = useMemo(() => [...(videos as VideoItem[])].sort((a, b) => (a.isFeatured && !b.isFeatured ? -1 : !a.isFeatured && b.isFeatured ? 1 : (a.order || 0) - (b.order || 0))), [videos]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (list.length && !current) setCurrent(list.find((v) => v.isFeatured) || list[0]); }, [list, current]);

  const setTooltip = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const W = 320, H = 100, M = 12;
    let left = r.left, top = r.bottom + M;
    if (left + W > window.innerWidth - M) left = window.innerWidth - W - M;
    if (left < M) left = M;
    if (top + H > window.innerHeight - M) top = r.top - H - M;
    setTipPos({ position: "fixed", left: Math.max(M, left), top: Math.max(M, top), zIndex: 9999 });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).YT?.Player) { setYtReady(true); return; }
    if (!document.getElementById("youtube-iframe-api")) { const s = document.createElement("script"); s.id = "youtube-iframe-api"; s.src = "https://www.youtube.com/iframe_api"; document.body.appendChild(s); }
    (window as any).onYouTubeIframeAPIReady = () => setYtReady(true);
    const t = setInterval(() => { if ((window as any).YT?.Player) { clearInterval(t); setYtReady(true); } }, 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!ytReady || !current) return;
    const YT = (window as any).YT;
    const onEnd = (e: any) => {
      if (e?.data !== YT?.PlayerState?.ENDED) return;
      const i = list.findIndex((v) => v.id === current.id);
      const next = list[i + 1] ?? list.find((v) => v.isFeatured) ?? list[0];
      if (next && next.id !== current.id) setCurrent(next);
    };
    if (playerRef.current) { try { playerRef.current.loadVideoById(current.videoId); playerRef.current.playVideo?.(); } catch {} return; }
    playerRef.current = new YT.Player("video-player", {
      videoId: current.videoId,
      playerVars: { autoplay: 1, rel: 0, controls: 1, modestbranding: 1, playsinline: 1, mute: 1 },
      events: { onReady: () => { try { playerRef.current?.mute?.(); playerRef.current?.playVideo?.(); } catch {} }, onStateChange: onEnd },
    });
  }, [ytReady, current, list]);

  if (isLoading) {
    return (
      <section id="videos" className={sectionCls}>
        <div className={wrapCls}>
          <div className={headerCls}><StarIcon size="lg" className="w-16 h-16" /><div className="h-10 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" /></div>
          <div className="h-5 w-80 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-6" />
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="w-full lg:w-[70%]"><div className="w-full aspect-video rounded-xl bg-gray-300 dark:bg-gray-700 animate-pulse" /><div className="mt-3 h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" /><div className="mt-2 h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" /></div>
            <div className="w-full lg:w-[30%]"><div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-3" /><div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">{[1,2,3].map((i) => <div key={i} className="flex gap-3 p-2"><div className="w-[120px] min-w-[120px] aspect-video rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" /><div className="flex-1 space-y-2 py-1"><div className="h-3 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse" /><div className="h-3 w-2/3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" /><div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" /></div></div>)}</div></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !videos?.length || !current) {
    return (
      <section id="videos" className={`${sectionCls} w-full min-w-0 overflow-x-hidden`}>
        <div className={wrapCls}><div className={headerCls}><StarIcon size="lg" className="w-16 h-16" /><h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">Videos</h2></div><NotFoundInline onClearFilters={() => window.location.reload()} /></div>
      </section>
    );
  }

  return (
    <section id="videos" className={sectionCls}>
      <div className={wrapCls}>
        <div className={headerCls}><StarIcon size="lg" className="w-16 h-16" /><h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">Videos</h2></div>
        <p className="max-w-3xl text-base lg:text-xl text-gray-700 dark:text-gray-300 mb-6">Xem những video mới nhất và những khoảnh khắc đáng nhớ.</p>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="w-full lg:w-[70%] min-w-0">
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black"><div id="video-player" className="w-full h-full" /></div>
            <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{current.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{current.channelName}</p>
          </div>
          <div className="w-full lg:w-[30%] min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Playlist</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Chọn video để xem</p>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden max-h-[28rem] overflow-y-auto">
              {list.map((video) => (
                <div key={video.id} className={`flex gap-3 p-2 cursor-pointer transition-colors ${current.id === video.id ? "bg-gray-100 dark:bg-gray-700/50" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"}`} onClick={() => setCurrent(video)}>
                  <div className="w-[120px] min-w-[120px] aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700"><img src={getThumb(video)} alt="" className="w-full h-full object-cover" /></div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2" onMouseEnter={(e) => { if (video.description) { setHoverId(video.id); setTooltip(e.currentTarget); } }} onMouseMove={(e) => { if (hoverId === video.id) setTooltip(e.currentTarget); }} onMouseLeave={() => setHoverId(null)}>{video.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{video.channelName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{fmt(video.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {mounted && hoverId && (() => { const v = list.find((x) => x.id === hoverId); return v?.description && createPortal(<div style={tipPos} className="pointer-events-none"><div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded-lg whitespace-pre-line max-w-[80vw] md:max-w-md border border-gray-700 dark:border-gray-300">{v.description}</div></div>, document.body); })()}
    </section>
  );
}
