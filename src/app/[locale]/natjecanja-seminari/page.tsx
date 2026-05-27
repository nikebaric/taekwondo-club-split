import type { Metadata } from "next";
import { CalendarEventsTable } from "@/components/calendar-events-table";
import { SectionHeading } from "@/components/section-heading";
import { calendarEventsYearLabel } from "@/lib/calendar-year-label";
import { localizeCalendarEvent } from "@/lib/localize-club-data";
import { readCalendarEvents } from "@/lib/calendar-events-store";
import { getPageLocale } from "@/i18n/locale";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, t } = await getPageLocale(params);
  const events = (await readCalendarEvents()).map((e) => localizeCalendarEvent(e, locale));
  const y = calendarEventsYearLabel(events);
  const title = y ? `${t.calendar.title} (${y})` : t.calendar.title;
  const description = y
    ? `${t.calendar.descDefault} ${y}. — ${t.meta.siteName}, ${t.meta.city}.`
    : `${t.calendar.descDefault} — ${t.meta.siteName}, ${t.meta.city}.`;
  return { title, description };
}

export default async function CalendarPage({ params }: Props) {
  const { locale, t } = await getPageLocale(params);
  const events = (await readCalendarEvents()).map((e) => localizeCalendarEvent(e, locale));
  const yearLabel = calendarEventsYearLabel(events);

  const eyebrow = yearLabel ? `${t.calendar.eyebrowDefault} · ${yearLabel}` : t.calendar.eyebrowDefault;
  const subtitle = yearLabel
    ? yearLabel.includes("–")
      ? locale === "en"
        ? `Events shown for period ${yearLabel}.`
        : `Prikazani događaji u razdoblju ${yearLabel}.`
      : locale === "en"
        ? `Events shown for ${yearLabel}.`
        : `Prikazani događaji za ${yearLabel}. godinu.`
    : t.calendar.subtitleEmpty;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading eyebrow={eyebrow} title={t.calendar.title} subtitle={subtitle} />
      <div className="mx-auto mt-14 w-full max-w-6xl">
        <CalendarEventsTable rows={events} locale={locale} />
      </div>
    </div>
  );
}
