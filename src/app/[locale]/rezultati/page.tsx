import type { Metadata } from "next";
import { AchievementsTable } from "@/components/achievements-table";
import { SectionHeading } from "@/components/section-heading";
import { localizeAchievement } from "@/lib/localize-club-data";
import { readAchievements } from "@/lib/achievements-store";
import { site } from "@/config/site";
import { getPageLocale } from "@/i18n/locale";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getPageLocale(params);
  return {
    title: t.results.title,
    description: `${t.results.metaDescription} ${t.meta.siteName}.`,
  };
}

export default async function ResultsPage({ params }: Props) {
  const { locale, t } = await getPageLocale(params);
  const { gold, silver, bronze } = site.medalStats;
  const achievements = (await readAchievements()).map((a) => localizeAchievement(a, locale));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow={t.results.eyebrow}
        title={t.results.title}
        subtitle={`${t.results.subtitle} ${t.meta.siteName}.`}
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/90 to-white p-6 text-center shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800">{t.common.gold}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tabular-nums tracking-wide text-slate-900">
            {gold}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 text-center shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">{t.common.silver}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tabular-nums tracking-wide text-slate-900">
            {silver}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-200/90 bg-gradient-to-b from-orange-50/90 to-white p-6 text-center shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-900/90">{t.common.bronze}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tabular-nums tracking-wide text-slate-900">
            {bronze}
          </p>
        </div>
      </div>
      <div className="mt-14">
        <AchievementsTable rows={achievements} locale={locale} />
      </div>
    </div>
  );
}
