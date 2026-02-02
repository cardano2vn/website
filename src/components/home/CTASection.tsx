"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import EventCard from "~/components/home/CTAEventCard";
import CTAImageSliderModal from "~/components/home/CTAImageSliderModal";
import { Event } from "~/constants/events";
import StarIcon from "../ui/StarIcon";

const emptyEvent = (orderNumber: number): Event => ({
  id: orderNumber.toString(),
  title: "",
  location: "",
  imageUrl: "",
  orderNumber,
});

export default function CTASection() {
  const [sliderModalOpen, setSliderModalOpen] = useState(false);
  const [sliderInitialIndex, setSliderInitialIndex] = useState(0);

  const { data: events = [] } = useQuery({
    queryKey: ["event-images"],
    queryFn: async () => {
      const res = await fetch("/api/event-images");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      return data?.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const handleImageClick = (index: number) => {
    flushSync(() => {
      setSliderInitialIndex(index);
      setSliderModalOpen(true);
    });
  };

  const getEvent = (orderNumber: number) =>
    events.find((e: Event) => e.orderNumber === orderNumber) ?? emptyEvent(orderNumber);

  const cardProps = (orderNumber: number, className: string) => ({
    event: getEvent(orderNumber),
    index: orderNumber,
    editMode: false,
    onImageClick: handleImageClick,
    className,
  });

  return (
    <section id="CTA" className="w-full min-w-0 overflow-x-hidden border-t border-gray-200 dark:border-gray-700 scroll-mt-28 md:scroll-mt-40">
      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 lg:mb-16 flex flex-wrap justify-between items-center gap-4 min-w-0">
          <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-4">
            <StarIcon size="lg" className="w-16 h-16" />
            <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">
              Events
            </h2>
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-w-0">
            <EventCard {...cardProps(0, "lg:w-[70%] min-w-0 h-70")} />
            <EventCard {...cardProps(1, "lg:w-[30%] min-w-0 h-70")} />
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-w-0">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:w-[70%] min-w-0">
              <EventCard {...cardProps(2, "sm:w-1/2 min-w-0 h-70")} />
              <EventCard {...cardProps(3, "sm:w-1/2 min-w-0 h-70")} />
            </div>
            <div className="flex flex-col gap-4 sm:gap-6 lg:w-[30%] min-w-0">
              <EventCard {...cardProps(4, "min-w-0 h-32")} />
              <EventCard {...cardProps(5, "min-w-0 h-32")} />
            </div>
          </div>
        </div>

        <CTAImageSliderModal
          isOpen={sliderModalOpen}
          onClose={() => setSliderModalOpen(false)}
          events={events}
          initialIndex={sliderInitialIndex}
        />
      </div>
    </section>
  );
}
