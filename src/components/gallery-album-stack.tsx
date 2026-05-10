"use client";

import { useState } from "react";
import type { GalleryItem } from "@/config/gallery";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { GalleryMedia } from "@/components/gallery-item";

type Props = {
  items: readonly GalleryItem[];
};

export function GalleryAlbumStack({ items }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          {items.map((item, i) =>
            item.kind === "image" ? (
              <div
                key={`${item.src}-${i}`}
                className="cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                role="button"
                tabIndex={0}
                aria-label="Otvori sliku u punoj veličini"
                onClick={() => {
                  setLightboxIndex(i);
                  setLightboxOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setLightboxIndex(i);
                    setLightboxOpen(true);
                  }
                }}
              >
                <GalleryMedia item={item} slideLayout="albumThumb" />
              </div>
            ) : (
              <div key={`media-${i}`} className="col-span-2">
                <GalleryMedia item={item} slideLayout="albumThumb" />
              </div>
            )
          )}
        </div>
      </div>

      <GalleryLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={items}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
