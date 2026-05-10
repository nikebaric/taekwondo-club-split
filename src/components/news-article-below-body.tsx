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
