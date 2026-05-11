/**
 * src/app/layout.tsx — Root Layout (required)
 *
 * KEY CONCEPTS:
 * - In the App Router every route segment can have a `layout.tsx`.
 *   The ROOT layout (this file) wraps EVERY page in the app and must
 *   render the <html> and <body> tags — no other layout may do that.
 * - Layouts are Server Components by default. They never re-render on
 *   client-side navigation; only the `children` slot swaps out.
 * - The `metadata` export is part of the Next.js Metadata API — it
 *   generates <head> tags (title, description, Open Graph, icons)
 *   without you writing <Head> manually.
 * - `next/font` automatically self-hosts Google Fonts at build time,
 *   eliminating layout-shift (FOIT/FOUT) and external network requests.
 */
import type { Metadata } from "next";
import { DM_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/cookie-consent";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/config/site";

// next/font/google downloads the font files at BUILD time and serves them
// from your own domain — no requests to fonts.googleapis.com at runtime.
// `variable` creates a CSS custom property (e.g. --font-sans) so you can
// reference the font family via CSS/Tailwind instead of only className.
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Exporting `metadata` from a layout or page tells Next.js what to put in
// <head>. The framework merges metadata from parent layouts and child pages.
// `title.template` lets child pages export just `title: "About"` and Next.js
// automatically renders "About | Club Name" using the %s placeholder.
export const metadata: Metadata = {
  // metadataBase resolves relative URLs in og:image, canonical, etc.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | ${site.city}`,
    // %s is replaced by the child page's title export
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  // Open Graph metadata controls how links appear when shared on social media.
  openGraph: {
    title: site.name,
    description: site.description,
    locale: "hr_HR",
    type: "website",
    images: [
      {
        url: "/images/logo-kluba.png",
        width: 582,
        height: 585,
        alt: site.name,
      },
    ],
  },
};

/**
 * RootLayout — the outermost shell for every page.
 *
 * `children` is a React node injected by Next.js — it's the current page
 * (or nested layout) that matches the URL. When the user navigates,
 * only `children` changes; the layout itself persists and is NOT re-mounted.
 *
 * `Readonly<{ children: React.ReactNode }>` is a TypeScript pattern that
 * prevents accidental mutation of the props object.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The root layout MUST return <html> and <body>. No other component
    // in the app should render these tags.
    // CSS variable classes from next/font are applied here so every
    // descendant can reference --font-sans and --font-display.
    <html lang="hr" data-scroll-behavior="smooth" className={`${dmSans.variable} ${bebas.variable} h-full antialiased`}>
      <body
        className={`${dmSans.className} min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]`}
      >
        {/* Persistent UI: header and footer stay mounted across navigations */}
        <SiteHeader />
        {/* flex-1 makes <main> fill remaining vertical space (sticky footer) */}
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CookieConsent />
      </body>
    </html>
  );
}
