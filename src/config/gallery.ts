/**
 * CONCEPT: Discriminated Union Types (Tagged Unions)
 *
 * This file defines a gallery system using TypeScript's discriminated unions —
 * a pattern where each variant of a union has a shared literal property (`kind`)
 * that lets TypeScript narrow the type automatically in conditionals.
 *
 * Key TypeScript concepts:
 * - Discriminated unions: each type has `kind: "image" | "youtube" | "videoFile"`
 * - Type narrowing: checking `item.kind === "image"` gives full access to GalleryImage fields
 * - Type predicates (`i is GalleryImage`) for custom type-guard functions
 * - Optional properties (`caption?: string`) — may be undefined
 * - Union type alias (`GalleryItem`) combining all variants
 *
 * Types and helpers for the gallery. Album list is in `data/gallery-albums.json`
 * (editable via admin for the selected e-mail, or manually in the JSON).
 * Static images in `public/galerija/`; new uploads in `public/uploads/gallery/`.
 */

// Each gallery item type has a `kind` discriminant — this is the "tag" that
// TypeScript uses to narrow the union in if/switch statements.
export type GalleryImage = {
  kind: "image"; // Literal type — not just any string, specifically "image"
  src: string;
  alt: string;
  caption?: string; // `?` means optional — the property may be absent or undefined
};

/** YouTube: URL in the form https://www.youtube.com/embed/VIDEO_ID */
export type GalleryYouTube = {
  kind: "youtube";
  embedUrl: string;
  title: string;
  caption?: string;
};

/** Local file, e.g. /video/trening.mp4 */
export type GalleryVideoFile = {
  kind: "videoFile";
  src: string;
  poster?: string;
  title: string;
  caption?: string;
};

// Union type — a GalleryItem is ONE of these three types. The `kind` field
// acts as a discriminant that tells TypeScript which variant you're dealing with.
export type GalleryItem = GalleryImage | GalleryYouTube | GalleryVideoFile;

export type GalleryAlbum = {
  /** Unique URL segment, e.g. "natjecanja-zagreb-2025" */
  slug: string;
  title: string;
  /** Short description below the title on the album list and album page */
  description: string;
  /**
   * Album cover on the list. If missing, the first image in `items` is used.
   */
  coverSrc?: string;
  coverAlt?: string;
  items: GalleryItem[];
};

export function getGalleryAlbumBySlug(slug: string, albums: GalleryAlbum[]): GalleryAlbum | undefined {
  return albums.find((a) => a.slug === slug);
}

/** First image in the album or explicit cover — for cards and OG images. */
export function getAlbumCover(album: GalleryAlbum): { src: string; alt: string } {
  if (album.coverSrc && album.coverAlt) {
    return { src: album.coverSrc, alt: album.coverAlt };
  }
  // TYPE PREDICATE: `(i): i is GalleryImage => ...` is a user-defined type guard.
  // It tells TypeScript that when the callback returns true, `i` is a GalleryImage.
  // Without this, `first` would just be `GalleryItem | undefined`.
  const first = album.items.find((i): i is GalleryImage => i.kind === "image");
  if (first) {
    return { src: first.src, alt: first.alt };
  }
  return { src: "/images/klub-naslovna.png", alt: album.title };
}

// CONCEPT: Type narrowing in action — checking `item.kind` in an if/else
// lets TypeScript know the exact type within each branch.
export function countAlbumMedia(album: GalleryAlbum): {
  images: number;
  videos: number;
} {
  let images = 0;
  let videos = 0;
  for (const item of album.items) {
    // After this check, TS knows `item` is GalleryImage inside the if-block
    if (item.kind === "image") images += 1;
    else videos += 1; // TS narrows to GalleryYouTube | GalleryVideoFile here
  }
  return { images, videos };
}
