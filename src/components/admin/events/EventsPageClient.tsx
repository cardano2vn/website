"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "~/components/toast-provider";
import { AdminHeader } from "../common/AdminHeader";
import EventEditModal from "~/components/admin/events/EventEditModal";
import { Event } from "~/constants/events";

const SLOTS = [0, 1, 2, 3, 4, 5];

const emptyEvent = (orderNumber: number): Event => ({
  id: orderNumber.toString(),
  title: "",
  location: "",
  imageUrl: "",
  orderNumber,
});

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch("/api/admin/event-images", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch events");
  const data = await res.json();
  return data?.data ?? [];
}

export function EventsTabContent() {
  const { showSuccess, showError } = useToastContext();
  const queryClient = useQueryClient();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["admin-event-images"],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const getEvent = (orderNumber: number) =>
    events.find((e: Event) => e.orderNumber === orderNumber) ?? emptyEvent(orderNumber);

  const handleSave = (_index: number, _updatedEvent: Partial<Event>) => {
    queryClient.invalidateQueries({ queryKey: ["admin-event-images"] });
    queryClient.invalidateQueries({ queryKey: ["event-images"] });
    setEditingIndex(null);
  };

  const handleDelete = async (event: Event) => {
    if (!event.id || event.id === event.orderNumber.toString()) {
      showError("Cannot delete unsaved event");
      return;
    }
    try {
      const res = await fetch(`/api/admin/event-images/${event.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      showSuccess("Event removed");
      queryClient.invalidateQueries({ queryKey: ["admin-event-images"] });
      queryClient.invalidateQueries({ queryKey: ["event-images"] });
    } catch {
      showError("Failed to delete event");
    }
  };

  if (error) {
    return <p className="text-red-600">Lỗi tải danh sách. Thử lại sau.</p>;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SLOTS.map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SLOTS.map((orderNumber) => {
          const event = getEvent(orderNumber);
          return (
            <div
              key={orderNumber}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm"
            >
              <div className="aspect-video bg-gray-100 relative">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Chưa có ảnh
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-900 truncate" title={event.title}>
                  {event.title || `Ô ${orderNumber + 1} (trống)`}
                </p>
                <p className="text-sm text-gray-500 truncate" title={event.location}>
                  {event.location || "—"}
                </p>
              </div>
              <div className="p-3 pt-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIndex(orderNumber)}
                  className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                >
                  Sửa
                </button>
                {event.imageUrl && event.id && event.id !== String(orderNumber) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(event)}
                    className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingIndex !== null && (
        <EventEditModal
          isOpen={true}
          onClose={() => setEditingIndex(null)}
          event={getEvent(editingIndex)}
          index={editingIndex}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export function EventsPageClient() {
  return (
    <div className="space-y-6">
      <AdminHeader title="Events" description="Quản lý ảnh sự kiện trang chủ (6 ô hiển thị trên trang chủ)" />
      <EventsTabContent />
    </div>
  );
}
