/**
 * GalleryAlbumStack — a grid of gallery items that opens a lightbox on click.
 *
 * KEY CONCEPTS:
 * - **Client Component wrapping:** This component is "use client" because it manages
 *   interactive state (lightbox open/close). It wraps the GalleryMedia (presentational)
 *   and GalleryLightbox (interactive) components, coordinating them via state.
 * - **useState for lightbox state:** Two state variables — one boolean for open/close,
 *   one number for which item to show. These are "lifted" here because both the grid
 *   (click to open) and lightbox (navigate/close) need access to them.
 * - **Passing callbacks to children:** `setLightboxOpen` and `setLightboxIndex` are
 *   passed as props to GalleryLightbox. This is the "lifting state up" pattern —
 *   the parent owns the state, children communicate via callback props.
 * - **`readonly` TypeScript modifier:** `readonly GalleryItem[]` prevents accidental
 *   mutation of the items array — the component should only read, never modify.
 */
"use client";

import { useState } from "react";
import type { GalleryItem } from "@/config/gallery";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { GalleryMedia } from "@/components/gallery-item";

type Props = {
  items: readonly GalleryItem[];  // `readonly` ensures this array can't be mutated
};

export function GalleryAlbumStack({ items }: Props) {
  // Two pieces of state work together: which item is selected and whether to show it.
  // This is simpler than a single state object and avoids unnecessary re-renders.
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

      {/* Callback props: the lightbox calls onClose/onIndexChange to update state
          owned by this parent component. This is React's one-way data flow:
          parent owns state → passes it down → child calls back to update. */}
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
