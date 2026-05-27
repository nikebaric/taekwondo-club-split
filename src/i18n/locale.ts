import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export function parseLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

export async function getPageLocale(params: Promise<{ locale: string }>) {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);
  return { locale, t: getDictionary(locale) };
}
