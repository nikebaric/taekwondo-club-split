/**
 * Next.js Route Handler — PATCH & DELETE /api/achievements/[id]
 *
 * PATCH expects multipart/form-data (same fields as the admin achievement form).
 */
import { revalidatePath } from "next/cache";
import type { ClubAchievement } from "@/config/club-achievements";
import { parseAchievementFormFields } from "@/lib/achievement-form-parse";
import {
  deleteManagedAchievementPhotoByPath,
  saveAchievementPhotoForAchievement,
} from "@/lib/achievement-photo";
import { isAdminSession } from "@/lib/auth-check";
import {
  deleteAchievementById,
  findAchievementById,
  updateAchievementById,
} from "@/lib/achievements-store";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Params) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) {
    return Response.json({ ok: false, error: "Nedostaje id." }, { status: 400 });
  }

  const existing = await findAchievementById(id);
  if (!existing) {
    return Response.json({ ok: false, error: "Zapis nije pronađen." }, { status: 404 });
  }

  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("multipart/form-data")) {
    return Response.json({ ok: false, error: "Očekivani multipart/form-data." }, { status: 400 });
  }

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Neispravan obrazac." }, { status: 400 });
  }

  const parsed = parseAchievementFormFields(fd, "edit");
  if (!parsed.ok) {
    return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  if (!("mode" in parsed) || parsed.mode !== "edit") {
    return Response.json({ ok: false, error: "Neispravan način obrasca." }, { status: 400 });
  }

  const v = parsed.values;
  const patch: Partial<Omit<ClubAchievement, "id">> = {
    medal: v.medal,
    discipline: v.discipline,
    name: v.name,
    competition: v.competition,
    date: v.date,
    ageGroup: v.ageGroup,
    kategorija: v.kategorija,
    pojas: v.pojas,
  };

  const removePhoto = fd.get("removePhoto") === "on" || fd.get("removePhoto") === "true";
  const photo = fd.get("photo");

  if (removePhoto) {
    await deleteManagedAchievementPhotoByPath(existing.photoSrc);
    patch.photoSrc = undefined;
  } else if (photo instanceof File && photo.size > 0) {
    try {
      const newSrc = await saveAchievementPhotoForAchievement(id, photo);
      await deleteManagedAchievementPhotoByPath(existing.photoSrc);
      patch.photoSrc = newSrc;
    } catch (e) {
      if (e instanceof Error && e.message === "INVALID_TYPE") {
        return Response.json(
          { ok: false, error: "Dopuštene su samo slike (JPEG, PNG, WebP, GIF)." },
          { status: 400 },
        );
      }
      if (e instanceof Error && e.message === "TOO_LARGE") {
        return Response.json({ ok: false, error: "Slika je prevelika (najviše 2 MB)." }, { status: 400 });
      }
      return Response.json({ ok: false, error: "Učitavanje slike nije uspjelo." }, { status: 400 });
    }
  }

  const updated = await updateAchievementById(id, patch);
  if (!updated) {
    return Response.json({ ok: false, error: "Zapis nije pronađen." }, { status: 404 });
  }

  revalidatePath("/rezultati");
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

  const row = await findAchievementById(id);
  if (row?.photoSrc) {
    await deleteManagedAchievementPhotoByPath(row.photoSrc);
  }

  const ok = await deleteAchievementById(id);
  if (!ok) {
    return Response.json({ ok: false, error: "Zapis nije pronađen." }, { status: 404 });
  }

  revalidatePath("/rezultati");
  revalidatePath("/admin/rezultati");

  return Response.json({ ok: true });
}
