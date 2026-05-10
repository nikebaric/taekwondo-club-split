import { site } from "@/config/site";

function normalizeEmail(value: string): string {
  let s = value.trim();
  /* Npr. zaljepljeno iz URL-a: nikebaric%40gmail.com → nikebaric@gmail.com */
  try {
    s = decodeURIComponent(s);
  } catch {
    /* neispravan % u nizu — ostavi kakav je */
  }
  return s.toLowerCase();
}

const SECOND_ADMIN_DEFAULT_DISPLAY_NAME = "Niko Barić";

/**
 * Ako je u .env samo jedna riječ (npr. staro ADMIN_DISPLAY_NAME=Nenad), ne koristi je —
 * prikazuje se puno ime iz konfiguracije. Dvije ili više riječi = pravi override (npr. akademska titula).
 */
function resolveAdminDisplayName(envOptional: string | undefined, defaultFullName: string): string {
  const trimmed = envOptional?.trim();
  if (!trimmed) return defaultFullName;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return trimmed;
  return defaultFullName;
}

/** Jesu li u .env postavljeni barem jedan par e-mail/lozinka za klupske admine. */
export function hasClubAdminCredentialsConfigured(): boolean {
  const e1 = process.env.ADMIN_EMAIL?.trim();
  const p1 = process.env.ADMIN_PASSWORD;
  const e2 = process.env.ADMIN2_EMAIL?.trim();
  const p2 = process.env.ADMIN2_PASSWORD;
  return Boolean((e1 && p1) || (e2 && p2));
}

/**
 * Dva klupska administratora (novosti / admin): Nenad Bulović i Niko Barić.
 * Usporedba lozinke je jednaka kao dosad (plain env).
 */
export function matchClubAdmin(
  emailRaw: string,
  passwordRaw: string,
): { displayName: string; emailNormalized: string } | null {
  const emailNormalized = normalizeEmail(emailRaw);

  const pairs: Array<{ emailNorm: string; password: string; displayName: string }> = [];

  const e1 = process.env.ADMIN_EMAIL?.trim() ?? "";
  const p1 = process.env.ADMIN_PASSWORD ?? "";
  if (e1 && p1) {
    const displayName = resolveAdminDisplayName(process.env.ADMIN_DISPLAY_NAME, site.headCoach.name);
    pairs.push({
      emailNorm: normalizeEmail(e1),
      password: p1,
      displayName,
    });
  }

  const e2 = process.env.ADMIN2_EMAIL?.trim() ?? "";
  const p2 = process.env.ADMIN2_PASSWORD ?? "";
  if (e2 && p2) {
    const displayName = resolveAdminDisplayName(
      process.env.ADMIN2_DISPLAY_NAME,
      SECOND_ADMIN_DEFAULT_DISPLAY_NAME,
    );
    pairs.push({
      emailNorm: normalizeEmail(e2),
      password: p2,
      displayName,
    });
  }

  const hit = pairs.find((x) => x.emailNorm === emailNormalized && x.password === passwordRaw);
  if (!hit) return null;

  return { displayName: hit.displayName, emailNormalized };
}

/** Je li e-mail jedan od klupskih administratora iz .env (nakon uspješne prijave). */
export function isConfiguredClubAdminEmail(emailNormalized: string): boolean {
  const e = emailNormalized.trim().toLowerCase();
  if (!e) return false;
  const e1 = process.env.ADMIN_EMAIL?.trim();
  const e2 = process.env.ADMIN2_EMAIL?.trim();
  if (e1 && normalizeEmail(e1) === e) return true;
  if (e2 && normalizeEmail(e2) === e) return true;
  return false;
}

/**
 * Ime za prikaz u navigaciji — isto pravilo kao pri prijavi.
 * Koristi se pri čitanju sesije da stare kolačiće s "Nenad" učine "Nenad Bulović"
 * kad se e-mail poklapa s ADMIN_EMAIL / ADMIN2_EMAIL.
 */
export function canonicalMemberDisplayName(emailNormalized: string, storedName: string): string {
  const e = emailNormalized.trim().toLowerCase();
  if (!e) return storedName;

  const e1 = process.env.ADMIN_EMAIL?.trim();
  if (e1 && normalizeEmail(e1) === e) {
    return resolveAdminDisplayName(process.env.ADMIN_DISPLAY_NAME, site.headCoach.name);
  }

  const e2 = process.env.ADMIN2_EMAIL?.trim();
  if (e2 && normalizeEmail(e2) === e) {
    return resolveAdminDisplayName(process.env.ADMIN2_DISPLAY_NAME, SECOND_ADMIN_DEFAULT_DISPLAY_NAME);
  }

  return storedName;
}
