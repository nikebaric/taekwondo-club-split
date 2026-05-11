/**
 * Server-side authentication helpers.
 *
 * KEY CONCEPTS:
 * - **`cookies()` from next/headers**: In Next.js App Router, `cookies()` is an async
 *   function that reads the incoming request's cookies on the server side. It only works
 *   in Server Components, Route Handlers, and Server Actions — never in Client Components.
 *   In Next.js 15+, it returns a Promise that must be awaited.
 * - **Role-based access patterns**: This module provides multiple auth checks at different
 *   permission levels:
 *   - `getMemberSession()` — returns session info for any authenticated user
 *   - `isAdminSession()` — checks if the user is any authenticated member (news/admin)
 *   - `isGalleryAdminSession()` — checks if the user has gallery editing privileges
 *   This pattern lets different parts of the app require different access levels.
 * - **Separation of concerns**: Auth logic is extracted into this shared module rather
 *   than duplicated in every route handler. Each route simply calls `isAdminSession()`
 *   or `isGalleryAdminSession()` as a one-liner guard.
 */
import { cookies } from "next/headers";
import { canonicalMemberDisplayName, isConfiguredClubAdminEmail } from "@/lib/club-admins";
import { site } from "@/config/site";
import { parseSessionToken, sessionCookieName } from "@/lib/session";

/**
 * Read and validate the session cookie; returns the member's name and email, or null.
 * This is the core auth function — all other auth checks are built on top of it.
 */
export async function getMemberSession(): Promise<{ name: string; email: string } | null> {
  // `await cookies()` reads cookies from the incoming HTTP request headers (server-side only)
  const c = await cookies();
  // Parse and verify the HMAC-signed token from the session cookie
  const p = parseSessionToken(c.get(sessionCookieName())?.value);
  if (!p) return null;
  const email = p.email.trim().toLowerCase();

  // Resolve the canonical display name — the stored name in the cookie might be
  // outdated if the admin changed their ADMIN_DISPLAY_NAME in .env
  let name = canonicalMemberDisplayName(email, p.name);

  /* Old cookie without email in payload — if it's just "Nenad", supplement with the coach's full name from site.ts */
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

/** Additional account for gallery only (if not already ADMIN_EMAIL / ADMIN2_EMAIL). Default: nenad.bulovic@inet.hr */
export function galleryAdminEmailNormalized(): string {
  return (process.env.GALLERY_ADMIN_EMAIL ?? "nenad.bulovic@inet.hr").trim().toLowerCase();
}

/**
 * Gallery access uses a broader permission model than general admin.
 * It's allowed for:
 * 1. Any configured club administrator (ADMIN_EMAIL / ADMIN2_EMAIL)
 * 2. The dedicated gallery admin (GALLERY_ADMIN_EMAIL)
 *
 * This pattern demonstrates role-based access — different resources can have
 * different permission checks while sharing the same session mechanism.
 */
export async function isGalleryAdminSession(): Promise<boolean> {
  const s = await getMemberSession();
  if (!s?.email) return false;
  // First check: is this one of the main admin accounts?
  if (isConfiguredClubAdminEmail(s.email)) return true;
  // Second check: is this the dedicated gallery editor?
  return s.email === galleryAdminEmailNormalized();
}

/**
 * General admin check — any authenticated member can access admin features.
 * Simply checks if a valid session exists (non-null).
 */
export async function isAdminSession(): Promise<boolean> {
  return (await getMemberSession()) !== null;
}
