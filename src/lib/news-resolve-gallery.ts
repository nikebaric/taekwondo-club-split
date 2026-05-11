/**
 * CONCEPT: Fallback/Migration Pattern (Structured Data vs Legacy HTML)
 *
 * When an app evolves, older data may be stored in a different format.
 * This function handles both:
 * 1. NEW posts: media stored in structured JSON fields (galleryImageSrcs, etc.)
 * 2. OLD posts: media embedded as HTML tags in bodyHtml (legacy format)
 * 3. OLDEST posts: single image/video in flat fields (imageSrc, videoSrc)
 *
 * The resolution order (structured → legacy HTML → flat fields) is a common
 * migration pattern — it lets you support old data without a database migration.
 */

import type { LocalNewsPost } from "@/lib/local-news-types";
import { parseLegacyMediaFromBodyHtml } from "@/lib/news-legacy-media";

export type ResolvedArticleGallery = {
  images: string[];
  youtubeEmbeds: string[];
  videos: { src: string; mime: string }[];
};

/** Structured fields or fallback from legacy HTML. */
export function resolveArticleGallery(post: LocalNewsPost): ResolvedArticleGallery {
  // Priority 1: Check if the post uses the new structured gallery fields
  const hasStructured =
    (post.galleryImageSrcs && post.galleryImageSrcs.length > 0) ||
    (post.galleryYoutubeEmbeds && post.galleryYoutubeEmbeds.length > 0) ||
    (post.galleryVideos && post.galleryVideos.length > 0);

  if (hasStructured) {
    const yt = [...(post.galleryYoutubeEmbeds ?? [])];
    if (yt.length === 0 && post.youtubeEmbedStored?.trim()) {
      yt.push(post.youtubeEmbedStored.trim());
    }
    return {
      images: post.galleryImageSrcs ?? [],
      youtubeEmbeds: yt,
      videos: post.galleryVideos ?? [],
    };
  }

  // Priority 2: Parse media from legacy HTML (older posts stored media inline)
  const legacy = parseLegacyMediaFromBodyHtml(post.bodyHtml);
  if (
    legacy.images.length > 0 ||
    legacy.youtubeEmbeds.length > 0 ||
    legacy.videos.length > 0
  ) {
    return legacy;
  }

  // Priority 3: Fall back to the oldest single-field format
  const imgs: string[] = [];
  if (post.imageSrc) imgs.push(post.imageSrc);
  const vids: { src: string; mime: string }[] = [];
  if (post.videoSrc && post.videoMime) {
    vids.push({ src: post.videoSrc, mime: post.videoMime });
  } else if (post.videoSrc) {
    vids.push({
      src: post.videoSrc,
      mime: post.videoSrc.endsWith(".webm") ? "video/webm" : "video/mp4",
    });
  }
  const yt: string[] = [];
  if (post.youtubeEmbedStored) yt.push(post.youtubeEmbedStored);

  return { images: imgs, youtubeEmbeds: yt, videos: vids };
}
