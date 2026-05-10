/** Dekodira tekst iz `.news-body` (obrnuto od nl2brEscaped + escapeHtml). */
export function extractDescriptionPlainFromBodyHtml(bodyHtml: string): string {
  const m = bodyHtml.match(/<div class="news-body">([\s\S]*?)<\/div>/);
  if (!m) return "";
  let inner = m[1];
  inner = inner.replace(/<br\s*\/?>/gi, "\n");
  inner = inner.replace(/&amp;/g, "&");
  inner = inner.replace(/&lt;/g, "<");
  inner = inner.replace(/&gt;/g, ">");
  inner = inner.replace(/&quot;/g, '"');
  inner = inner.replace(/&#039;/g, "'");
  inner = inner.replace(/<[^>]+>/g, "");
  return inner.trim();
}

/** Pokušaj YouTube watch URL iz iframe embeda u bodyHtml. */
export function extractYoutubeWatchHintFromBody(bodyHtml: string): string | null {
  const m = bodyHtml.match(/youtube-nocookie\.com\/embed\/([\w-]{11})/);
  if (!m?.[1]) return null;
  return `https://www.youtube.com/watch?v=${m[1]}`;
}
