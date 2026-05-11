/**
 * Next.js Route Handler — PATCH & DELETE /api/achievements/[id]
 *
 * KEY CONCEPTS:
 * - **CRUD API pattern (Update + Delete)**: This file handles the "U" and "D" of CRUD.
 *   The `[id]` folder creates a dynamic segment — requests to `/api/achievements/abc123`
 *   make `{ id: "abc123" }` available via `ctx.params`.
 * - **Partial updates with PATCH**: Unlike PUT (which replaces the entire resource),
 *   PATCH only updates the fields that are present in the request body. The
 *   `Partial<Omit<ClubAchievement, "id">>` type says "any subset of ClubAchievement
 *   fields except id" — because the id is immutable and comes from the URL.
 * - **Clearing optional fields**: Setting a field to `null` or `""` in the request
 *   means "remove this optional field", while omitting it means "leave it unchanged".
 *   This distinction is important for a good PATCH implementation.
 * - **revalidatePath with dynamic segments**: After updating data, we revalidate both
 *   the listing page and the individual detail page so Next.js serves fresh content.
 */
import { revalidatePath } from "next/cache";
import {
  ACHIEVEMENT_BELTS,
  type AchievementAgeGroup,
  type AchievementBelt,
  type AchievementDiscipline,
  type AchievementMedal,
  type ClubAchievement,
} from "@/config/club-achievements";
import { isAdminSession } from "@/lib/auth-check";
import { deleteAchievementById, updateAchievementById } from "@/lib/achievements-store";

export const runtime = "nodejs";

const MEDALS = new Set<AchievementMedal>(["gold", "silver", "bronze"]);
const DISC = new Set<AchievementDiscipline>(["forme", "borbe"]);
const AGE = new Set<AchievementAgeGroup>(["seniori", "juniori", "kadeti"]);
const BELTS = new Set<AchievementBelt>(ACHIEVEMENT_BELTS);

function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(`${s}T12:00:00`);
  return !Number.isNaN(t);
}

/**
 * In Next.js 15+, route handler params are async (a Promise).
 * This type defines the shape of the second argument passed to each handler.
 */
type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Params) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  // Await the params Promise to extract the dynamic segment value
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
  // `Partial<Omit<ClubAchievement, "id">>` — TypeScript utility types combined:
  // `Omit` removes the "id" key, `Partial` makes every remaining key optional.
  // This perfectly models "only update the fields you send".
  const patch: Partial<Omit<ClubAchievement, "id">> = {};

  // Each field is only added to `patch` if it was included in the request.
  // This way, omitted fields are left unchanged in the stored record.
  if (b.medal !== undefined) {
    const medal = b.medal as AchievementMedal;
    if (!MEDALS.has(medal)) {
      return Response.json({ ok: false, error: "Nepoznata medalja." }, { status: 400 });
    }
    patch.medal = medal;
  }
  if (b.discipline !== undefined) {
    const discipline = b.discipline as AchievementDiscipline;
    if (!DISC.has(discipline)) {
      return Response.json({ ok: false, error: "Disciplina mora biti forme ili borbe." }, { status: 400 });
    }
    patch.discipline = discipline;
  }
  if (b.name !== undefined) {
    const name = String(b.name).trim();
    if (name.length < 1 || name.length > 120) {
      return Response.json({ ok: false, error: "Ime mora imati 1–120 znakova." }, { status: 400 });
    }
    patch.name = name;
  }
  if (b.competition !== undefined) {
    const competition = String(b.competition).trim();
    if (competition.length < 1 || competition.length > 300) {
      return Response.json({ ok: false, error: "Natjecanje mora imati 1–300 znakova." }, { status: 400 });
    }
    patch.competition = competition;
  }
  if (b.date !== undefined) {
    const date = String(b.date).trim();
    if (!isIsoDate(date)) {
      return Response.json({ ok: false, error: "Datum mora biti YYYY-MM-DD." }, { status: 400 });
    }
    patch.date = date;
  }
  // For optional fields, sending `null` or `""` explicitly clears them (sets to undefined).
  // This is the standard PATCH convention for "unset this field".
  if (b.ageGroup !== undefined) {
    if (b.ageGroup === null || String(b.ageGroup).trim() === "") {
      patch.ageGroup = undefined;
    } else {
      const ag = String(b.ageGroup).trim() as AchievementAgeGroup;
      if (!AGE.has(ag)) {
        return Response.json({ ok: false, error: "Nepoznata dobna skupina." }, { status: 400 });
      }
      patch.ageGroup = ag;
    }
  }

  if (b.kategorija !== undefined) {
    if (b.kategorija === null || String(b.kategorija).trim() === "") {
      patch.kategorija = undefined;
    } else {
      const k = String(b.kategorija).trim();
      if (k.length > 120) {
        return Response.json({ ok: false, error: "Kategorija može imati najviše 120 znakova." }, { status: 400 });
      }
      patch.kategorija = k;
    }
  }

  if (b.pojas !== undefined) {
    if (b.pojas === null || String(b.pojas).trim() === "") {
      patch.pojas = undefined;
    } else {
      const p = String(b.pojas).trim() as AchievementBelt;
      if (!BELTS.has(p)) {
        return Response.json({ ok: false, error: "Nepoznat pojas." }, { status: 400 });
      }
      patch.pojas = p;
    }
  }

  const updated = await updateAchievementById(id, patch);
  if (!updated) {
    return Response.json({ ok: false, error: "Zapis nije pronađen." }, { status: 404 });
  }

  revalidatePath("/uspjesi");
  revalidatePath("/admin/rezultati");
  // `encodeURIComponent` ensures special characters in the id don't break the URL
  revalidatePath(`/admin/rezultati/${encodeURIComponent(id)}`);

  return Response.json({ ok: true, achievement: updated });
}

export async function DELETE(_req: Request, ctx: Params) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) {
    return Response.json({ ok: false, error: "Nedostaje id." }, { status: 400 });
  }

  const ok = await deleteAchievementById(id);
  if (!ok) {
    return Response.json({ ok: false, error: "Zapis nije pronađen." }, { status: 404 });
  }

  revalidatePath("/uspjesi");
  revalidatePath("/admin/rezultati");

  return Response.json({ ok: true });
}
