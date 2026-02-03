"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "~/constants/events";
import EventModal from "~/components/home/EventModal";
import StarIcon from "../ui/StarIcon";

const emptyEvent = (orderNumber: number): Event => ({
  id: orderNumber.toString(),
  title: "",
  location: "",
  imageUrl: "",
  orderNumber,
});

const MOBILE_H = "h-[12rem]";
const DESKTOP_LARGE_H = "min-h-[10rem]";
const DESKTOP_SMALL_H = "min-h-[6rem]";

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
  );
}

function EventCardMobile({ event, onClick }: { event: Event; onClick: () => void }) {
  return (
    <div
      className={`group relative rounded-xl overflow-hidden cursor-pointer min-w-0 w-full ${MOBILE_H}`}
      onClick={() => event?.imageUrl && onClick()}
    >
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800">
        {event.imageUrl ? (
          <>
            <img
              src={event.imageUrl}
              alt={event.title}
              className="object-cover w-full h-full min-w-0 min-h-0"
              onError={(e) => ((e.target as HTMLImageElement).src = "/images/common/loading.png")}
            />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/70 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 left-4 right-4 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <h4 className="font-semibold truncate text-white text-lg">{event.title}</h4>
              {event.location && <p className="text-white/90 text-sm">{event.location}</p>}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/images/common/loading.png" alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

function EventCardDesktop({
  event,
  onClick,
  size,
  className = "",
}: {
  event: Event;
  onClick: () => void;
  size: "large" | "small";
  className?: string;
}) {
  const isSmall = size === "small";
  const heightClass = isSmall ? DESKTOP_SMALL_H : DESKTOP_LARGE_H;
  return (
    <div
      className={`group relative rounded-xl overflow-hidden cursor-pointer min-w-0 w-full ${heightClass} ${className}`}
      onClick={() => event?.imageUrl && onClick()}
    >
      <div className={`relative w-full h-full ${heightClass} bg-gray-100 dark:bg-gray-800`}>
        {event.imageUrl ? (
          <>
            <img
              src={event.imageUrl}
              alt={event.title}
              className="object-cover w-full h-full min-w-0 min-h-0"
              onError={(e) => ((e.target as HTMLImageElement).src = "/images/common/loading.png")}
            />
            <div
              className={`absolute bottom-0 left-0 right-0 ${isSmall ? "h-16" : "h-20"} bg-black/70 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`}
            />
            <div className="absolute bottom-4 left-4 right-4 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <h4 className={`font-semibold truncate text-white ${isSmall ? "text-base" : "text-lg"}`}>{event.title}</h4>
              {event.location && (
                <p className={`text-white/90 ${isSmall ? "text-xs" : "text-sm"}`}>{event.location}</p>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/images/common/loading.png" alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CTASection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: events = [], isLoading } = useQuery({
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

  const getEvent = (orderNumber: number) =>
    events.find((e: Event) => e.orderNumber === orderNumber) ?? emptyEvent(orderNumber);

  const openModal = (event: Event) => {
    if (event?.imageUrl) {
      setSelectedEvent(event);
      setModalOpen(true);
    }
  };

  return (
    <section id="CTA" className="w-full min-w-0 overflow-x-hidden border-t border-gray-200 dark:border-gray-700 scroll-mt-28 md:scroll-mt-40">
      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 lg:mb-16 flex flex-wrap justify-between items-center gap-3 min-w-0">
          <div className="mb-4 lg:mb-6 flex items-center gap-3">
            <StarIcon size="lg" className="w-16 h-16" />
            <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">Events</h2>
          </div>
        </div>

        {/* ——— Mobile only ——— */}
        <div className="lg:hidden space-y-3 min-w-0">
          {[0, 1, 2, 3, 4, 5].map((orderNumber) => (
            <EventCardMobile
              key={orderNumber}
              event={getEvent(orderNumber)}
              onClick={() => openModal(getEvent(orderNumber))}
            />
          ))}
        </div>

        <div className="hidden lg:block space-y-3 min-w-0">
          <div className="flex flex-row gap-3 min-w-0">
            <EventCardDesktop event={getEvent(0)} onClick={() => openModal(getEvent(0))} size="large" className="lg:w-[70%]" />
            <EventCardDesktop event={getEvent(1)} onClick={() => openModal(getEvent(1))} size="large" className="lg:w-[30%]" />
          </div>
          <div className="flex flex-row gap-3 min-w-0">
            <div className="flex flex-row gap-3 w-[70%] min-w-0">
              <EventCardDesktop event={getEvent(2)} onClick={() => openModal(getEvent(2))} size="large" className="w-1/2" />
              <EventCardDesktop event={getEvent(3)} onClick={() => openModal(getEvent(3))} size="large" className="w-1/2" />
            </div>
            <div className="flex flex-col gap-3 w-[30%] min-w-0">
              <EventCardDesktop event={getEvent(4)} onClick={() => openModal(getEvent(4))} size="small" />
              <EventCardDesktop event={getEvent(5)} onClick={() => openModal(getEvent(5))} size="small" />
            </div>
          </div>
        </div>

        <EventModal event={selectedEvent} isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedEvent(null); }} />
      </div>
    </section>
  );
}
