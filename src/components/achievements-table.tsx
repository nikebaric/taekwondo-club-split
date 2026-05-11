/**
 * AchievementsTable — displays club achievements with interactive filtering.
 *
 * KEY CONCEPTS:
 * - **Complex Client Component:** "use client" because it manages filter state
 *   (medal, discipline, age group, belt) and re-renders when filters change.
 * - **useState for filter state:** Each filter dimension has its own state variable.
 *   Keeping them separate (vs. one object) means changing one filter doesn't
 *   unnecessarily affect the others.
 * - **useMemo for derived data:** `filtered` is computed from `rows` + filter states.
 *   useMemo caches the result and only recomputes when its dependencies change.
 *   Without it, the filter+sort would run on every render — wasteful for large datasets.
 * - **Responsive layout (cards vs table):** Two layouts are rendered side-by-side:
 *   cards (`md:hidden`) for mobile and a table (`hidden md:block`) for desktop.
 *   Tailwind's responsive prefixes toggle visibility — no JavaScript needed for layout.
 * - **TypeScript union types for filters:** `"all" | AchievementMedal` ensures filter
 *   state can only hold valid values. The compiler catches typos at build time.
 */
"use client";

import { useMemo, useState } from "react";
import {
  ACHIEVEMENT_BELTS,
  pojasLabel,
  type AchievementAgeGroup,
  type AchievementBelt,
  type AchievementDiscipline,
  type AchievementMedal,
  type ClubAchievement,
} from "@/config/club-achievements";

// Union types for filter state: "all" means no filter is applied.
type MedalFilter = "all" | AchievementMedal;
type AgeFilter = "all" | NonNullable<ClubAchievement["ageGroup"]>;
type DisciplineFilter = "all" | AchievementDiscipline;
type BeltFilter = "all" | AchievementBelt;

function medalLabel(m: AchievementMedal): string {
  if (m === "gold") return "Zlato";
  if (m === "silver") return "Srebro";
  return "Bronca";
}

function medalBadgeClass(m: AchievementMedal): string {
  if (m === "gold") return "bg-amber-100 text-amber-900 ring-amber-300/80";
  if (m === "silver") return "bg-slate-100 text-slate-800 ring-slate-300/80";
  return "bg-orange-100 text-orange-950 ring-orange-300/70";
}

function disciplineLabel(d: AchievementDiscipline): string {
  return d === "forme" ? "Forme" : "Borbe";
}

function disciplineBadgeClass(d: AchievementDiscipline): string {
  return d === "forme"
    ? "bg-indigo-50 text-indigo-900 ring-indigo-200/90"
    : "bg-rose-50 text-rose-900 ring-rose-200/90";
}

function ageGroupLabel(ag: AchievementAgeGroup): string {
  if (ag === "seniori") return "Seniori";
  if (ag === "juniori") return "Juniori";
  return "Kadeti";
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function AchievementRowCells({ row }: { row: ClubAchievement }) {
  return (
    <>
      <td className="px-2 py-3 align-top sm:px-3 lg:px-4">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 sm:px-2.5 sm:py-1 sm:text-xs ${medalBadgeClass(row.medal)}`}
        >
          {medalLabel(row.medal)}
        </span>
      </td>
      <td className="px-2 py-3 align-top sm:px-3 lg:px-4">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 sm:px-2.5 sm:py-1 sm:text-xs ${disciplineBadgeClass(row.discipline)}`}
        >
          {disciplineLabel(row.discipline)}
        </span>
      </td>
      <td className="min-w-0 break-words px-2 py-3 font-medium text-slate-900 sm:px-3 lg:px-4">
        {row.name}
      </td>
      <td className="min-w-0 break-words px-2 py-3 text-slate-700 sm:px-3 lg:px-4">{row.competition}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums text-[var(--muted)] sm:px-3 lg:px-4">
        {formatDisplayDate(row.date)}
      </td>
      <td className="min-w-0 px-2 py-3 text-slate-700 sm:px-3 lg:px-4">
        {row.ageGroup ? ageGroupLabel(row.ageGroup) : "—"}
      </td>
      <td className="min-w-0 break-words px-2 py-3 text-slate-700 sm:px-3 lg:px-4">
        {row.kategorija?.trim() ? row.kategorija.trim() : "—"}
      </td>
      <td className="px-2 py-3 sm:px-3 lg:px-4">
        {row.pojas ? (
          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800 ring-1 ring-slate-200/90 sm:text-xs">
            {pojasLabel(row.pojas)}
          </span>
        ) : (
          "—"
        )}
      </td>
    </>
  );
}

