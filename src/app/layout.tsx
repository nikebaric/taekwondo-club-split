import type { Metadata } from "next";
import { DM_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/config/site";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | ${site.city}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: {
    icon: [{ url: "/images/logo-kluba.png", type: "image/png" }],
    apple: [{ url: "/images/logo-kluba.png" }],
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" className={`${dmSans.variable} ${bebas.variable} h-full scroll-smooth antialiased`}>
      <body
        className={`${dmSans.className} min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]`}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
