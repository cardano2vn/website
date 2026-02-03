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

export default function CTASection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  const getEvent = (orderNumber: number) =>
    events.find((e: Event) => e.orderNumber === orderNumber) ?? emptyEvent(orderNumber);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <section id="CTA" className="w-full min-w-0 overflow-x-hidden border-t border-gray-200 dark:border-gray-700 scroll-mt-28 md:scroll-mt-40">
      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 lg:mb-16 flex flex-wrap justify-between items-center gap-3 min-w-0">
          <div className="mb-4 lg:mb-6 flex items-center gap-3">
            <StarIcon size="lg" className="w-16 h-16" />
            <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">
              Events
            </h2>
          </div>
        </div>

        <div className="space-y-3 min-w-0">
          <div className="flex flex-col lg:flex-row gap-3 min-w-0">
            {[0, 1].map((orderNumber) => {
              const event = getEvent(orderNumber);
              const cn = orderNumber === 0 ? "lg:w-[70%] min-w-0 h-70" : "lg:w-[30%] min-w-0 h-70";
              return (
                <div
                  key={orderNumber}
                  className={`group relative rounded-xl overflow-hidden cursor-pointer min-w-0 w-full ${cn}`}
                  onClick={() => {
                    if (event?.imageUrl) {
                      setSelectedEvent(event);
                      setModalOpen(true);
                    }
                  }}
                >
                  <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 min-h-[12rem]">
                    {event.imageUrl ? (
                      <>
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="object-cover w-full h-full"
                          onError={(e) => ((e.target as HTMLImageElement).src = "/images/common/loading.png")}
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/70 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-4 left-4 right-4 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <h4 className="text-lg font-semibold truncate text-white ">
                            {event.title}
                          </h4>
                          {event.location && (
                            <p className="text-sm text-white/90 ">{event.location}</p>
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
            })}
          </div>

          <div className="flex flex-col lg:flex-row gap-3 min-w-0">
            <div className="flex flex-col sm:flex-row gap-3 lg:w-[70%] min-w-0">
              {[2, 3].map((orderNumber) => {
                const event = getEvent(orderNumber);
                return (
                  <div
                    key={orderNumber}
                    className="group relative rounded-xl overflow-hidden cursor-pointer min-w-0 w-full sm:w-1/2 min-h-[12rem]"
                    onClick={() => {
                      if (event?.imageUrl) {
                        setSelectedEvent(event);
                        setModalOpen(true);
                      }
                    }}
                  >
                    <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 min-h-[12rem]">
                      {event.imageUrl ? (
                        <>
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="object-cover w-full h-full"
                            onError={(e) => ((e.target as HTMLImageElement).src = "/images/common/loading.png")}
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/70 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-4 left-4 right-4 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <h4 className="text-lg font-semibold truncate text-white ">
                              {event.title}
                            </h4>
                            {event.location && (
                              <p className="text-sm text-white/90 ">{event.location}</p>
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
              })}
            </div>
            <div className="flex flex-col gap-3 lg:w-[30%] min-w-0">
              {[4, 5].map((orderNumber) => {
                const event = getEvent(orderNumber);
                return (
                  <div
                    key={orderNumber}
                    className="group relative rounded-xl overflow-hidden cursor-pointer min-w-0 w-full min-h-[8rem]"
                    onClick={() => {
                      if (event?.imageUrl) {
                        setSelectedEvent(event);
                        setModalOpen(true);
                      }
                    }}
                  >
                    <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 min-h-[8rem]">
                      {event.imageUrl ? (
                        <>
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="object-cover w-full h-full"
                            onError={(e) => ((e.target as HTMLImageElement).src = "/images/common/loading.png")}
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/70 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-3 left-3 right-3 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <h4 className="text-base font-semibold truncate text-white ">
                              {event.title}
                            </h4>
                            {event.location && (
                              <p className="text-xs text-white/90 ">{event.location}</p>
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
              })}
            </div>
          </div>
        </div>

        <EventModal
          event={selectedEvent}
          isOpen={modalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </section>
  );
}
