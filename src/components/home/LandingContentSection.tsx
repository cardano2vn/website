"use client";

import React from "react";
import Link from "next/link";
import { routers } from "~/constants/routers";
import { TipTapPreview } from "~/components/ui/tiptap-preview";

interface LandingContentSectionProps {
  content: {
    title: string;
    subtitle: string;
    description: string;
    mainText: string;
  };
}

export default function LandingContentSection({ content }: LandingContentSectionProps) {
  const totalLength =
    content.title.length + content.subtitle.length + content.description.length + content.mainText.length;
  const titleSize =
    totalLength > 500
      ? "text-3xl lg:text-5xl xl:text-6xl"
      : totalLength > 300
        ? "text-4xl lg:text-6xl xl:text-7xl"
        : "text-5xl lg:text-7xl xl:text-8xl";

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

  return (
    <div className="space-y-6">
      {content.title ? (
        <h1 className={`mb-4 lg:mb-6 font-bold text-gray-900 dark:text-white ${titleSize}`}>
          {content.title}
        </h1>
      ) : null}
      {content.description ? (
        <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
          <TipTapPreview content={content.description} />
        </div>
      ) : null}
      {content.mainText ? (
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <TipTapPreview content={content.mainText} />
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
  );
}
