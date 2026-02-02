'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import Title from "~/components/title";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
import { useNotifications } from "~/hooks/useNotifications";

const ServiceContent = dynamic(
  () => import('~/components/our-service/ServiceContent'),
  { ssr: false, loading: () => <div className="min-h-[400px] flex items-center justify-center"><span className="text-gray-500">Loading...</span></div> }
);

function StatsPageContent() {
  useNotifications();

  return (
    <main className="relative pt-20 bg-white dark:bg-gray-950">
      <BackgroundMotion />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Title
            title="Our Service"
            description="Khám phá các dịch vụ SPO (Nhà vận hành Stake Pool) và DREP (Đại diện được ủy quyền) của chúng tôi. Tìm hiểu cách bạn có thể hỗ trợ các sáng kiến cộng đồng Cardano mà chúng tôi đang thực hiện."
          />
        </motion.div>

        <ServiceContent />
      </div>
    </main>
  );
}

export default function StatsPageClient() {
  return <StatsPageContent />;
}
