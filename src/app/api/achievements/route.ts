/**
 * Next.js Route Handler — POST /api/achievements
 *
 * KEY CONCEPTS:
 * - **CRUD API pattern (Create)**: This file handles the "C" in CRUD — creating a new
 *   achievement record. The companion `[id]/route.ts` handles Read, Update (PATCH), and
 *   Delete. Together they form a RESTful CRUD API for a single resource.
 * - **TypeScript type assertions (`as`)**: When parsing unknown JSON input from the
 *   client, we use `as Record<string, unknown>` and then `as AchievementMedal` to tell
 *   the compiler "trust me, this value is this type". But assertions alone don't validate
 *   at runtime — that's why each field is checked against a Set of valid values.
 * - **Set-based validation**: Using `Set.has()` for allowed values is both clean and O(1).
 *   It's a common pattern for enum-like validation in TypeScript APIs.
 * - **randomUUID()**: Node.js built-in for generating RFC 4122 v4 UUIDs — a universally
 *   unique ID without needing a database auto-increment sequence.
 */
import { randomUUID } from "crypto";
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
import { appendAchievement } from "@/lib/achievements-store";

export const runtime = "nodejs";

// Validation Sets — each one represents the allowed values for a field.
// TypeScript's generic `Set<AchievementMedal>` ensures the values match the type.
const MEDALS = new Set<AchievementMedal>(["gold", "silver", "bronze"]);
const DISC = new Set<AchievementDiscipline>(["forme", "borbe"]);
const AGE = new Set<AchievementAgeGroup>(["seniori", "juniori", "kadeti"]);
const BELTS = new Set<AchievementBelt>(ACHIEVEMENT_BELTS);

/** Validate that a string looks like an ISO date (YYYY-MM-DD) and is parseable */
function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(`${s}T12:00:00`);
  return !Number.isNaN(t);
}

export async function POST(req: Request) {
  // Auth guard — `isAdminSession()` reads the cookie from `next/headers` and verifies
  // the HMAC token. If the user isn't logged in, return 401 (Unauthorized).
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  // Parse & validate JSON body — same pattern used across all CRUD routes:
  // 1. Try parsing, catch malformed JSON
  // 2. Check it's an object (not null, not array)
  // 3. Assert `as Record<string, unknown>` so we can access properties
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Neispravan JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return Response.json({ ok: false, error: "Neispravan JSON." }, { status: 400 });
  }
  // `Record<string, unknown>` is TypeScript's type for "object with string keys and
  // unknown values" — safer than `any` because you must narrow each value before using it.
  const b = body as Record<string, unknown>;

  // Type assertions (`as AchievementMedal`) tell TypeScript the expected type, but the
  // actual runtime validation happens on the next line with `MEDALS.has(medal)`.
  const medal = b.medal as AchievementMedal;
  const discipline = b.discipline as AchievementDiscipline;
  const name = String(b.name ?? "").trim();
  const competition = String(b.competition ?? "").trim();
  const date = String(b.date ?? "").trim();

  if (!MEDALS.has(medal)) {
    return Response.json({ ok: false, error: "Nepoznata medalja." }, { status: 400 });
  }
  if (!DISC.has(discipline)) {
    return Response.json({ ok: false, error: "Disciplina mora biti forme ili borbe." }, { status: 400 });
  }
  if (name.length < 1 || name.length > 120) {
    return Response.json({ ok: false, error: "Ime mora imati 1–120 znakova." }, { status: 400 });
  }
  if (competition.length < 1 || competition.length > 300) {
    return Response.json({ ok: false, error: "Natjecanje mora imati 1–300 znakova." }, { status: 400 });
  }
  if (!isIsoDate(date)) {
    return Response.json({ ok: false, error: "Datum mora biti YYYY-MM-DD." }, { status: 400 });
  }

  // Optional fields: only included if provided and non-empty.
  // This pattern avoids storing `undefined` or empty strings in the JSON store.
  let ageGroup: AchievementAgeGroup | undefined;
  if (b.ageGroup !== undefined && b.ageGroup !== null && String(b.ageGroup).trim() !== "") {
    const ag = String(b.ageGroup).trim() as AchievementAgeGroup;
    if (!AGE.has(ag)) {
      return Response.json({ ok: false, error: "Nepoznata dobna skupina." }, { status: 400 });
    }
    ageGroup = ag;
  }

  let kategorija: string | undefined;
  if (b.kategorija !== undefined && b.kategorija !== null && String(b.kategorija).trim() !== "") {
    const k = String(b.kategorija).trim();
    if (k.length > 120) {
      return Response.json({ ok: false, error: "Kategorija može imati najviše 120 znakova." }, { status: 400 });
    }
    kategorija = k;
  }

  let pojas: AchievementBelt | undefined;
  if (b.pojas !== undefined && b.pojas !== null && String(b.pojas).trim() !== "") {
    const p = String(b.pojas).trim() as AchievementBelt;
    if (!BELTS.has(p)) {
      return Response.json({ ok: false, error: "Nepoznat pojas." }, { status: 400 });
    }
    pojas = p;
  }

  // Build the record. The spread `...(ageGroup ? { ageGroup } : {})` conditionally
  // includes optional fields — spreading an empty object `{}` adds nothing.
  const row: ClubAchievement = {
    id: randomUUID(),
    medal,
    discipline,
    name,
    competition,
    date,
    ...(ageGroup ? { ageGroup } : {}),
    ...(kategorija ? { kategorija } : {}),
    ...(pojas ? { pojas } : {}),
  };

  await appendAchievement(row);
  // Invalidate cached pages that display achievements so they reflect the new data
  revalidatePath("/rezultati");
  revalidatePath("/admin/rezultati");

  return Response.json({ ok: true, achievement: row });
}
