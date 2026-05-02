import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@distube/ytdl-core"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
