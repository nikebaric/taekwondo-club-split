function normalizeEmail(value: string): string {
  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase();
}

/** Potpis za novu objavu — ime prijavljenog administratora (kanonsko ime iz sesije). */
export function formatArticleCreditFromAuthor(displayName: string): string {
  const n = displayName.trim();
  if (!n) return resolveArticleCreditLine();
  return `Created by ${n}`;
}

/**
 * Zadani potpis kada nema spremljenog autora (npr. stari podaci) — override preko env.
 * Za nove objave koristite {@link formatArticleCreditFromAuthor} s imenom iz sesije.
 */
export function resolveArticleCreditLine(): string {
  const fullLine = process.env.ADMIN_ARTICLE_CREDIT_LINE?.trim();
  if (fullLine) return fullLine;

  const byline = process.env.ADMIN_ARTICLE_BYLINE?.trim();
  if (byline) return `Created by ${byline}`;

  const email = normalizeEmail(process.env.ADMIN_EMAIL ?? "");
  if (email === "nenad.bulovic@inet.hr") {
    return "Created by Nenad Bulović";
  }

  const display = process.env.ADMIN_DISPLAY_NAME?.trim();
  if (display) return `Created by ${display}`;

  return "Created by Administrator";
}
