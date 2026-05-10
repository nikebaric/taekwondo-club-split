import type { LocalNewsPost } from "@/lib/local-news-types";

export function parseCoverImageIndex(form: FormData, galleryLen: number): number {
  if (galleryLen <= 0) return 0;
  const raw = form.get("cover_image_index");
  const n = raw != null ? parseInt(String(raw), 10) : 0;
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(0, n), galleryLen - 1);
}

/** Naslovna ispod naslova — eksplicitno ili prva u listi. */
export function resolveHeroCoverSrc(raw: LocalNewsPost, galleryImages: string[]): string | null {
  if (galleryImages.length === 0) return null;
  const c = raw.coverImageSrc?.trim();
  if (c && galleryImages.includes(c)) return c;
  return galleryImages[0]!;
}
