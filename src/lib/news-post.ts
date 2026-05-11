/**
 * CONCEPT: Type + Helper Functions Pattern
 *
 * This file pairs a type definition with pure helper functions that operate
 * on that type. This is a common alternative to classes in TypeScript:
 * - The type defines the data shape
 * - Standalone functions (not methods) provide operations on the data
 * - Easier to tree-shake (unused functions are removed from the bundle)
 * - No `this` context issues — simpler to test and compose
 *
 * Also demonstrates:
 * - Optional chaining (`?.`) — safely access nested properties that might not exist
 * - Nullish coalescing (`??`) — provide a fallback when value is null/undefined
 * - Return type union (`{ kind: "image"; ... } | { kind: "video"; ... } | null`)
 *   for discriminated return values
 */

/** News post shape for UI display (title/excerpt/body as HTML strings). */
export type NewsPost = {
  id: number;
  slug: string;
  date: string;
  // Nested `{ rendered: string }` mirrors WordPress REST API shape —
  // keeping compatibility with the original data source.
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  /** Local posts only: MP4/WebM for card preview when there is no featured image */
  _videoPreviewSrc?: string | null;
  /** Author credit line on the article */
  articleCreditLine?: string | null;
  _embedded?: {
    author?: Array<{ name?: string; slug?: string }>;
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text?: string;
    }>;
  };
};

// `as const` on a string stores the literal type "wp:featuredmedia" —
// used as a computed property key for type-safe access to `_embedded`.
const FEATURED = "wp:featuredmedia" as const;

export function getFeaturedImage(post: NewsPost): { src: string; alt: string } | null {
  // Optional chaining (`?.`) short-circuits to undefined if any link is nullish.
  // This avoids verbose null checks: `if (post._embedded && post._embedded[FEATURED] && ...)`
  const media = post._embedded?.[FEATURED]?.[0];
  if (!media?.source_url) return null;
  // Nullish coalescing (`??`) — use "" as fallback only when alt_text is null/undefined
  return { src: media.source_url, alt: media.alt_text ?? "" };
}

// CONCEPT: Discriminated union RETURN type — callers can check `.kind` to know
// whether they received an image or video, with full type safety on the fields.
/** News card: image or short video if only a video without an image is available. */
export function getListingCover(
  post: NewsPost,
): { kind: "image"; src: string; alt: string } | { kind: "video"; src: string } | null {
  const img = getFeaturedImage(post);
  if (img) return { kind: "image", ...img };
  const v = post._videoPreviewSrc?.trim();
  if (v) return { kind: "video", src: v };
  return null;
}

export function getPostAuthor(post: NewsPost): string | null {
  const name = post._embedded?.author?.[0]?.name?.trim();
  return name || null;
}

// Simple utility — regex `/<[^>]*>/g` matches all HTML tags (anything between < and >).
// WARNING: not safe for untrusted HTML sanitization — fine for display text extraction.
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