export function AchievementsTable({ rows }: { rows: ClubAchievement[] }) {
  // Each filter gets its own useState — simpler than managing one big state object.
  const [medalFilter, setMedalFilter] = useState<MedalFilter>("all");
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilter>("all");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
  const [beltFilter, setBeltFilter] = useState<BeltFilter>("all");

  // useMemo caches these booleans — only recalculated when `rows` changes.
  // Used to conditionally show/hide filter sections.
  const hasAgeGroups = useMemo(() => rows.some((r) => r.ageGroup), [rows]);
  const hasBelts = useMemo(() => rows.some((r) => r.pojas), [rows]);

  // useMemo for derived data: filters and sorts the rows array.
  // The dependency array includes all filter states — React recomputes only when
  // one of these changes, not on every render. This is a performance optimization.
  const filtered = useMemo(() => {
    let r = rows.filter((row) => {
      if (medalFilter !== "all" && row.medal !== medalFilter) return false;
      if (disciplineFilter !== "all" && row.discipline !== disciplineFilter) return false;
      if (ageFilter !== "all" && row.ageGroup !== ageFilter) return false;
      if (beltFilter !== "all" && row.pojas !== beltFilter) return false;
      return true;
    });
    r = [...r].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return r;
  }, [rows, medalFilter, disciplineFilter, ageFilter, beltFilter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Medalja</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["all", "Svi"],
                ["gold", "Zlato"],
                ["silver", "Srebro"],
                ["bronze", "Bronca"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMedalFilter(key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  medalFilter === key
                    ? "bg-[var(--accent)] text-white shadow-[0_0_20px_-6px_var(--accent-glow)]"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Disciplina</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["all", "Svi"],
                ["forme", "Forme"],
                ["borbe", "Borbe"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setDisciplineFilter(key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  disciplineFilter === key
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {hasAgeGroups ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Dobna skupina</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["all", "Svi"],
                  ["seniori", "Seniori"],
                  ["juniori", "Juniori"],
                  ["kadeti", "Kadeti"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAgeFilter(key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    ageFilter === key
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {hasBelts ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Pojas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBeltFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  beltFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Svi
              </button>
              {ACHIEVEMENT_BELTS.map((belt) => (
                <button
                  key={belt}
                  type="button"
                  onClick={() => setBeltFilter(belt)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    beltFilter === belt
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pojasLabel(belt)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Cards: all content without horizontal scroll on narrow screens */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--muted)] shadow-sm">
            Nema rezultata za odabrane filtere.
          </div>
        ) : (
          filtered.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-[var(--surface)] p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${medalBadgeClass(row.medal)}`}
                >
                  {medalLabel(row.medal)}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${disciplineBadgeClass(row.discipline)}`}
                >
                  {disciplineLabel(row.discipline)}
                </span>
              </div>
              <p className="mt-3 font-medium text-slate-900">{row.name}</p>
              <p className="mt-1 text-sm text-slate-700">{row.competition}</p>
              <dl className="mt-3 grid gap-1.5 text-sm text-slate-600">
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-slate-500">Datum</dt>
                  <dd className="tabular-nums text-[var(--muted)]">{formatDisplayDate(row.date)}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-slate-500">Dobna skup.</dt>
                  <dd>{row.ageGroup ? ageGroupLabel(row.ageGroup) : "—"}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-slate-500">Kategorija</dt>
                  <dd className="min-w-0 break-words">{row.kategorija?.trim() ? row.kategorija.trim() : "—"}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-slate-500">Pojas</dt>
                  <dd>{row.pojas ? pojasLabel(row.pojas) : "—"}</dd>
                </div>
              </dl>
            </div>
          ))
        )}
      </div>

      {/* Table: fills the container width, no min-width or overflow-x */}
      <div className="hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full table-fixed border-collapse text-left text-xs lg:text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 lg:text-xs">
            <tr>
              <th className="w-[9%] py-3 pl-3 pr-1 font-semibold lg:py-4 lg:pl-4">Medalja</th>
              <th className="w-[10%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Disciplina</th>
              <th className="w-[14%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Ime</th>
              <th className="w-[22%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Natjecanje</th>
              <th className="w-[11%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Datum</th>
              <th className="w-[11%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Dobna sk.</th>
              <th className="w-[13%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Kategorija</th>
              <th className="w-[10%] py-3 pl-1 pr-3 font-semibold lg:py-4 lg:pr-4">Pojas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[var(--muted)]">
                  Nema rezultata za odabrane filtere.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <AchievementRowCells row={row} />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
