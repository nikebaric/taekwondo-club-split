/**
 * src/app/natjecanja-seminari/page.tsx — Events calendar (route: /natjecanja-seminari)
 *
 * Godina u naslovu dolazi iz datuma događaja u podacima, ne iz trenutačne kalendarske godine,
 * da kalendar ne prikazuje krivu godinu kad su unosi za prošlu ili sljedeću sezonu.
 */
import type { Metadata } from "next";
import { CalendarEventsTable } from "@/components/calendar-events-table";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/config/site";
import { calendarEventsYearLabel } from "@/lib/calendar-year-label";
import { readCalendarEvents } from "@/lib/calendar-events-store";

export async function generateMetadata(): Promise<Metadata> {
  const events = await readCalendarEvents();
  const y = calendarEventsYearLabel(events);
  const title = y ? `Natjecanja i seminari (${y})` : "Natjecanja i seminari";
  const desc = y
    ? `Natjecanja, seminari i klupske aktivnosti za ${y}. — ${site.name}, ${site.city}.`
    : `Natjecanja, seminari i klupske aktivnosti — ${site.name}, ${site.city}.`;
  return { title, description: desc };
}

export default async function NatjecanjaSeminariPage() {
  const events = await readCalendarEvents();
  const yearLabel = calendarEventsYearLabel(events);

  const eyebrow = yearLabel ? `Godišnji kalendar · ${yearLabel}` : "Godišnji kalendar";
  const subtitle = yearLabel
    ? yearLabel.includes("–")
      ? `Prikazani događaji u razdoblju ${yearLabel}.`
      : `Prikazani događaji za ${yearLabel}. godinu.`
    : "Još nema unesenih događaja — godinu prikazujemo kad u kalendaru postoje datumi.";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading eyebrow={eyebrow} title="Natjecanja i seminari" subtitle={subtitle} />

      <div className="mx-auto mt-14 w-full max-w-6xl">
        <CalendarEventsTable rows={events} />
      </div>
    </div>
  );
}
