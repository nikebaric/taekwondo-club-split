import { defaultLocale, type Locale } from "@/i18n/config";

/** Path without /en prefix (e.g. /en/kontakt → /kontakt). */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3) || "/";
  return pathname;
}

/** Public path for a locale (/kontakt or /en/kontakt). */
export function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return normalized === "" ? "/" : normalized;
  if (normalized === "/") return "/en";
  return `/en${normalized}`;
}

export function switchLocalePath(pathname: string, target: Locale): string {
  return localizedPath(stripLocalePrefix(pathname), target);
}
