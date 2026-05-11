/**
 * Environment-based credential management for club administrators.
 *
 * KEY CONCEPTS:
 * - **Environment-based credentials**: Instead of storing user accounts in a database,
 *   this project defines admin credentials directly in `.env.local`. This is suitable
 *   for small sites with a fixed, small number of admins (2 in this case).
 * - **Multi-admin support pattern**: The module supports two independent admin accounts
 *   (ADMIN_EMAIL/ADMIN_PASSWORD and ADMIN2_EMAIL/ADMIN2_PASSWORD). Each can have a
 *   custom display name. This pattern is extensible but wouldn't scale beyond a handful
 *   of users — at that point, a proper user table in a database is needed.
 * - **Email normalization**: Emails are lowercased and URL-decoded (in case of copy-paste
 *   from URLs like `nikebaric%40gmail.com`). This prevents "same email, different case"
 *   from creating duplicate accounts.
 * - **Plain-text password comparison**: This is acceptable here because the passwords
 *   come from environment variables (not user-created). In a real user registration
 *   system, you'd use bcrypt or argon2 to hash passwords.
 */
import { site } from "@/config/site";

/**
 * Normalize an email address: trim whitespace, decode URL encoding, lowercase.
 * URL-decoding handles cases where someone copies an email from a URL context
 * (e.g., `nikebaric%40gmail.com` → `nikebaric@gmail.com`).
 */
function normalizeEmail(value: string): string {
  let s = value.trim();
  /* E.g. pasted from a URL: nikebaric%40gmail.com → nikebaric@gmail.com */
  try {
    s = decodeURIComponent(s);
  } catch {
    /* invalid % sequence — leave as-is */
  }
  return s.toLowerCase();
}

const SECOND_ADMIN_DEFAULT_DISPLAY_NAME = "Niko Barić";

/**
 * If .env contains only a single word (e.g. the old ADMIN_DISPLAY_NAME=Nenad), ignore it —
 * the full name from the config is shown instead. Two or more words = a real override (e.g. academic title).
 */
function resolveAdminDisplayName(envOptional: string | undefined, defaultFullName: string): string {
  const trimmed = envOptional?.trim();
  if (!trimmed) return defaultFullName;
  // Require at least two words for a display name override — a single word
  // (like "Nenad") is likely an incomplete name from legacy config
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return trimmed;
  return defaultFullName;
}

/** Whether at least one email/password pair for club admins is configured in .env. */
export function hasClubAdminCredentialsConfigured(): boolean {
  const e1 = process.env.ADMIN_EMAIL?.trim();
  const p1 = process.env.ADMIN_PASSWORD;
  const e2 = process.env.ADMIN2_EMAIL?.trim();
  const p2 = process.env.ADMIN2_PASSWORD;
  // `Boolean(x)` converts truthy/falsy to true/false — both email AND password must exist
  return Boolean((e1 && p1) || (e2 && p2));
}

/**
 * Attempt to match the given email+password against configured admin accounts.
 * Returns the matched admin's display name and normalized email, or null if no match.
 *
 * The function builds an array of all configured admin pairs, then uses `.find()` to
 * check for a match. This approach scales cleanly if more admin slots are added later.
 */
export function matchClubAdmin(
  emailRaw: string,
  passwordRaw: string,
): { displayName: string; emailNormalized: string } | null {
  const emailNormalized = normalizeEmail(emailRaw);

  // Build the list of configured admin accounts from environment variables
  const pairs: Array<{ emailNorm: string; password: string; displayName: string }> = [];

  // First admin account (primary)
  const e1 = process.env.ADMIN_EMAIL?.trim() ?? "";
  const p1 = process.env.ADMIN_PASSWORD ?? "";
  if (e1 && p1) {
    // Display name falls back to the head coach name from site config
    const displayName = resolveAdminDisplayName(process.env.ADMIN_DISPLAY_NAME, site.headCoach.name);
    pairs.push({
      emailNorm: normalizeEmail(e1),
      password: p1,
      displayName,
    });
  }

  // Second admin account
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

  // Find the first pair where both email and password match
  const hit = pairs.find((x) => x.emailNorm === emailNormalized && x.password === passwordRaw);
  if (!hit) return null;

  return { displayName: hit.displayName, emailNormalized };
}

/** Whether the email matches one of the configured club administrators from .env (after successful login). */
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
 * Display name for navigation — same rule as at login.
 * Used when reading the session to upgrade old cookies with "Nenad" to "Nenad Bulović"
 * when the email matches ADMIN_EMAIL / ADMIN2_EMAIL.
 *
 * This function re-resolves the display name from current env vars, so if an admin
 * updates their ADMIN_DISPLAY_NAME in .env and restarts the server, the name updates
 * for existing sessions without requiring re-login.
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
