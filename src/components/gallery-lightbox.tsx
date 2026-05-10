"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";
import type { GalleryItem } from "@/config/gallery";

export function LightboxSlide({ item }: { item: GalleryItem }) {
  if (item.kind === "image") {
    return (
      <div className="relative h-[min(88vh,920px)] w-full min-w-0 max-w-[min(96vw,1400px)]">
        <Image
          src={item.src}
          alt={item.alt}
          fill
          className="object-contain"
          sizes="96vw"
          priority
        />
      </div>
    );
  }

  if (item.kind === "youtube") {
    return (
      <div className="aspect-video w-full max-w-5xl bg-black">
        <iframe
          src={item.embedUrl}
          title={item.title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <div className="flex max-h-[88vh] w-full max-w-5xl items-center justify-center bg-black">
      <video className="max-h-[88vh] w-full object-contain" controls playsInline preload="metadata" poster={item.poster}>
        <source src={item.src} type="video/mp4" />
        Vaš preglednik ne prikazuje video.
      </video>
    </div>
  );
}

export function lightboxCaption(item: GalleryItem): string | null {
  if (item.kind === "image") return item.caption ?? item.alt;
  if (item.kind === "youtube") return item.caption ? `${item.title} — ${item.caption}` : item.title;
  return item.caption ? `${item.title} — ${item.caption}` : item.title;
}

type GalleryLightboxProps = {
  open: boolean;
  onClose: () => void;
  items: readonly GalleryItem[];
  index: number;
  onIndexChange: (index: number) => void;
};

export function GalleryLightbox({ open, onClose, items, index, onIndexChange }: GalleryLightboxProps) {
  const len = items.length;
  const current = len > 0 ? items[index] : null;
  const caption = current ? lightboxCaption(current) : null;

  const go = useCallback(
    (delta: number) => {
      if (len === 0) return;
      onIndexChange((index + delta + len) % len);
    },
    [len, index, onIndexChange],
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, go, onClose]);

  if (!open || !current) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Prikaz u punoj veličini">
      <button
        type="button"
        className="absolute inset-0 bg-black/93 backdrop-blur-[2px]"
        aria-label="Zatvori (klik na pozadinu)"
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 pt-14 sm:p-8 sm:pt-16">
        <div className="pointer-events-auto relative flex w-full max-w-[1400px] flex-col items-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-2 right-0 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white shadow-lg transition hover:bg-black/80 sm:right-2"
            aria-label="Zatvori"
          >
            ×
          </button>

          {len > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/55 text-2xl text-white shadow-lg transition hover:bg-black/75 sm:-left-2 sm:h-14 sm:w-14 md:-left-4"
                aria-label="Prethodna"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/55 text-2xl text-white shadow-lg transition hover:bg-black/75 sm:-right-2 sm:h-14 sm:w-14 md:-right-4"
                aria-label="Sljedeća"
              >
                ›
              </button>
            </>
          ) : null}

          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <LightboxSlide item={current} />
            {caption ? (
              <p className="mt-4 max-w-3xl px-2 text-center text-sm leading-relaxed text-zinc-400">{caption}</p>
            ) : null}
            {len > 1 ? (
              <p className="mt-3 text-center text-xs tabular-nums text-zinc-600">
                {index + 1} / {len}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
