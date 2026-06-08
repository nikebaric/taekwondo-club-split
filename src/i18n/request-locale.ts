import { headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/** Locale from middleware `x-locale` header (falls back to Croatian). */
export async function requestLocale(): Promise<Locale> {
  const h = await headers();
  const raw = h.get("x-locale");
  return raw && isLocale(raw) ? raw : defaultLocale;
}
