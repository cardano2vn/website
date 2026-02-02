"use client";

import Loading from "~/components/ui/Loading";
import { useEffect, useState } from "react";
import LandingSection from "~/components/home/LandingSection";
import ProtocolSection from "~/components/home/BlogHomeSection";
import CourseSection from "~/components/home/CourseSection";
import CTASection from "~/components/home/CTASection";
import VideoSection from "~/components/home/VideoSection";
import ContactFormSection from "~/components/home/ContactFormSection";
import { useNotifications } from "~/hooks/useNotifications";
import BackgroundMotion from "~/components/ui/BackgroundMotion";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  useNotifications();

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const headerOffset = 100;
    const syncFromUrl = () => {
      const url = new URL(window.location.href);
      const hash = url.hash?.slice(1);
      if (hash) {
        const sectionId = hash.split("?")[0];
        const el = document.getElementById(sectionId);
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: y });
        }
      }
    };

    const handlePopState = () => {
      syncFromUrl();
    };

    const handleHashChange = () => {
      syncFromUrl();
    };

    setTimeout(syncFromUrl, 0);

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = ["Landing", "protocol", "videos", "CTA", "courses", "contact"];
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const topMost = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (topMost?.target?.id) {
          const newHash = `#${topMost.target.id}`;
          if (window.location.hash !== newHash) {
            const url = new URL(window.location.href);
            url.hash = newHash;
            window.history.replaceState(null, "", url.toString());
          }
        }
      },
      { threshold: 0.5 }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = ["Landing", "protocol", "videos", "CTA", "courses", "contact"];
    const getActive = () => {
      const headerOffset = 120;
      const scrollPos = window.scrollY + headerOffset;
      let activeId: string | null = null;
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.offsetTop;
        if (scrollPos >= top) {
          activeId = id;
        }
      });
      if (activeId) {
        const newHash = `#${activeId}`;
        if (window.location.hash !== newHash) {
          const url = new URL(window.location.href);
          url.hash = newHash;
          window.history.replaceState(null, "", url.toString());
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          getActive();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    getActive();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) return <Loading />;

  return (
    <main className="bg-white dark:bg-gray-950 overflow-x-hidden">
      <BackgroundMotion />
      <LandingSection />
      <ProtocolSection />
      <VideoSection />
      <CTASection />
      <CourseSection />
      <ContactFormSection />
    </main>
  );
}
