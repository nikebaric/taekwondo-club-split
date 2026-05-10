/** Vraća youtube-nocookie embed URL ili null ako link nije prepoznat. */
export function parseYoutubeEmbedUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (/^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
      return null;
    }
    if (host === "www.youtube.com" || host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return `https://www.youtube-nocookie.com/embed/${v}`;
      const parts = u.pathname.split("/").filter(Boolean);
      const si = parts.indexOf("shorts");
      if (si >= 0 && parts[si + 1] && /^[\w-]{11}$/.test(parts[si + 1])) {
        return `https://www.youtube-nocookie.com/embed/${parts[si + 1]}`;
      }
      const ei = parts.indexOf("embed");
      if (ei >= 0 && parts[ei + 1] && /^[\w-]{11}$/.test(parts[ei + 1])) {
        return `https://www.youtube-nocookie.com/embed/${parts[ei + 1]}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}
