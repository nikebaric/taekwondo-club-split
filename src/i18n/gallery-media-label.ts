import type { GalleryAlbum } from "@/config/gallery";
import { countAlbumMedia } from "@/config/gallery";
import type { Dictionary } from "@/i18n/dictionaries/hr";
import type { Locale } from "@/i18n/config";

export function galleryMediaLabel(album: GalleryAlbum, locale: Locale, t: Dictionary): string {
  const { images, videos } = countAlbumMedia(album);
  const parts: string[] = [];

  if (locale === "en") {
    if (images === 1) parts.push("1 photo");
    else if (images > 0) parts.push(`${images} photos`);
    if (videos === 1) parts.push("1 video");
    else if (videos > 1) parts.push(`${videos} videos`);
  } else {
    if (images === 1) parts.push("1 fotografija");
    else if (images >= 2 && images <= 4) parts.push(`${images} fotografije`);
    else if (images > 0) parts.push(`${images} fotografija`);
    if (videos === 1) parts.push("1 video");
    else if (videos > 1) parts.push(`${videos} video zapisa`);
  }

  return parts.join(" · ") || t.gallery.album;
}
