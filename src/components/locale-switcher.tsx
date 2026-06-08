"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { switchLocalePath } from "@/i18n/routing";

type Props = {
  locale: Locale;
  className?: string;
};

export function LocaleSwitcher({ locale, className }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";
  const hrefHr = `${switchLocalePath(pathname, "hr")}${suffix}`;
  const hrefEn = `${switchLocalePath(pathname, "en")}${suffix}`;

  return (
    <div
      className={className ?? "flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5 text-[11px] font-semibold uppercase tracking-wide"}
      role="group"
      aria-label={locale === "hr" ? "Jezik stranice" : "Site language"}
    >
      <Link
        href={hrefHr}
        className={`rounded px-2 py-1 transition ${locale === "hr" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        aria-current={locale === "hr" ? "page" : undefined}
      >
        HR
      </Link>
      <Link
        href={hrefEn}
        className={`rounded px-2 py-1 transition ${locale === "en" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        aria-current={locale === "en" ? "page" : undefined}
      >
        EN
      </Link>
    </div>
  );
}
