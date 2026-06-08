import type { Metadata } from "next";
import { PortalBorbeniShowcase } from "@/components/portal-borbeni-showcase";
import { PORTAL_BRAND_NAME } from "@/config/news-portal";
import { getPageLocale } from "@/i18n/locale";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getPageLocale(params);
  return {
    title: PORTAL_BRAND_NAME,
    description: `${t.portal.metaDescription} ${t.meta.siteName}.`,
  };
}

export default async function PortalPage({ params }: Props) {
  const { locale, t } = await getPageLocale(params);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <PortalBorbeniShowcase locale={locale} subtitle={t.portal.showcaseSubtitle} />
    </div>
  );
}
