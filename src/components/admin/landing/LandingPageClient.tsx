"use client";

import { useState } from "react";
import { LayoutDashboard, Calendar, GraduationCap } from "lucide-react";
import { AdminHeader } from "../common/AdminHeader";
import LandingContentManager from "../landing-content/LandingContentManager";
import { EventsTabContent } from "../events/EventsPageClient";
import CourseManager from "../courses/CourseManager";

const initialFormData = {
  section: "hero",
  title: "",
  subtitle: "",
  description: "",
  mainText: "",
  media1Url: "",
  media2Url: "",
  media3Url: "",
  media4Url: "",
  publishStatus: "DRAFT" as "DRAFT" | "PUBLISHED",
};

export default function LandingPageClient() {
  const [activeTab, setActiveTab] = useState<"hero" | "events" | "courses">("hero");
  const [formData, setFormData] = useState(initialFormData);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Landing"
        description="Quản lý nội dung trang chủ: hero, sự kiện và khóa học"
      />

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "hero"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Hero</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "events"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Events</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "courses"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Courses</span>
          </button>
        </nav>
      </div>

      {activeTab === "hero" && (
        <LandingContentManager formData={formData} setFormData={setFormData} />
      )}
      {activeTab === "events" && <EventsTabContent />}
      {activeTab === "courses" && <CourseManager />}
    </div>
  );
}
