/**
 * Natjecanja i seminari — podaci u `data/calendar-events.json` (API administracije).
 */
export type ClubCalendarEvent = {
  id: string;
  title: string;
  /** ISO datum YYYY-MM-DD */
  date: string;
  place: string;
  /** Tko organizira događaj (savez, klub, izvanjski organizator) */
  organizator?: string;
};
