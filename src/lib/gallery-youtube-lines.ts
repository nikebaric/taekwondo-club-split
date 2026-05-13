import type { GalleryYouTube } from "@/config/gallery";
import { parseYoutubeEmbedUrl } from "@/lib/youtube-embed";

/** Parse YouTube URLs from a multi-line field: one URL per line; optional `URL | Title`. */
export function parseGalleryYoutubeField(raw: string): { items: GalleryYouTube[]; error?: string } {
  const lines = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const items: GalleryYouTube[] = [];
  for (const line of lines) {
    const pipe = line.indexOf("|");
    const urlPart = pipe >= 0 ? line.slice(0, pipe).trim() : line;
    const titlePart = pipe >= 0 ? line.slice(pipe + 1).trim() : "";
    const embedUrl = parseYoutubeEmbedUrl(urlPart);
    if (!embedUrl) {
      return {
        items: [],
        error: `Neispravan YouTube link: ${urlPart.slice(0, 56)}${urlPart.length > 56 ? "…" : ""}`,
      };
    }
    items.push({
      kind: "youtube",
      embedUrl,
      title: titlePart.length > 0 ? titlePart : "YouTube video",
    });
  }
  return { items };
}
