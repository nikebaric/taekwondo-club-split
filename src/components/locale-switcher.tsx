"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localizedPath, stripLocalePrefix } from "@/i18n/routing";

type Props = {
  locale: Locale;
  className?: string;
};

/**
 * Full-page links (not Next Link) so locale switches always hit middleware
 * with the target URL. Client-side routing can treat /en/admin and /admin as
 * the same rewritten route and skip navigation.
 */
export function LocaleSwitcher({ locale, className }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";
  const canonical = stripLocalePrefix(pathname);
  const hrefHr = `${localizedPath(canonical, "hr")}${suffix}`;
  const hrefEn = `${localizedPath(canonical, "en")}${suffix}`;

  return (
    <div
      className={
        className ??
        "flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5 text-[11px] font-semibold uppercase tracking-wide"
      }
      role="group"
      aria-label={locale === "hr" ? "Jezik stranice" : "Site language"}
    >
      <a
        href={hrefHr}
        hrefLang="hr"
        className={`rounded px-2 py-1 transition no-underline ${locale === "hr" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        aria-current={locale === "hr" ? "page" : undefined}
      >
        HR
      </a>
      <a
        href={hrefEn}
        hrefLang="en"
        className={`rounded px-2 py-1 transition no-underline ${locale === "en" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        aria-current={locale === "en" ? "page" : undefined}
      >
        EN
      </a>
    </div>
  );
}
