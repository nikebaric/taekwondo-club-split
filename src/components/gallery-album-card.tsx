/**
 * GalleryAlbumCard — a card component linking to an album detail page.
 *
 * KEY CONCEPTS:
 * - **Server Component card pattern:** No "use client" — this is purely presentational.
 *   The card renders static HTML with a <Link> for navigation. No JavaScript needed.
 * - **Next.js Image with `fill` prop:** Instead of fixed width/height, `fill` makes
 *   the image fill its parent container. The parent needs `position: relative` and
 *   defined dimensions (here via `aspect-[16/10]`). The `sizes` prop tells the browser
 *   which image size to load at each viewport width — critical for performance.
 * - **Composition:** Helper functions (mediaLabel, getAlbumCover) keep the component
 *   focused on rendering while data logic lives separately.
 */
import Image from "next/image";
import Link from "next/link";
import type { GalleryAlbum } from "@/config/gallery";
import { getAlbumCover } from "@/config/gallery";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/hr";
import { galleryMediaLabel } from "@/i18n/gallery-media-label";
import { localizedPath } from "@/i18n/routing";

export function GalleryAlbumCard({
  album,
  locale,
  t,
}: {
  album: GalleryAlbum;
  locale: Locale;
  t: Dictionary;
}) {
  const cover = getAlbumCover(album);

  return (
    <Link
      href={localizedPath(`/galerija/${album.slug}`, locale)}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/35 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[16/10] w-full bg-black/40">
        {/* `fill` makes the image fill its relatively-positioned parent.
            `sizes` tells the browser: use 100vw on mobile, 50vw on tablet, 33vw on desktop.
            This prevents loading a 1400px image on a 375px phone screen. */}
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--brand-gold)]">
            {galleryMediaLabel(album, locale, t)}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl tracking-[0.04em] text-white sm:text-2xl">
            {album.title}
          </h2>
        </div>
      </div>
      <p className="border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-[var(--muted)] sm:px-5 sm:py-4">
        {album.description}
      </p>
    </Link>
  );
}
