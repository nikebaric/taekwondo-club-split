/**
 * Tipovi i pomoćne funkcije za galeriju. Popis albuma je u `data/gallery-albums.json`
 * (uređivanje u administraciji za odabrani e-mail, ili ručno u JSON-u).
 * Statičke slike u `public/galerija/`; novi uploadi u `public/uploads/gallery/`.
 */

export type GalleryImage = {
  kind: "image";
  src: string;
  alt: string;
  caption?: string;
};

/** YouTube: URL oblika https://www.youtube.com/embed/VIDEO_ID */
export type GalleryYouTube = {
  kind: "youtube";
  embedUrl: string;
  title: string;
  caption?: string;
};

/** Lokalna datoteka, npr. /video/trening.mp4 */
export type GalleryVideoFile = {
  kind: "videoFile";
  src: string;
  poster?: string;
  title: string;
  caption?: string;
};

export type GalleryItem = GalleryImage | GalleryYouTube | GalleryVideoFile;

export type GalleryAlbum = {
  /** Jedinstveni dio URL-a, npr. "natjecanja-zagreb-2025" */
  slug: string;
  title: string;
  /** Kratki opis ispod naslova na popisu albuma i na stranici albuma */
  description: string;
  /**
   * Naslovnica albuma na popisu. Ako nedostaje, uzima se prva slika u `items`.
   */
  coverSrc?: string;
  coverAlt?: string;
  items: GalleryItem[];
};

export function getGalleryAlbumBySlug(slug: string, albums: GalleryAlbum[]): GalleryAlbum | undefined {
  return albums.find((a) => a.slug === slug);
}

/** Prva slika u albumu ili eksplicitna naslovnica — za kartice i OG slike. */
export function getAlbumCover(album: GalleryAlbum): { src: string; alt: string } {
  if (album.coverSrc && album.coverAlt) {
    return { src: album.coverSrc, alt: album.coverAlt };
  }
  const first = album.items.find((i): i is GalleryImage => i.kind === "image");
  if (first) {
    return { src: first.src, alt: first.alt };
  }
  return { src: "/images/klub-naslovna.png", alt: album.title };
}

export function countAlbumMedia(album: GalleryAlbum): {
  images: number;
  videos: number;
} {
  let images = 0;
  let videos = 0;
  for (const item of album.items) {
    if (item.kind === "image") images += 1;
    else videos += 1;
  }
  return { images, videos };
}
