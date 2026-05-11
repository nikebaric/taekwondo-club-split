/**
 * src/app/natjecanja-seminari/page.tsx — Events calendar (route: /natjecanja-seminari)
 *
 * KEY CONCEPTS:
 * - Simple DATA-DRIVEN PAGE — the pattern is always the same:
 *   1. Export static `metadata` for SEO.
 *   2. async Server Component fetches data.
 *   3. Pass data to a presentational component (<CalendarEventsTable>).
 *   This separation (data-fetching page → dumb display component) is
 *   a scalable pattern used throughout the project.
 * - `new Date().getFullYear()` runs on the server at request time, so
 *   the year label is always accurate without client-side JS.
 */
import type { Metadata } from "next";
import { CalendarEventsTable } from "@/components/calendar-events-table";
import { SectionHeading } from "@/components/section-heading";
import { readCalendarEvents } from "@/lib/calendar-events-store";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Natjecanja i seminari",
  description: `Natjecanja, seminari i klupske aktivnosti — ${site.name}, ${site.city}.`,
};

export default async function NatjecanjaSeminariPage() {
  const year = new Date().getFullYear();
  const events = await readCalendarEvents();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading eyebrow={`Godišnji kalendar ${year}`} title="Natjecanja i seminari" />

      <div className="mx-auto mt-14 w-full max-w-6xl">
        <CalendarEventsTable rows={events} />
      </div>
    </div>
  );
}
