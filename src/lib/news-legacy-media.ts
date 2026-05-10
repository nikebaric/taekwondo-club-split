import { inferVideoMime } from "@/lib/news-compose-body";

/** Iz starog HTML-a članka (prije strukturiranih polja) izvlači medije za prikaz ispod teksta. */
export function parseLegacyMediaFromBodyHtml(bodyHtml: string): {
  images: string[];
  youtubeEmbeds: string[];
  videos: { src: string; mime: string }[];
} {
  const images: string[] = [];
  const seenImg = new Set<string>();
  const imgRe = /<img[^>]+src="([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(bodyHtml)) !== null) {
    const src = m[1];
    if (src?.startsWith("/uploads/") && !seenImg.has(src)) {
      seenImg.add(src);
      images.push(src);
    }
  }

  const youtubeEmbeds: string[] = [];
  const iframeRe = /<iframe[^>]+src="([^"]+)"/gi;
  while ((m = iframeRe.exec(bodyHtml)) !== null) {
    const src = m[1];
    if (src?.includes("youtube")) youtubeEmbeds.push(src);
  }

  const videos: { src: string; mime: string }[] = [];
  const vidBlockRe = /<video[\s\S]*?<\/video>/gi;
  let block: RegExpExecArray | null;
  while ((block = vidBlockRe.exec(bodyHtml)) !== null) {
    const blockHtml = block[0];
    const srcM = /<source[^>]+src="([^"]+)"(?:[^>]+type="([^"]+)")?/i.exec(blockHtml);
    if (srcM?.[1]?.startsWith("/uploads/")) {
      const mime = srcM[2] || inferVideoMime(srcM[1]) || "video/mp4";
      videos.push({ src: srcM[1], mime });
    }
  }

  return { images, youtubeEmbeds, videos };
}

/** Samo `<div class="news-body">…</div>` za prikaz teksta u članku. */
export function extractNewsBodyHtmlFragment(fullHtml: string): string {
  const m = fullHtml.match(/<div class="news-body">[\s\S]*?<\/div>/);
  return m ? m[0] : fullHtml;
}
