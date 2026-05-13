/**
 * Next.js Route Handler — POST /api/achievements
 *
 * Accepts `multipart/form-data` from the admin form (fields + optional `photo` file).
 */
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { ClubAchievement } from "@/config/club-achievements";
import { parseAchievementFormFields } from "@/lib/achievement-form-parse";
import { saveAchievementPhotoForAchievement } from "@/lib/achievement-photo";
import { isAdminSession } from "@/lib/auth-check";
import { appendAchievement } from "@/lib/achievements-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
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

  const parsed = parseAchievementFormFields(fd, "create");
  if (!parsed.ok) {
    return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const id = randomUUID();
  const { values } = parsed;

  let photoSrc: string | undefined;
  const photo = fd.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoSrc = await saveAchievementPhotoForAchievement(id, photo);
    } catch (e) {
      const msg = e instanceof Error && e.message === "TOO_LARGE" ? "Slika je prevelika (najviše 2 MB)." : null;
      if (e instanceof Error && e.message === "INVALID_TYPE") {
        return Response.json(
          { ok: false, error: "Dopuštene su samo slike (JPEG, PNG, WebP, GIF)." },
          { status: 400 },
        );
      }
      return Response.json({ ok: false, error: msg ?? "Učitavanje slike nije uspjelo." }, { status: 400 });
    }
  }

  const row: ClubAchievement = {
    id,
    medal: values.medal,
    discipline: values.discipline,
    name: values.name,
    competition: values.competition,
    date: values.date,
    ...(values.ageGroup ? { ageGroup: values.ageGroup } : {}),
    ...(values.kategorija ? { kategorija: values.kategorija } : {}),
    ...(values.pojas ? { pojas: values.pojas } : {}),
    ...(photoSrc ? { photoSrc } : {}),
  };

  await appendAchievement(row);
  revalidatePath("/rezultati");
  revalidatePath("/admin/rezultati");

  return Response.json({ ok: true, achievement: row });
}
