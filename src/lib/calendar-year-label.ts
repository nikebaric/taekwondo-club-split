import type { ClubCalendarEvent } from "@/config/club-calendar-events";

/**
 * Godina ili raspon godina iz ISO datuma događaja (YYYY-MM-DD).
 * Prazan popis ili neispravni datumi → null.
 */
export function calendarEventsYearLabel(events: readonly ClubCalendarEvent[]): string | null {
  const years = new Set<number>();
  for (const e of events) {
    const y = Number(e.date.slice(0, 4));
    if (Number.isFinite(y) && y >= 1990 && y <= 2100) years.add(y);
  }
  if (years.size === 0) return null;
  const sorted = [...years].sort((a, b) => a - b);
  if (sorted.length === 1) return String(sorted[0]);
  return `${sorted[0]}–${sorted[sorted.length - 1]}`;
}
