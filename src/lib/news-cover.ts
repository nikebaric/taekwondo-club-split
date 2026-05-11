/**
 * CONCEPT: Data Resolution Pattern
 *
 * These functions resolve which image to use as the article "hero cover."
 * The pattern: try the explicit choice first, fall back to a sensible default.
 * This is common when data comes from forms where users may or may not
 * make a selection.
 *
 * Also demonstrates:
 * - `Math.min(Math.max(...))` for clamping a number within a range
 * - Non-null assertion (`!`) — telling TS "I know this index exists"
 * - FormData API — the web-standard way to read submitted form fields
 */

import type { LocalNewsPost } from "@/lib/local-news-types";

// Safely parse a numeric form field, clamping it within valid bounds.
export function parseCoverImageIndex(form: FormData, galleryLen: number): number {
  if (galleryLen <= 0) return 0;
  const raw = form.get("cover_image_index");
  const n = raw != null ? parseInt(String(raw), 10) : 0;
  if (Number.isNaN(n)) return 0;
  // Clamp between 0 and galleryLen-1 to prevent out-of-bounds access
  return Math.min(Math.max(0, n), galleryLen - 1);
}

/** Hero cover below the title — explicit or first in the list. */
export function resolveHeroCoverSrc(raw: LocalNewsPost, galleryImages: string[]): string | null {
  if (galleryImages.length === 0) return null;
  const c = raw.coverImageSrc?.trim();
  // Prefer the stored cover if it still exists in the gallery
  if (c && galleryImages.includes(c)) return c;
  // Fallback: use the first gallery image. The `!` asserts it's defined
  // (safe because we checked length > 0 above).
  return galleryImages[0]!;
}
