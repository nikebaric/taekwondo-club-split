"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { PORTAL_BRAND_NAME } from "@/config/news-portal";
import {
  portalBorbeniGalleryImages,
  portalBorbeniHero,
  portalBorbeniLightboxImages,
} from "@/config/portal-borbeni-gallery";
import type { Locale } from "@/i18n/config";

function openLightboxKey(e: KeyboardEvent, onOpen: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    onOpen();
  }
}

const lightboxFocusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";

/** Hero + mreža fotografija na stranici portala — klik otvara lightbox kao u galeriji. */
export function PortalBorbeniShowcase({
  locale,
  subtitle,
}: {
  locale: Locale;
  subtitle: string;
}) {
  void locale;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="space-y-10">
        <figure
          className={`group relative mx-auto aspect-[21/9] min-h-[200px] w-full max-w-6xl max-h-[min(52vh,520px)] cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 shadow-[var(--shadow-card)] ${lightboxFocusRing}`}
          role="button"
          tabIndex={0}
          aria-label="Otvori sliku u punoj veličini"
          onClick={() => openAt(0)}
          onKeyDown={(e) => openLightboxKey(e, () => openAt(0))}
        >
          <Image
            src={portalBorbeniHero.src}
            alt={portalBorbeniHero.alt}
            fill
            className="object-cover object-[center_25%] transition duration-300 group-hover:scale-[1.02]"
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-slate-950/10"
            aria-hidden
          />
          <figcaption className="pointer-events-none absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.1em] text-white sm:text-2xl md:text-3xl">
              {PORTAL_BRAND_NAME}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">{subtitle}</p>
          </figcaption>
        </figure>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {portalBorbeniGalleryImages.map((img, i) => (
            <figure
              key={img.src}
              className={`group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm ${lightboxFocusRing}`}
              role="button"
              tabIndex={0}
              aria-label="Otvori sliku u punoj veličini"
              onClick={() => openAt(i + 1)}
              onKeyDown={(e) => openLightboxKey(e, () => openAt(i + 1))}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </figure>
          ))}
        </div>
      </div>

      <GalleryLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={portalBorbeniLightboxImages}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
