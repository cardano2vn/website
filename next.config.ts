import { createMDX } from "fumadocs-mdx/next";

import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucid-cardano"],
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "@emurgo/cardano-serialization-lib-asmjs",
    "@emurgo/cardano-serialization-lib-browser",
    "@meshsdk/core",
    "ethers",
  ],
  experimental: {
    optimizePackageImports: [
      "@tanstack/react-query",
      "lucide-react",
      "framer-motion",
      "lodash",
      "katex",
      "recharts",
      "swiper",
      "highlight.js",
      "lowlight",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
    ],
  },
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },

  // experimental: {
  //   esmExternals: 'loose',
  // },
  // webpack: (webpackConfig, { isServer }) => {
  //   webpackConfig.experiments = {
  //     ...(webpackConfig.experiments || {}),
  //     asyncWebAssembly: true,
  //   };
  //   if (!isServer) {
  //     webpackConfig.resolve = webpackConfig.resolve || {};
  //     webpackConfig.resolve.fallback = {
  //       ...(webpackConfig.resolve.fallback || {}),
  //       fs: false,
  //       path: false,
  //       crypto: false,
  //       stream: false,
  //     };
  //   }
  //   return webpackConfig;
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "us1.discourse-cdn.com",
      },
      {
        protocol: "https",
        hostname: "*.discourse-cdn.com",
      },
    ],
    domains: ["res.cloudinary.com", "raw.githubusercontent.com", "us1.discourse-cdn.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withMDX(config);
