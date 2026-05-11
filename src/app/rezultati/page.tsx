/**
 * src/app/rezultati/page.tsx — Achievements page (route: /rezultati)
 *
 * KEY CONCEPTS:
 * - DATA LOADING PATTERN — this page combines two data sources:
 *   1. Static config data (site.medalStats) available at build time
 *   2. Async data from a store (readAchievements) loaded at request time
 *   You can mix sync and async data freely in a Server Component.
 * - The heavy lifting (rendering the achievements table) is delegated
 *   to a dedicated <AchievementsTable> component — separation of concerns.
 */
import type { Metadata } from "next";
import { AchievementsTable } from "@/components/achievements-table";
import { SectionHeading } from "@/components/section-heading";
import { readAchievements } from "@/lib/achievements-store";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Rezultati",
  description: `Medalje i rezultati članova ${site.name} — državna, regionalna i klupska natjecanja.`,
};

export default async function UspjesiPage() {
  // Destructuring from a static config — no await needed, available instantly
  const { gold, silver, bronze } = site.medalStats;
  // Async data source — fetched on the server before HTML is sent
  const achievements = await readAchievements();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Natjecanja"
        title="Rezultati"
        subtitle={`Zbirni pregled medalja i pojedinačnih rezultata članova ${site.name}.`}
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/90 to-white p-6 text-center shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800">Zlatne</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tabular-nums tracking-wide text-slate-900">
            {gold}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 text-center shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">Srebrne</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tabular-nums tracking-wide text-slate-900">
            {silver}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-200/90 bg-gradient-to-b from-orange-50/90 to-white p-6 text-center shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-900/90">Brončane</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tabular-nums tracking-wide text-slate-900">
            {bronze}
          </p>
        </div>
      </div>

      {site.medalStats.footnote ? (
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-[var(--muted)]">{site.medalStats.footnote}</p>
      ) : null}

      <div className="mx-auto mt-16 w-full max-w-6xl border-t border-slate-200 pt-14">
        <AchievementsTable rows={achievements} />
      </div>
    </div>
  );
}
