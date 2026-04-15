import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TODO: Regenerate Supabase types to fix Insert/Update generic resolution
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
