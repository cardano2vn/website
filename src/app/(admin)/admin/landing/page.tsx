import LandingPageClient from "~/components/admin/landing/LandingPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landing | Admin",
  description: "Quản lý nội dung trang chủ: hero và sự kiện",
};

export default function AdminLandingPage() {
  return <LandingPageClient />;
}
