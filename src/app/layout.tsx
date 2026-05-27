/**
 * Root layout — fonts, global styles, dynamic `lang` from middleware.
 */
import type { Metadata } from "next";
import { DM_Sans, Bebas_Neue } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { siteMetadataBase } from "@/lib/site-url";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: siteMetadataBase(),
};

async function requestLocale(): Promise<Locale> {
  const h = await headers();
  const raw = h.get("x-locale");
  return raw && isLocale(raw) ? raw : defaultLocale;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await requestLocale();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${bebas.variable} h-full antialiased`}
    >
      <body
        className={`${dmSans.className} min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]`}
      >
        {children}
      </body>
    </html>
  );
}
