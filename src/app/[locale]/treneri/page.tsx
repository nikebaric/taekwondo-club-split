"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { localizedPath } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default function CoachesRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const raw = params.locale;
  const locale: Locale = typeof raw === "string" && isLocale(raw) ? raw : "hr";
  const t = getDictionary(locale);

  useEffect(() => {
    router.replace(`${localizedPath("/o-klubu", locale)}#treneri`);
  }, [router, locale]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center text-sm text-[var(--muted)]">
      {t.coachesRedirect}
    </div>
  );
}
