import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  /** LAN / mobilni preglednik na http://192.168.x.x:3000 — inače Turbopack blokira HMR (cross-origin). */
  allowedDevOrigins: ["192.168.1.75"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
