/**
 * CONCEPT: URL Parsing + Privacy-Enhanced Embeds
 *
 * This function normalizes any YouTube URL format into a privacy-enhanced
 * embed URL (youtube-nocookie.com). The "nocookie" domain is YouTube's
 * privacy mode — it doesn't set tracking cookies on the viewer's browser
 * (important for GDPR compliance).
 *
 * Supported input formats:
 * - https://youtu.be/VIDEO_ID (short links)
 * - https://www.youtube.com/watch?v=VIDEO_ID (standard)
 * - https://www.youtube.com/shorts/VIDEO_ID (Shorts)
 * - https://www.youtube.com/embed/VIDEO_ID (already embedded)
 *
 * Key concepts:
 * - `new URL()` — the web-standard URL parser (throws on invalid input)
 * - `try/catch` — gracefully handle malformed URLs
 * - Video ID validation: always 11 characters, word chars + hyphens
 * - Multiple format handling with early returns
 */

/** Returns a youtube-nocookie embed URL, or null if the link is not recognized. */
export function parseYoutubeEmbedUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  try {
    // URL constructor parses the string into components (hostname, pathname, searchParams)
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();

    // Format: https://youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (/^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
      return null;
    }

    // Formats: watch?v=, /shorts/, /embed/
    if (host === "www.youtube.com" || host === "youtube.com" || host === "m.youtube.com") {
      // Standard: ?v=VIDEO_ID query parameter
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return `https://www.youtube-nocookie.com/embed/${v}`;

      const parts = u.pathname.split("/").filter(Boolean);

      // Shorts: /shorts/VIDEO_ID
      const si = parts.indexOf("shorts");
      if (si >= 0 && parts[si + 1] && /^[\w-]{11}$/.test(parts[si + 1])) {
        return `https://www.youtube-nocookie.com/embed/${parts[si + 1]}`;
      }

      // Already embedded: /embed/VIDEO_ID
      const ei = parts.indexOf("embed");
      if (ei >= 0 && parts[ei + 1] && /^[\w-]{11}$/.test(parts[ei + 1])) {
        return `https://www.youtube-nocookie.com/embed/${parts[ei + 1]}`;
      }
    }
  } catch {
    // Invalid URL — not a recognized YouTube link
    return null;
  }
  return null;
}
