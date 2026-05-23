/**
 * Environment-based credential management for club administrators.
 *
 * KEY CONCEPTS:
 * - **Environment-based credentials**: Instead of storing user accounts in a database,
 *   this project defines admin credentials directly in `.env.local`. This is suitable
 *   for small sites with a fixed, small number of admins (2 in this case).
 * - **Multi-admin support pattern**: The module supports two independent admin accounts
 *   (ADMIN_EMAIL + password, ADMIN2_EMAIL + password). Each account accepts either a
 *   bcrypt hash (`*_PASSWORD_HASH`) or a plain env password (`*_PASSWORD`) for easier hosting.
 *   handful of users — at that point, a proper user table in a database is needed.
 * - **Email normalization**: Emails are lowercased and URL-decoded (in case of copy-paste
 *   from URLs like `nikebaric%40gmail.com`). This prevents "same email, different case"
 *   from creating duplicate accounts.
 * - **Passwords**: Prefer `ADMIN_PASSWORD_HASH` / `ADMIN2_PASSWORD_HASH` (bcrypt). For
 *   hosts where `$` in hashes breaks env vars (e.g. some dashboards), you may set
 *   `ADMIN_PASSWORD` / `ADMIN2_PASSWORD` instead — plain text, weaker; use bcrypt when possible.
 */
import { timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { site } from "@/config/site";

function timingSafeEqualUtf8(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function looksLikeBcryptHash(value: string): boolean {
  const t = value.trim();
  return t.startsWith("$2a$") || t.startsWith("$2b$") || t.startsWith("$2y$");
}

/** True if this admin row should verify with bcrypt (`hash` string). */
function shouldUseBcrypt(hash: string, plain: string): boolean {
  if (hash && looksLikeBcryptHash(hash)) return true;
  if (plain) return false;
  return Boolean(hash);
}

async function passwordMatchesStored(
  passwordRaw: string,
  hashEnv: string | undefined,
  plainEnv: string | undefined,
): Promise<boolean> {
  const hash = hashEnv?.trim() ?? "";
  const plain = plainEnv?.trim() ?? "";
  if (shouldUseBcrypt(hash, plain)) {
    return bcrypt.compare(passwordRaw, hash);
  }
  if (plain) {
    return timingSafeEqualUtf8(passwordRaw, plain);
  }
  return false;
}

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

/** Whether at least one email + (bcrypt hash or plain password) pair is configured. */
export function hasClubAdminCredentialsConfigured(): boolean {
  const e1 = process.env.ADMIN_EMAIL?.trim();
  const h1 = process.env.ADMIN_PASSWORD_HASH?.trim();
  const plain1 = process.env.ADMIN_PASSWORD?.trim();
  const e2 = process.env.ADMIN2_EMAIL?.trim();
  const h2 = process.env.ADMIN2_PASSWORD_HASH?.trim();
  const plain2 = process.env.ADMIN2_PASSWORD?.trim();
  const has1 = Boolean(e1 && (h1 || plain1));
  const has2 = Boolean(e2 && (h2 || plain2));
  return has1 || has2;
}

/**
 * Attempt to match the given email+password against configured admin accounts.
 * Returns the matched admin's display name and normalized email, or null if no match.
 *
 * Now async because bcrypt.compare() is asynchronous — it offloads the CPU-intensive
 * hash comparison to avoid blocking the event loop. The function checks each configured
 * admin sequentially (only 2 accounts, so the overhead is negligible).
 */
export async function matchClubAdmin(
  emailRaw: string,
  passwordRaw: string,
): Promise<{ displayName: string; emailNormalized: string } | null> {
  const emailNormalized = normalizeEmail(emailRaw);

  const pairs: Array<{
    emailNorm: string;
    passwordHash: string;
    passwordPlain: string;
    displayName: string;
  }> = [];

  // First admin account (primary)
  const e1 = process.env.ADMIN_EMAIL?.trim() ?? "";
  const h1 = process.env.ADMIN_PASSWORD_HASH?.trim() ?? "";
  const plain1 = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (e1 && (h1 || plain1)) {
    const displayName = resolveAdminDisplayName(process.env.ADMIN_DISPLAY_NAME, site.headCoach.name);
    pairs.push({
      emailNorm: normalizeEmail(e1),
      passwordHash: h1,
      passwordPlain: plain1,
      displayName,
    });
  }

  // Second admin account
  const e2 = process.env.ADMIN2_EMAIL?.trim() ?? "";
  const h2 = process.env.ADMIN2_PASSWORD_HASH?.trim() ?? "";
  const plain2 = process.env.ADMIN2_PASSWORD?.trim() ?? "";
  if (e2 && (h2 || plain2)) {
    const displayName = resolveAdminDisplayName(
      process.env.ADMIN2_DISPLAY_NAME,
      SECOND_ADMIN_DEFAULT_DISPLAY_NAME,
    );
    pairs.push({
      emailNorm: normalizeEmail(e2),
      passwordHash: h2,
      passwordPlain: plain2,
      displayName,
    });
  }

  for (const pair of pairs) {
    if (pair.emailNorm !== emailNormalized) continue;
    if (await passwordMatchesStored(passwordRaw, pair.passwordHash, pair.passwordPlain)) {
      return { displayName: pair.displayName, emailNormalized };
    }
  }

  return null;
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
