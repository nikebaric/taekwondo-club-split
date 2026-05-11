/**
 * GalleryMedia — renders a gallery item as image, YouTube embed, or video file.
 *
 * KEY CONCEPTS:
 * - **Polymorphic component pattern:** A single component that renders different
 *   content based on `item.kind`. TypeScript discriminated unions ensure each branch
 *   has access to the correct fields (e.g., `item.src` for images, `item.embedUrl`
 *   for YouTube). The compiler catches errors if you access the wrong field.
 * - **Discriminated union:** `GalleryItem` is a union type where each variant has a
 *   `kind` field ("image" | "youtube" | "video-file"). Checking `item.kind` narrows
 *   the type — TypeScript knows exactly which properties are available in each branch.
 * - **Layout variants via props:** The `slideLayout` prop changes sizing/borders
 *   without duplicating the component. This is the "variant" pattern — one component
 *   with different visual modes controlled by a prop.
 * - **Exported constants:** `galleryAlbumSlideBannerClass` etc. are shared with other
 *   files that need consistent sizing (e.g., album page hero sections).
 */
import Image from "next/image";
import type { GalleryItem } from "@/config/gallery";

/** Same height as the hero banner on the album page (`/galerija/[slug]`). */
export const galleryAlbumSlideBannerClass = "h-[38vh] min-h-[220px]";

/**
 * Isti „okvir“ kao naslovna slika albuma: visina stripa, overflow, donji rub.
 * Image + gradient (`absolute inset-0`) share exactly this rectangle.
 */
export const galleryAlbumHeroStripClass = `relative w-full ${galleryAlbumSlideBannerClass} overflow-hidden border-b border-slate-200/90`;

/** Same overlay as the hero — `absolute inset-0`, same dimensions as the parent (`relative` strip). */
export const galleryAlbumHeroGradientClass =
  "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent";

type Props = {
  item: GalleryItem;
  /**
   * `albumBanner` — same aspect ratio as the album cover image (38vh, min 220px).
   * `albumThumb` — reduced tile in the grid (square, borders).
   * `card` — classic 4:3 card (default).
   */
  slideLayout?: "card" | "albumBanner" | "albumThumb";
};

function figureShell(slideLayout: Props["slideLayout"]): string {
  if (slideLayout === "albumBanner") {
    // No extra borders around the strip — size equals strip (`galleryAlbumHeroStripClass` + bg).
    return "group overflow-hidden rounded-none border-0 bg-[var(--surface)] shadow-none";
  }
  if (slideLayout === "albumThumb") {
    return "group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-[var(--surface)] shadow-sm";
  }
  return "group overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-sm";
}

function imageSizes(slideLayout: Props["slideLayout"]): string {
  if (slideLayout === "albumThumb") {
    return "(max-width: 640px) 45vw, (max-width: 1024px) 31vw, 23vw";
  }
  return "100vw";
}

// The function checks `item.kind` to decide what to render. TypeScript's
// type narrowing means inside `if (item.kind === "image")`, `item` is
// automatically typed as the image variant with `src`, `alt`, `caption` etc.
export function GalleryMedia({ item, slideLayout = "card" }: Props) {
  if (item.kind === "image") {
    const mediaFrame =
      slideLayout === "albumBanner"
        ? `${galleryAlbumHeroStripClass} bg-black/30`
        : slideLayout === "albumThumb"
          ? "relative aspect-square w-full shrink-0 bg-black/30"
          : "relative aspect-[4/3] w-full bg-black/30";

    const captionClass =
      slideLayout === "albumThumb"
        ? "border-t border-slate-200 px-2 py-2 text-center text-xs leading-snug text-[var(--muted)] line-clamp-2"
        : "border-t border-slate-200 px-4 py-3 text-sm text-[var(--muted)]";

    return (
      <figure className={figureShell(slideLayout)}>
        <div className={mediaFrame}>
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes={imageSizes(slideLayout)}
          />
          {slideLayout === "albumBanner" ? (
            <div className={galleryAlbumHeroGradientClass} aria-hidden />
          ) : null}
        </div>
        {(item.caption || item.alt) && (
          <figcaption className={captionClass}>{item.caption ?? item.alt}</figcaption>
        )}
      </figure>
    );
  }

  if (item.kind === "youtube") {
    const frame =
      slideLayout === "albumBanner"
        ? `${galleryAlbumHeroStripClass} bg-black`
        : "relative aspect-video w-full bg-black";

    const ytCaptionClass =
      slideLayout === "albumThumb"
        ? "border-t border-slate-200 px-2 py-2 text-xs text-[var(--muted)] line-clamp-2"
        : "border-t border-slate-200 px-4 py-3 text-sm text-[var(--muted)]";

    return (
      <figure className={figureShell(slideLayout)}>
        <div className={frame}>
          {slideLayout === "albumBanner" ? (
            <div className={galleryAlbumHeroGradientClass} aria-hidden />
          ) : null}
          <iframe
            src={item.embedUrl}
            title={item.title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        {(item.caption || item.title) && (
          <figcaption className={ytCaptionClass}>
            <span className="font-medium text-slate-800">{item.title}</span>
            {item.caption ? <span className="mt-1 block">{item.caption}</span> : null}
          </figcaption>
        )}
      </figure>
    );
  }

  const videoFrame =
    slideLayout === "albumBanner"
      ? `${galleryAlbumHeroStripClass} bg-black`
      : "relative aspect-video w-full bg-black";

  const fileCaptionClass =
    slideLayout === "albumThumb"
      ? "border-t border-slate-200 px-2 py-2 text-xs text-[var(--muted)] line-clamp-2"
      : "border-t border-slate-200 px-4 py-3 text-sm text-[var(--muted)]";

  return (
    <figure className={figureShell(slideLayout)}>
      <div className={videoFrame}>
        {slideLayout === "albumBanner" ? (
          <div className={galleryAlbumHeroGradientClass} aria-hidden />
        ) : null}
        <video
          className={
            slideLayout === "albumBanner"
              ? "absolute inset-0 z-[1] h-full w-full object-cover"
              : "absolute inset-0 h-full w-full object-cover"
          }
          controls
          playsInline
          preload="metadata"
          poster={item.poster}
        >
          <source src={item.src} type={item.src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
          Vaš preglednik ne prikazuje video.
        </video>
      </div>
      {(item.caption || item.title) && (
        <figcaption className={fileCaptionClass}>
          <span className="font-medium text-slate-800">{item.title}</span>
          {item.caption ? <span className="mt-1 block">{item.caption}</span> : null}
        </figcaption>
      )}
    </figure>
  );
}
