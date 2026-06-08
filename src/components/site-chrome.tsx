import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/i18n/config";

/** Zajednički header + main + footer za javne i admin stranice. */
export function SiteChrome({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
