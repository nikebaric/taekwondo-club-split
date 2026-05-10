import { cookies } from "next/headers";
import { canonicalMemberDisplayName, isConfiguredClubAdminEmail } from "@/lib/club-admins";
import { site } from "@/config/site";
import { parseSessionToken, sessionCookieName } from "@/lib/session";

export async function getMemberSession(): Promise<{ name: string; email: string } | null> {
  const c = await cookies();
  const p = parseSessionToken(c.get(sessionCookieName())?.value);
  if (!p) return null;
  const email = p.email.trim().toLowerCase();

  let name = canonicalMemberDisplayName(email, p.name);

  /* Stari kolačić bez e-maila u payloadu — ako je samo "Nenad", nadopuni punim imenom trenera iz site.ts */
  if (!email) {
    const coachFull = site.headCoach.name;
    const coachFirst = coachFull.split(/\s+/)[0]?.toLowerCase() ?? "";
    const stored = p.name.trim();
    if (coachFirst && stored.toLowerCase() === coachFirst && !stored.includes(" ")) {
      name = coachFull;
    }
  }

  return { name, email };
}

/** Dodatni račun samo za galeriju (ako nije već ADMIN_EMAIL / ADMIN2_EMAIL). Zadano: nenad.bulovic@inet.hr */
export function galleryAdminEmailNormalized(): string {
  return (process.env.GALLERY_ADMIN_EMAIL ?? "nenad.bulovic@inet.hr").trim().toLowerCase();
}

/** Galeriju smiju klupski administratori (ADMIN_EMAIL / ADMIN2_EMAIL) ili e-mail iz GALLERY_ADMIN_EMAIL. */
export async function isGalleryAdminSession(): Promise<boolean> {
  const s = await getMemberSession();
  if (!s?.email) return false;
  if (isConfiguredClubAdminEmail(s.email)) return true;
  return s.email === galleryAdminEmailNormalized();
}

export async function isAdminSession(): Promise<boolean> {
  return (await getMemberSession()) !== null;
}
