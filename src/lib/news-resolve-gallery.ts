import type { LocalNewsPost } from "@/lib/local-news-types";
import { parseLegacyMediaFromBodyHtml } from "@/lib/news-legacy-media";

export type ResolvedArticleGallery = {
  images: string[];
  youtubeEmbeds: string[];
  videos: { src: string; mime: string }[];
};

/** Strukturirana polja ili fallback iz starog HTML-a. */
export function resolveArticleGallery(post: LocalNewsPost): ResolvedArticleGallery {
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

  const legacy = parseLegacyMediaFromBodyHtml(post.bodyHtml);
  if (
    legacy.images.length > 0 ||
    legacy.youtubeEmbeds.length > 0 ||
    legacy.videos.length > 0
  ) {
    return legacy;
  }

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
