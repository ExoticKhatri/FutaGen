import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB — image base64 from gpt-image-2 can be 15-25MB
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
