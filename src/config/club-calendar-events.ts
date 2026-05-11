/**
 * CONCEPT: TypeScript Interface/Type for Data Shape
 *
 * This `type` declaration defines the "contract" for a calendar event record.
 * Any object claiming to be a `ClubCalendarEvent` must have these exact fields
 * with these exact types — TypeScript enforces this at compile time.
 *
 * Key concepts:
 * - `type` vs `interface` — both define object shapes; `type` is preferred here
 *   because this is a plain data record (no inheritance/extension needed)
 * - Optional property (`organizator?`) — the `?` means the field can be absent;
 *   TypeScript tracks this and forces you to handle `undefined` when reading it
 * - String for dates — TypeScript has no built-in "date string" type, so we use
 *   `string` with a JSDoc hint about the expected format (YYYY-MM-DD)
 *
 * Competitions and seminars — data in `data/calendar-events.json` (admin API).
 */
export type ClubCalendarEvent = {
  id: string;
  title: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  place: string;
  /** Who organizes the event (federation, club, external organizer) */
  organizator?: string; // Optional — not every event has a known organizer
};
