/**
 * CONCEPT: Mapper Pattern — Data Layer → UI Shape
 *
 * Components expect data in a specific format (NewsPost), but the database
 * stores data differently (LocalNewsPost). This mapper bridges the gap:
 *   LocalNewsPost (storage format) → NewsPost (display format)
 *
 * Benefits:
 * - Components don't know about storage implementation details
 * - Storage format can evolve independently of UI components
 * - Single place to add derived/computed fields (like articleCreditLine)
 * - Mirrors the "DTO" (Data Transfer Object) pattern in backend development
 */

import { resolveArticleCreditLine } from "@/lib/article-credit";
import type { LocalNewsPost } from "@/lib/local-news-types";
import type { NewsPost } from "@/lib/news-post";

/** Maps a record from `data/news-posts.json` to the shape used by display components. */
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

// Private helper (not exported) — minimal HTML escaping for safe insertion
// into the WordPress-like rendered HTML structure.
function escapeForWp(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
