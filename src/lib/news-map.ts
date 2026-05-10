import { resolveArticleCreditLine } from "@/lib/article-credit";
import type { LocalNewsPost } from "@/lib/local-news-types";
import type { NewsPost } from "@/lib/news-post";

/** Mapira zapis iz `data/news-posts.json` u oblik za prikaz komponenti. */
export function localPostToNewsShape(p: LocalNewsPost): NewsPost {
  const excerptHtml = `<p>${escapeForWp(p.excerptPlain.slice(0, 400))}</p>`;
  const imgs = p.galleryImageSrcs?.length ? p.galleryImageSrcs : p.imageSrc ? [p.imageSrc] : [];
  const coverImg =
    p.coverImageSrc && imgs.includes(p.coverImageSrc) ? p.coverImageSrc : imgs[0] ?? p.imageSrc ?? null;
  const firstVid = p.galleryVideos?.[0];
  const videoPreview =
    (!coverImg || coverImg.length === 0) && (firstVid?.src || p.videoSrc)
      ? (firstVid?.src ?? p.videoSrc)
      : null;
  const storedCredit = typeof p.createdByLine === "string" ? p.createdByLine.trim() : "";
  const articleCreditLine = storedCredit.length > 0 ? storedCredit : resolveArticleCreditLine();
  return {
    id: p.id,
    slug: p.slug,
    date: p.date,
    title: { rendered: escapeForWp(p.title) },
    excerpt: { rendered: excerptHtml },
    content: { rendered: p.bodyHtml },
    _videoPreviewSrc: videoPreview,
    articleCreditLine,
    _embedded:
      coverImg != null && coverImg.length > 0
        ? {
            "wp:featuredmedia": [{ source_url: coverImg, alt_text: p.title }],
          }
        : undefined,
  };
}

function escapeForWp(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
