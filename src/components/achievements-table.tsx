/**
 * AchievementsTable — displays club achievements with interactive filtering.
 *
 * KEY CONCEPTS:
 * - **Complex Client Component:** "use client" because it manages filter state
 *   (medal, discipline, age group, belt) and re-renders when filters change.
 * - **useState for filter state:** Each filter dimension has its own state variable.
 *   Keeping them separate (vs. one object) means changing one filter doesn't
 *   unnecessarily affect the others.
 * - **useMemo for derived data:** `filtered` is computed from `rows` + filter states;
 *   `sorted` applies the chosen sort; `paged` slices the current page. Page resets when
 *   filters or page size change; page is clamped when the filtered set shrinks.
 * - **Responsive layout (cards vs table):** Two layouts are rendered side-by-side:
 *   cards (`md:hidden`) for mobile and a table (`hidden md:block`) for desktop.
 *   Tailwind's responsive prefixes toggle visibility — no JavaScript needed for layout.
 * - **Sort and paging below the table/cards:** Filters stay on top; after the result list,
 *   sort, page size, range text, and page buttons keep the primary content first.
 */
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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

/** Sort options — value is stable for <select> and URL later if needed */
type SortKey = "date-desc" | "date-asc" | "name-asc" | "name-desc" | "competition-asc" | "medal-desc";

const MEDAL_RANK: Record<AchievementMedal, number> = { bronze: 0, silver: 1, gold: 2 };

const HR_COLLATOR = new Intl.Collator("hr", { sensitivity: "base" });

