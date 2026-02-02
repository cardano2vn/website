"use client";

import React, { useState } from "react";
import { AdminHeader } from "../common/AdminHeader";
import LandingContentManager from "./LandingContentManager";

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

export function LandingContentPageClient() {
  const [formData, setFormData] = useState(initialFormData);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Landing / Hero"
        description="Chỉnh nội dung và ảnh phần hero trang chủ"
      />
      <LandingContentManager formData={formData} setFormData={setFormData} />
    </div>
  );
}
