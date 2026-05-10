import { revalidatePath } from "next/cache";
import type { ClubCalendarEvent } from "@/config/club-calendar-events";
import { isAdminSession } from "@/lib/auth-check";
import {
  deleteCalendarEventById,
  updateCalendarEventById,
} from "@/lib/calendar-events-store";

export const runtime = "nodejs";

function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(`${s}T12:00:00`);
  return !Number.isNaN(t);
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Params) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) {
    return Response.json({ ok: false, error: "Nedostaje id." }, { status: 400 });
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
  const patch: Partial<Omit<ClubCalendarEvent, "id">> = {};

  if (b.title !== undefined) {
    const title = String(b.title).trim();
    if (title.length < 1 || title.length > 300) {
      return Response.json({ ok: false, error: "Naziv mora imati 1–300 znakova." }, { status: 400 });
    }
    patch.title = title;
  }
  if (b.date !== undefined) {
    const date = String(b.date).trim();
    if (!isIsoDate(date)) {
      return Response.json({ ok: false, error: "Datum mora biti YYYY-MM-DD." }, { status: 400 });
    }
    patch.date = date;
  }
  if (b.place !== undefined) {
    const place = String(b.place).trim();
    if (place.length < 1 || place.length > 200) {
      return Response.json({ ok: false, error: "Mjesto mora imati 1–200 znakova." }, { status: 400 });
    }
    patch.place = place;
  }

  if (b.organizator !== undefined) {
    if (b.organizator === null || String(b.organizator).trim() === "") {
      patch.organizator = undefined;
    } else {
      const o = String(b.organizator).trim();
      if (o.length > 200) {
        return Response.json({ ok: false, error: "Organizator može imati najviše 200 znakova." }, { status: 400 });
      }
      patch.organizator = o;
    }
  }

  const updated = await updateCalendarEventById(id, patch);
  if (!updated) {
    return Response.json({ ok: false, error: "Zapis nije pronađen." }, { status: 404 });
  }

  revalidatePath("/natjecanja-seminari");
  revalidatePath("/admin/kalendar");
  revalidatePath(`/admin/kalendar/${encodeURIComponent(id)}`);

  return Response.json({ ok: true, event: updated });
}

export async function DELETE(_req: Request, ctx: Params) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) {
    return Response.json({ ok: false, error: "Nedostaje id." }, { status: 400 });
  }

  const ok = await deleteCalendarEventById(id);
  if (!ok) {
    return Response.json({ ok: false, error: "Zapis nije pronađen." }, { status: 404 });
  }

  revalidatePath("/natjecanja-seminari");
  revalidatePath("/admin/kalendar");

  return Response.json({ ok: true });
}
