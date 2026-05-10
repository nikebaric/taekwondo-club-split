import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { ClubCalendarEvent } from "@/config/club-calendar-events";

const FILE = join(process.cwd(), "data", "calendar-events.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true });
}

export async function readCalendarEvents(): Promise<ClubCalendarEvent[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ClubCalendarEvent[];
  } catch {
    return [];
  }
}

export async function writeCalendarEvents(events: ClubCalendarEvent[]): Promise<void> {
  await ensureDataDir();
  await writeFile(FILE, `${JSON.stringify(events, null, 2)}\n`, "utf8");
}

export async function findCalendarEventById(id: string): Promise<ClubCalendarEvent | null> {
  const events = await readCalendarEvents();
  return events.find((e) => e.id === id) ?? null;
}

export async function appendCalendarEvent(event: ClubCalendarEvent): Promise<void> {
  const events = await readCalendarEvents();
  events.push(event);
  await writeCalendarEvents(events);
}

export async function updateCalendarEventById(
  id: string,
  patch: Partial<Omit<ClubCalendarEvent, "id">>,
): Promise<ClubCalendarEvent | null> {
  const events = await readCalendarEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const prev = events[idx];
  const next: ClubCalendarEvent = { ...prev, ...patch, id };
  if ("organizator" in patch && patch.organizator === undefined) {
    delete next.organizator;
  }
  events[idx] = next;
  await writeCalendarEvents(events);
  return events[idx];
}

export async function deleteCalendarEventById(id: string): Promise<boolean> {
  const events = await readCalendarEvents();
  const next = events.filter((e) => e.id !== id);
  if (next.length === events.length) return false;
  await writeCalendarEvents(next);
  return true;
}
