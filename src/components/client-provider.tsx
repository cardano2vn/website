"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "~/components/toast-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BanCheckProvider from "~/components/BanCheckProvider";

const CACHE_MIN = 5;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_MIN * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
});

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BanCheckProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </BanCheckProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
} 