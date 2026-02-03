import { createMDX } from "fumadocs-mdx/next";

import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucid-cardano"],
  experimental: {
    optimizePackageImports: ["@tanstack/react-query", "lucide-react", "framer-motion"],
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
    ],
    domains: ["res.cloudinary.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withMDX(config);
