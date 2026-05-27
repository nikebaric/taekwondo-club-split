import type { Locale } from "@/i18n/config";

export function formatPostDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "hr-HR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
