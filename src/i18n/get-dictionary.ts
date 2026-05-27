import type { Locale } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { hr, type Dictionary } from "@/i18n/dictionaries/hr";

const dictionaries: Record<Locale, Dictionary> = { hr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
