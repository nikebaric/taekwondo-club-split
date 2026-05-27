import type { Locale } from "@/i18n/config";

/** Prefer `en` when locale is English and a translation exists; otherwise Croatian/default. */
export function pickLocaleField(locale: Locale, hr: string, en?: string | null): string {
  if (locale === "en" && en?.trim()) return en.trim();
  return hr;
}
