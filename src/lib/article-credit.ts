/**
 * CONCEPT: Cascading Fallback Pattern
 *
 * This module resolves an article credit line by checking multiple sources
 * in priority order:
 *   session display name → env ADMIN_ARTICLE_CREDIT_LINE → env ADMIN_ARTICLE_BYLINE
 *   → env ADMIN_EMAIL (known mapping) → env ADMIN_DISPLAY_NAME → hardcoded default
 *
 * This "waterfall" or "cascading fallback" pattern ensures there's always a
 * valid value, even when the app runs with minimal configuration. Each level
 * provides progressively less-specific defaults.
 *
 * Also demonstrates:
 * - `process.env` — accessing environment variables (server-side only in Next.js)
 * - Optional chaining on env vars (`process.env.X?.trim()`)
 * - Early returns — each `if` exits the function, keeping logic flat
 */

function normalizeEmail(value: string): string {
  return value
    .trim()
    .replace(/^["']|["']$/g, "") // Strip wrapping quotes that may come from .env files
    .toLowerCase();
}

/** Credit line for a new post — the logged-in admin's canonical display name from the session. */
export function formatArticleCreditFromAuthor(displayName: string): string {
  const n = displayName.trim();
  if (!n) return resolveArticleCreditLine(); // Fallback if display name is empty
  return `Created by ${n}`;
}

/**
 * Default credit line when no saved author exists (e.g. legacy data) — overridable via env.
 * For new posts, use {@link formatArticleCreditFromAuthor} with the session display name.
 */
export function resolveArticleCreditLine(): string {
  // Priority 1: Fully custom credit line from env
  const fullLine = process.env.ADMIN_ARTICLE_CREDIT_LINE?.trim();
  if (fullLine) return fullLine;

  // Priority 2: Just the name from env
  const byline = process.env.ADMIN_ARTICLE_BYLINE?.trim();
  if (byline) return `Created by ${byline}`;

  // Priority 3: Recognize known admin email → map to display name
  const email = normalizeEmail(process.env.ADMIN_EMAIL ?? "");
  if (email === "nenad.bulovic@inet.hr") {
    return "Created by Nenad Bulović";
  }

  // Priority 4: Generic display name from env
  const display = process.env.ADMIN_DISPLAY_NAME?.trim();
  if (display) return `Created by ${display}`;

  // Priority 5: Ultimate fallback — guarantees a non-empty return
  return "Created by Administrator";
}
