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
  const patch: Partial<Omit<ClubAchievement, "id">> = {};

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