function compareDateDesc(a: ClubAchievement, b: ClubAchievement): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function sortAchievements(rows: ClubAchievement[], sortKey: SortKey): ClubAchievement[] {
  const copy = [...rows];
  switch (sortKey) {
    case "date-desc":
      copy.sort(compareDateDesc);
      break;
    case "date-asc":
      copy.sort((a, b) => -compareDateDesc(a, b));
      break;
    case "name-asc":
      copy.sort((a, b) => {
        const c = HR_COLLATOR.compare(a.name, b.name);
        return c !== 0 ? c : compareDateDesc(a, b);
      });
      break;
    case "name-desc":
      copy.sort((a, b) => {
        const c = HR_COLLATOR.compare(b.name, a.name);
        return c !== 0 ? c : compareDateDesc(a, b);
      });
      break;
    case "competition-asc":
      copy.sort((a, b) => {
        const c = HR_COLLATOR.compare(a.competition, b.competition);
        return c !== 0 ? c : compareDateDesc(a, b);
      });
      break;
    case "medal-desc":
      copy.sort((a, b) => {
        const c = MEDAL_RANK[b.medal] - MEDAL_RANK[a.medal];
        return c !== 0 ? c : compareDateDesc(a, b);
      });
      break;
    default:
      copy.sort(compareDateDesc);
  }
  return copy;
}

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
      <td className="px-2 py-2 text-center align-middle sm:px-3 lg:px-4">
        {row.photoSrc ? (
          <Image
            src={row.photoSrc}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400"
            aria-hidden
          >
            —
          </div>
        )}
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

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function AchievementsTable({ rows }: { rows: ClubAchievement[] }) {
  // Each filter gets its own useState — simpler than managing one big state object.
  const [medalFilter, setMedalFilter] = useState<MedalFilter>("all");
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilter>("all");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
  const [beltFilter, setBeltFilter] = useState<BeltFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date-desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);

  // useMemo caches these booleans — only recalculated when `rows` changes.
  // Used to conditionally show/hide filter sections.
  const hasAgeGroups = useMemo(() => rows.some((r) => r.ageGroup), [rows]);
  const hasBelts = useMemo(() => rows.some((r) => r.pojas), [rows]);

  // useMemo for derived data: filters and sorts the rows array.
  // The dependency array includes all filter states — React recomputes only when
  // one of these changes, not on every render. This is a performance optimization.
  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (medalFilter !== "all" && row.medal !== medalFilter) return false;
      if (disciplineFilter !== "all" && row.discipline !== disciplineFilter) return false;
      if (ageFilter !== "all" && row.ageGroup !== ageFilter) return false;
      if (beltFilter !== "all" && row.pojas !== beltFilter) return false;
      return true;
    });
  }, [rows, medalFilter, disciplineFilter, ageFilter, beltFilter]);

  const sorted = useMemo(() => sortAchievements(filtered, sortKey), [filtered, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize) || 1);
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPage(1);
  }, [medalFilter, disciplineFilter, ageFilter, beltFilter, pageSize]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const rangeFrom = sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeTo = sorted.length === 0 ? 0 : Math.min(currentPage * pageSize, sorted.length);

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
      <div className="mt-10 space-y-3 md:hidden">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--muted)] shadow-sm">
            Nema rezultata za odabrane filtere.
          </div>
        ) : (
          paged.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-[var(--surface)] p-4 shadow-sm"
            >
              <div className="flex gap-3">
                {row.photoSrc ? (
                  <Image
                    src={row.photoSrc}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-50 text-slate-400"
                    aria-hidden
                  >
                    —
                  </div>
                )}
                <div className="min-w-0 flex-1">
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
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Ime i prezime
                  </p>
                  <p className="mt-0.5 font-medium text-slate-900">{row.name}</p>
                  <p className="mt-1 text-sm text-slate-700">{row.competition}</p>
                </div>
              </div>
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
      <div className="mt-10 hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full table-fixed border-collapse text-left text-xs lg:text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 lg:text-xs">
            <tr>
              <th className="w-[8%] py-3 pl-3 pr-1 font-semibold lg:py-4 lg:pl-4">Medalja</th>
              <th className="w-[9%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Disciplina</th>
              <th className="w-[7%] px-1 py-3 text-center font-semibold lg:px-2 lg:py-4">Slika</th>
              <th className="w-[15%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Ime i prezime</th>
              <th className="w-[20%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Natjecanje</th>
              <th className="w-[10%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Datum</th>
              <th className="w-[10%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Dobna sk.</th>
              <th className="w-[11%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Kategorija</th>
              <th className="w-[10%] py-3 pl-1 pr-3 font-semibold lg:py-4 lg:pr-4">Pojas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[var(--muted)]">
                  Nema rezultata za odabrane filtere.
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <AchievementRowCells row={row} />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ach-sort" className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Sortiranje
              </label>
              <select
                id="ach-sort"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="date-desc">Datum (najnovije prvo)</option>
                <option value="date-asc">Datum (najstarije prvo)</option>
                <option value="name-asc">Ime i prezime (A–Ž)</option>
                <option value="name-desc">Ime i prezime (Ž–A)</option>
                <option value="competition-asc">Natjecanje (A–Ž)</option>
                <option value="medal-desc">Medalja (zlato prvo)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ach-page-size" className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Po stranici
              </label>
              <select
                id="ach-page-size"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
                className="max-w-[12rem] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} redaka
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-[var(--muted)] sm:ml-auto sm:text-right">
              Prikazano{" "}
              <span className="tabular-nums font-medium text-slate-700">
                {rangeFrom}–{rangeTo}
              </span>{" "}
              od <span className="tabular-nums font-medium text-slate-700">{sorted.length}</span>
            </p>
          </div>

          {totalPages > 1 ? (
            <nav
              className="flex flex-col items-stretch gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              aria-label="Straničenje rezultata"
            >
              <p className="text-center text-sm text-[var(--muted)] sm:text-left">
                Stranica{" "}
                <span className="font-semibold text-slate-800">
                  {currentPage} / {totalPages}
                </span>
              </p>
              <div className="flex justify-center gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prethodna
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sljedeća
                </button>
              </div>
            </nav>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
