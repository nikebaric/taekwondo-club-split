import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/auth-check";
import { appendCalendarEvent } from "@/lib/calendar-events-store";
import type { ClubCalendarEvent } from "@/config/club-calendar-events";

export const runtime = "nodejs";

function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(`${s}T12:00:00`);
  return !Number.isNaN(t);
}

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Neispravan JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return Response.json({ ok: false, error: "Neispravan JSON." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  const date = String(b.date ?? "").trim();
  const place = String(b.place ?? "").trim();

  let organizator: string | undefined;
  if (b.organizator !== undefined && b.organizator !== null && String(b.organizator).trim() !== "") {
    const o = String(b.organizator).trim();
    if (o.length > 200) {
      return Response.json({ ok: false, error: "Organizator može imati najviše 200 znakova." }, { status: 400 });
    }
    organizator = o;
  }

  if (title.length < 1 || title.length > 300) {
    return Response.json({ ok: false, error: "Naziv mora imati 1–300 znakova." }, { status: 400 });
  }
  if (!isIsoDate(date)) {
    return Response.json({ ok: false, error: "Datum mora biti YYYY-MM-DD." }, { status: 400 });
  }
  if (place.length < 1 || place.length > 200) {
    return Response.json({ ok: false, error: "Mjesto mora imati 1–200 znakova." }, { status: 400 });
  }

  const row: ClubCalendarEvent = {
    id: randomUUID(),
    title,
    date,
    place,
    ...(organizator ? { organizator } : {}),
  };
  await appendCalendarEvent(row);
  revalidatePath("/natjecanja-seminari");
  revalidatePath("/admin/kalendar");

  return Response.json({ ok: true, event: row });
}
