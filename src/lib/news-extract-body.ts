/**
 * CONCEPT: Reverse Transformation — HTML → Plain Text
 *
 * This is the inverse of `news-compose-body.ts`. When editing a post, we need
 * to recover the original plain text from stored HTML. This involves:
 * - Regex extraction of content from a known wrapper div
 * - Reversing HTML entity encoding (unescape)
 * - Replacing <br> tags back to newlines
 *
 * Key regex concepts:
 * - `[\s\S]*?` — match any character including newlines (non-greedy)
 * - Capture group `(...)` — `m[1]` gives the matched inner content
 * - `/gi` flags — global (all matches) + case-insensitive
 */

/** Decodes text from `.news-body` (reverse of nl2brEscaped + escapeHtml). */
export function extractDescriptionPlainFromBodyHtml(bodyHtml: string): string {
  // Regex extracts content between the wrapper div tags
  const m = bodyHtml.match(/<div class="news-body">([\s\S]*?)<\/div>/);
  if (!m) return "";
  let inner = m[1];
  // Reverse the transformations applied during composition:
  inner = inner.replace(/<br\s*\/?>/gi, "\n"); // <br /> → newline
  inner = inner.replace(/&amp;/g, "&");        // HTML entities → original characters
  inner = inner.replace(/&lt;/g, "<");
  inner = inner.replace(/&gt;/g, ">");
  inner = inner.replace(/&quot;/g, '"');
  inner = inner.replace(/&#039;/g, "'");
  inner = inner.replace(/<[^>]+>/g, "");       // Strip any remaining HTML tags
  return inner.trim();
}

/** Attempt to extract a YouTube watch URL from an iframe embed in bodyHtml. */
export function extractYoutubeWatchHintFromBody(bodyHtml: string): string | null {
  // `[\w-]{11}` matches exactly 11 word chars or hyphens — the YouTube video ID format
  const m = bodyHtml.match(/youtube-nocookie\.com\/embed\/([\w-]{11})/);
  if (!m?.[1]) return null;
  return `https://www.youtube.com/watch?v=${m[1]}`;
}
