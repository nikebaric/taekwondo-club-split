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
