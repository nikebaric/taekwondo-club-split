/**
 * next.config.ts — Next.js project configuration
 *
 * KEY CONCEPTS:
 * - This file customises the Next.js build and dev server.
 * - It runs in Node.js at build time (NOT in the browser).
 * - The `NextConfig` type gives you autocomplete and type-safety for every
 *   config option. Using TypeScript (.ts) instead of .js is recommended.
 * - The config is the single place for image optimisation rules, compiler
 *   flags, redirects, headers, and other framework-level settings.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables the React Compiler (automatic memoisation).
  // React 19 ships an opt-in compiler that rewrites components so you rarely
  // need React.memo / useMemo / useCallback yourself.
  reactCompiler: true,

  /** LAN / mobile browser at http://192.168.x.x:3000 — otherwise Turbopack blocks HMR (cross-origin). */
  // During development, Turbopack's HMR WebSocket only accepts connections
  // from the same origin by default. If you open the site from a phone or
  // another machine on the LAN, the origin differs. Adding the IP here
  // whitelists that cross-origin connection so hot-reload still works.
  allowedDevOrigins: ["192.168.1.75"],

  // Next.js <Image> can only load remote images from explicitly allowed
  // hosts. This prevents abuse of the built-in image optimisation endpoint
  // (/\_next/image) as a public proxy. Each entry specifies protocol,
  // hostname, and an optional pathname glob.
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
