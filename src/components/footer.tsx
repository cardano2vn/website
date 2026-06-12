"use client";
import Link from "next/link";
import { ThemeToggle } from "./ui/theme-toggle";
import StarIcon from "./ui/StarIcon";
import Logo from "./ui/logo";
import { useEffect, useState } from "react";

export default function Footer() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isPeak, setIsPeak] = useState(false);

  useEffect(() => {
    let intervalId: any;
    const fetchCounts = async () => {
      try {
        const [uRes, oRes] = await Promise.all([
          fetch('/api/public/stats/users', { cache: 'no-store' }),
          fetch('/api/public/stats/online', { cache: 'no-store' })
        ]);
        if (uRes.ok) {
          const uJson = await uRes.json();
          setTotalUsers(uJson?.data?.total ?? 0);
        }
        if (oRes.ok) {
          const oJson = await oRes.json();
          setOnlineUsers(oJson?.data?.total ?? 0);
          setIsPeak(oJson?.data?.peak ?? false);
        }
      } catch {}
    };
    fetchCounts();
    intervalId = setInterval(fetchCounts, 10000);
    return () => intervalId && clearInterval(intervalId);
  }, []);
  return (
    <div className="relative z-30 border-t dark:border-white/20 bg-white/80 dark:bg-black/20  text-gray-900 dark:text-white">
      <footer className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:px-8">
        <div className="absolute left-4 right-4 sm:left-6 sm:right-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="flex flex-col">
          <div className="grid w-full grid-cols-1 gap-12 sm:grid-cols-2">
            <div className="relative">
              <div className="mb-6 flex items-center gap-4">
                <StarIcon />
                <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white">Cardano2VN</h3>
              </div>
              <ul className="space-y-4 ml-12">
                 <li>
                                      <Link
                      className="group flex items-center text-gray-900 dark:text-white transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                      href="/about"
                    >
                      <span className="mr-3 h-px w-2 bg-gray-600 transition-colors duration-200 group-hover:bg-blue-600 dark:group-hover:bg-blue-400"></span>About
                    </Link>
                 </li>
                                  <li>
                                       <Link
                       className="group flex items-center text-gray-900 dark:text-white transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                       href="/project?typeFilter=project"
                     >
                       <span className="mr-3 h-px w-2 bg-gray-600 transition-colors duration-200 group-hover:bg-blue-600 dark:group-hover:bg-blue-400"></span>Project
                     </Link>
                   </li>
                   <li>
                                       <Link
                       className="group flex items-center text-gray-900 dark:text-white transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                       href="/project?typeFilter=catalyst"
                     >
                       <span className="mr-3 h-px w-2 bg-gray-600 transition-colors duration-200 group-hover:bg-blue-600 dark:group-hover:bg-blue-400"></span>Catalyst
                     </Link>
                   </li>
                   <li>
                                       <Link
                       className="group flex items-center text-gray-900 dark:text-white transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                       href="/privacy"
                     >
                       <span className="mr-3 h-px w-2 bg-gray-600 transition-colors duration-200 group-hover:bg-blue-600 dark:group-hover:bg-blue-400"></span>Privacy
                     </Link>
                   </li>
               </ul>
            </div>
            <div className="relative">
              <div className="mb-6 flex items-center gap-4">
                <StarIcon />
                <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white">Follow Us</h3>
              </div>
              <ul className="space-y-4 ml-12">
                <li>
                  <Link
                    className="group flex items-center text-gray-900 dark:text-white transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                    href="/about#contact"
                  >
                    <span className="mr-3 h-px w-2 bg-gray-600 transition-colors duration-200 group-hover:bg-blue-600 dark:group-hover:bg-blue-400"></span>Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    className="group flex items-center text-gray-900 dark:text-white transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                    href="https://www.youtube.com/channel/UCJTdAQPGJntJet5v-nk9ebA"
                  >
                    <span className="mr-3 h-px w-2 bg-gray-600 transition-colors duration-200 group-hover:bg-blue-600 dark:group-hover:bg-blue-400"></span>YouTube
                  </Link>
                </li>
                <li>
                  <Link
                    className="group flex items-center text-gray-900 dark:text-white transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                    href="https://t.me/cardano2vn"
                  >
                    <span className="mr-3 h-px w-2 bg-gray-600 transition-colors duration-200 group-hover:bg-blue-600 dark:group-hover:bg-blue-400"></span>Telegram
                  </Link>
                </li>
                <li>
                  <Link
                    className="group flex items-center text-gray-900 dark:text-white transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                    href="https://github.com/cardano2vn"
                  >
                    <span className="mr-3 h-px w-2 bg-gray-600 transition-colors duration-200 group-hover:bg-blue-600 dark:group-hover:bg-blue-400"></span>GitHub
                  </Link>
                </li>
              </ul>
            </div>

          </div>
          <div className="mt-16 border-t border-white/10 pt-8">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <div className="mb-4 flex items-center gap-3 md:mb-0">
                <Logo layout="inline" size="sm" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ThemeToggle />

                <span>|</span>
                <span>© 2025 Cardano2VN. All rights reserved.</span>
                <span>|</span>
                <span className="text-gray-500">
                  Online: <strong className={`transition-colors ${isPeak ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>{onlineUsers}</strong>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">
                  Total users: <strong className="text-gray-700 dark:text-gray-200">{totalUsers.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
