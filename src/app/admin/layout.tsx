import { SiteChrome } from "@/components/site-chrome";
import { requestLocale } from "@/i18n/request-locale";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await requestLocale();
  return <SiteChrome locale={locale}>{children}</SiteChrome>;
}
