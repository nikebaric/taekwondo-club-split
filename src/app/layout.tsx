/**
 * Root layout — fonts, global styles, dynamic `lang` from middleware.
 */
import type { Metadata } from "next";
import { DM_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { requestLocale } from "@/i18n/request-locale";
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
