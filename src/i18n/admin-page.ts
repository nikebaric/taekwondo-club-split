import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requestLocale } from "@/i18n/request-locale";
import { localizedPath } from "@/i18n/routing";

/** Locale, dictionary, and path helper for admin routes. */
export async function getAdminPage() {
  const locale = await requestLocale();
  const t = getDictionary(locale);
  const lp = (path: string) => localizedPath(path, locale);
  return { locale, t, lp, a: t.adminPanel };
}

export function adminLoginRedirect(next: string, locale: Locale): string {
  return `${localizedPath("/prijava", locale)}?next=${encodeURIComponent(localizedPath(next, locale))}`;
}
