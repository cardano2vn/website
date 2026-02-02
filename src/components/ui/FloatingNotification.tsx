"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import WelcomeModal from "~/components/home/WelcomeModal";
import { images } from "~/public/images";
import { useToastContext } from "~/components/toast-provider";

interface FloatingNotificationProps {
  children?: React.ReactNode;
}

export default function FloatingNotification({ children }: FloatingNotificationProps) {
  const [showModal, setShowModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const { showError } = useToastContext();

  const { data: welcomeData } = useQuery({
    queryKey: ['welcome-modal'],
    queryFn: async () => {
      const response = await fetch('/api/welcome-modal');
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: userData } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      if (!session?.user) return null;
      const sessionUser = session.user as { address?: string; email?: string };
      const url = new URL('/api/user', window.location.origin);
      if (sessionUser.address) url.searchParams.set('address', sessionUser.address);
      if (sessionUser.email) url.searchParams.set('email', sessionUser.email);
      const response = await fetch(url.toString());
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedHome');
    if (!hasVisited) {
      setShowModal(true);
      sessionStorage.setItem('hasVisitedHome', 'true');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenModal = () => {
    const isAdmin = userData?.data?.role?.name === 'ADMIN';
    
    if (!isAdmin && !welcomeData?.data) {
      showError('No event content available at the moment');
      return;
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const fmt = (d: Date) => d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const getTooltipText = () => {
    if (!welcomeData?.data) {
      return "No event available";
    }

    const event = welcomeData.data;
    const now = new Date();
    
    if (event.startDate || event.endDate) {
      const startDate = event.startDate ? new Date(event.startDate) : null;
      const endDate = event.endDate ? new Date(event.endDate) : null;
      
      if (startDate && endDate) {
        if (now >= startDate && now <= endDate) {
          return `Event active until ${fmt(endDate)}`;
        } else if (now < startDate) {
          return `Event starts ${fmt(startDate)}`;
        } else {
          return "Event has ended";
        }
      } else if (startDate && !endDate) {
        if (now >= startDate) {
          return "Event is active (no end date)";
        } else {
          return `Event starts ${fmt(startDate)}`;
        }
      } else if (!startDate && endDate) {
        if (now <= endDate) {
          return `Event active until ${fmt(endDate)}`;
        } else {
          return "Event has ended";
        }
      }
    }
    
    return "Event is active";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: isScrolled ? -20 : 0 
        }}
        transition={{ duration: 0.3 }}
        className="fixed right-6 z-50 group"
        style={{ 
          bottom: isScrolled ? '7rem' : '2rem'
        }}
        onClick={handleOpenModal}
      >
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg whitespace-nowrap relative max-w-xs">
            {getTooltipText()}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-l-4 border-l-gray-900 dark:border-l-gray-100 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </div>
        <div className="relative w-14 h-14">
          {/* Ripple effect */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>

          {/* Main button */}
          <div className="absolute inset-0 w-14 h-14 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 flex items-center justify-center">
            <img src={images.loading.src} alt="Loading" className="w-full h-full object-contain rounded-full" />
          </div>
        </div>
      </motion.div>
      <WelcomeModal
        isOpen={showModal}
        onClose={handleCloseModal}
        origin={{ x: '100%', y: '100%' }} 
        />
    </>
  );
}
