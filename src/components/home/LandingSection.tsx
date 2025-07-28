"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { routers } from "~/constants/routers";
import { images } from "~/public/images";
import Action from "~/components/action";

export default function LandingSection() {
  return (
    <section id="Landing" className="relative flex min-h-screen items-center overflow-hidden">
      {/* <div className="absolute -left-40 top-1/2 -translate-y-1/2 transform opacity-5">
        <Image loading="lazy" className="h-[50vh] w-auto" style={{ color: "transparent" }} decoding="async" src={images.logo} alt="cardano2vn" />
      </div> */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div className="text-center">
          <div className="text-9xl font-bold text-gray-300 dark:text-white/10">CARDANO</div>
          <div className="text-6xl font-bold text-gray-300 dark:text-white/10">.IO</div>
          <div className="text-4xl font-bold text-gray-300 dark:text-white/10">BREAK THE BLOCKS</div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <motion.div
          className="relative"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <section className="relative">
              <h1 className="mb-10 text-5xl font-bold  lg:text-8xl">
                <span className="block tracking-tight text-gray-900 dark:text-white">Verified</span>
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text tracking-tight text-gray-900 dark:text-transparent drop-shadow-lg">
                  Trusted
                </span>
                <span className="mt-4 block text-2xl font-normal text-gray-600 dark:text-gray-300 lg:text-4xl">for Distributed Work</span>
              </h1>
              <div className="relative mb-12 border-l-2 border-gray-300 dark:border-white/20 pl-6">
                <p className="mb-6 text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                  Infrastructure for <strong className="text-gray-900 dark:text-white">decentralized access control</strong>, credential issuance, contributor
                  onboarding, and treasury management.
                </p>
                <p className="text-lg text-gray-500 dark:text-gray-400">Local participation that opens global opportunity.</p>
              </div>
              <div className="flex flex-col gap-6 sm:flex-row">
                <Link
                  href={routers.home}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-success text-xl bg-blue-600 dark:bg-white px-8 py-4 font-semibold text-white dark:text-blue-900 shadow-xl hover:bg-blue-700 dark:hover:bg-gray-100"
                >
                  Start With Cardano2vn
                </Link>
                <Link
                  href={routers.home}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-white/50 px-8 py-4 text-lg font-semibold text-gray-900 dark:text-white shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  View Documents
                </Link>
              </div>
            </section>
            <section className="relative hidden lg:block">
              <div className="relative">
                <div className="relative h-[55vh] w-full">
                  <div className="absolute left-12 top-0 z-10 h-48 w-56 -rotate-2 transform overflow-hidden border-8 border-gray-200 dark:border-white shadow-2xl">
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: 'url("/images/landings/01.png")' }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-800/40 to-transparent"></div>
                    <div className="relative flex h-full flex-col justify-end p-4">
                      <div className="mb-3 h-8 w-full bg-gradient-to-r from-blue-500/20 to-transparent"></div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-2/3 bg-gray-300 dark:bg-white/20"></div>
                        <div className="h-1.5 w-1/2 bg-gray-200 dark:bg-white/10"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-8 top-8 z-20 h-64 w-64 rotate-1 transform overflow-hidden border-8 border-gray-200 dark:border-white shadow-2xl">
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: 'url("/images/landings/02.png")' }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-cyan-800/40 to-transparent"></div>
                    <div className="relative flex h-full flex-col justify-end p-4">
                      <div className="mb-3 h-12 w-full bg-gradient-to-r from-cyan-500/20 to-transparent"></div>
                      <div className="space-y-2">
                        <div className="h-1.5 w-2/3 bg-gray-300 dark:bg-white/20"></div>
                        <div className="h-1.5 w-3/4 bg-gray-200 dark:bg-white/10"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-24 left-4 z-30 h-60 w-72 -rotate-1 transform overflow-hidden border-8 border-gray-200 dark:border-white shadow-2xl">
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: 'url("/images/landings/03.png")' }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-800/40 to-transparent"></div>
                    <div className="relative flex h-full flex-col justify-end p-4">
                      <div className="mb-3 h-12 w-full bg-gradient-to-r from-purple-500/20 to-transparent"></div>
                      <div className="space-y-2">
                        <div className="h-1.5 w-1/2 bg-gray-300 dark:bg-white/20"></div>
                        <div className="h-1.5 w-2/3 bg-gray-200 dark:bg-white/10"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-12 right-12 z-40 h-52 w-52 rotate-3 transform overflow-hidden border-8 border-gray-200 dark:border-white shadow-2xl">
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: 'url("/images/landings/04.png")' }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-800/40 to-transparent"></div>
                    <div className="relative flex h-full flex-col justify-end p-4">
                      <div className="mb-3 h-10 w-full bg-gradient-to-r from-green-500/20 to-transparent"></div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-3/5 bg-gray-300 dark:bg-white/20"></div>
                        <div className="h-1.5 w-4/5 bg-gray-200 dark:bg-white/10"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
      <Action title="Next" href="#trust" />
    </section>
  );
} 