'use client';

import React from 'react';
import Title from "~/components/title";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
import ServiceContent from "~/components/our-service/ServiceContent";
import { useNotifications } from "~/hooks/useNotifications";

function StatsPageContent() {
  useNotifications();

  return (
    <main className="relative pt-16 bg-white dark:bg-gray-950">
      <BackgroundMotion />
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-8 lg:pb-20">
        <Title
          title="Our Service"
          description="Khám phá các dịch vụ SPO (Nhà vận hành Stake Pool) và DREP (Đại diện được ủy quyền) của chúng tôi. Tìm hiểu cách bạn có thể hỗ trợ các sáng kiến cộng đồng Cardano mà chúng tôi đang thực hiện."
        />
        <ServiceContent />
      </div>
    </main>
  );
}

export default function StatsPageClient() {
  return <StatsPageContent />;
}
