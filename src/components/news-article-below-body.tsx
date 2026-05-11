/**
 * NewsArticleBelowBody — renders media (images, YouTube, videos) below an article.
 *
 * KEY CONCEPTS:
 * - **Server Component composing media elements:** This component takes raw data
 *   (image URLs, embed URLs, video sources) and renders them as a media gallery
 *   below the article text. It composes GalleryAlbumStack (interactive, Client
 *   Component) with static YouTube iframes and video elements.
 * - **`as const` assertion:** `kind: "image" as const` narrows the string type from
 *   `string` to the literal `"image"`. This is necessary because GalleryItem is a
 *   discriminated union — TypeScript needs to know the exact `kind` value to ensure
 *   the object matches the correct variant.
 * - **Early return for empty state:** `if (!hasAny) return null;` avoids rendering
 *   an empty <section> with unnecessary borders when there's no media.
 * - **Composition pattern:** This component delegates image rendering to
 *   GalleryAlbumStack (which has lightbox functionality) while handling YouTube
 *   and video elements directly.
 */
"use client";

import type { GalleryItem } from "@/config/gallery";
import { GalleryAlbumStack } from "@/components/gallery-album-stack";

type Props = {
  images: string[];
  youtubeEmbeds: string[];
  videos: { src: string; mime: string }[];
  altBase: string;
};

export function NewsArticleBelowBody({ images, youtubeEmbeds, videos, altBase }: Props) {
  // Transform raw image URLs into GalleryItem objects.
  // `as const` on "image" narrows the type from string to the literal "image",
  // which satisfies the discriminated union type GalleryItem.
  const imageItems: GalleryItem[] = images.map((src) => ({
    kind: "image" as const,
    src,
    alt: altBase,
  }));

  const hasAny =
    imageItems.length > 0 || youtubeEmbeds.length > 0 || videos.length > 0;
  if (!hasAny) return null;

  return (
    <section className="mt-6 space-y-8 border-t border-slate-200 pt-6">
      {imageItems.length > 0 ? <GalleryAlbumStack items={imageItems} /> : null}
      {youtubeEmbeds.map((embedUrl, i) => (
        <div
          key={`yt-${embedUrl}-${i}`}
          className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-black shadow-sm"
        >
          <iframe
            src={embedUrl}
            title={`YouTube ${i + 1}`}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ))}
      {videos.map((v, i) => (
        <figure
          key={`vid-${v.src}-${i}`}
          className="overflow-hidden rounded-xl border border-slate-200 bg-black shadow-sm"
        >
          <div className="relative aspect-video w-full bg-black">
            <video
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-contain"
            >
              <source src={v.src} type={v.mime} />
              Vaš preglednik ne prikazuje video.
            </video>
          </div>
        </figure>
      ))}
    </section>
  );
}
