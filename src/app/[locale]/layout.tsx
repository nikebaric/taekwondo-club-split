import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { parseLocale } from "@/i18n/locale";
import { siteMetadataBase } from "@/lib/site-url";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);
  const t = getDictionary(locale);

  return {
    metadataBase: siteMetadataBase(),
    title: {
      default: `${t.meta.siteName} | ${t.meta.city}`,
      template: `%s | ${t.meta.siteName}`,
    },
    description: t.meta.description,
    openGraph: {
      title: t.meta.siteName,
      description: t.meta.description,
      locale: t.meta.ogLocale,
      type: "website",
      images: [
        {
          url: "/images/logo-kluba.png",
          width: 582,
          height: 585,
          alt: t.meta.siteName,
        },
      ],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  if (!locales.includes(raw as (typeof locales)[number])) notFound();
  const locale = parseLocale(raw);

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
