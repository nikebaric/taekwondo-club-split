import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryAlbumStack } from "@/components/gallery-album-stack";
import { galleryAlbumHeroGradientClass, galleryAlbumHeroStripClass } from "@/components/gallery-item";
import { type GalleryAlbum, getAlbumCover, getGalleryAlbumBySlug } from "@/config/gallery";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { galleryMediaLabel } from "@/i18n/gallery-media-label";
import { parseLocale } from "@/i18n/locale";
import { localizedPath } from "@/i18n/routing";
import { localizeGalleryAlbum } from "@/lib/localize-club-data";
import { readGalleryAlbums } from "@/lib/gallery-store";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const albums = await readGalleryAlbums();
  return locales.flatMap((locale) => albums.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = parseLocale(raw);
  const t = getDictionary(locale);
  const albums = await readGalleryAlbums();
  const albumRaw = getGalleryAlbumBySlug(slug, albums);
  if (!albumRaw) return { title: t.gallery.album };
  const album = localizeGalleryAlbum(albumRaw, locale);
  const cover = getAlbumCover(album);
  return {
    title: album.title,
    description: `${album.description} — ${t.meta.siteName}, ${t.meta.city}.`,
    openGraph: {
      title: `${album.title} | ${t.meta.siteName}`,
      description: album.description,
      images: [{ url: cover.src, alt: cover.alt }],
    },
  };
}

export default async function GalleryAlbumPage({ params }: Props) {
  const { slug, locale: raw } = await params;
  const locale = parseLocale(raw);
  const t = getDictionary(locale);
  const albums = await readGalleryAlbums();
  const albumRaw = getGalleryAlbumBySlug(slug, albums);
  if (!albumRaw) notFound();
  const album = localizeGalleryAlbum(albumRaw, locale);

  const cover = getAlbumCover(album);

  return (
    <div>
      <div className={galleryAlbumHeroStripClass}>
        <Image src={cover.src} alt={cover.alt} fill className="object-cover object-center" sizes="100vw" priority />
        <div className={galleryAlbumHeroGradientClass} />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-8 sm:px-6">
          <nav className="absolute left-4 top-6 text-sm sm:left-6">
            <Link
              href={localizedPath("/galerija", locale)}
              className="font-medium text-[var(--brand-gold)] underline-offset-4 hover:underline"
            >
              {t.gallery.backToGallery}
            </Link>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-gold)]">{t.gallery.album}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-white sm:text-4xl">
            {album.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-300">{album.description}</p>
          {album.attachments?.length ? (
            <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {album.attachments.map((a) => (
                <li key={a.href}>
                  <a
                    href={a.href}
                    download
                    className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    {a.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2 text-xs text-zinc-500">{galleryMediaLabel(album, locale, t)}</p>
        </div>
      </div>
      <section className="py-14 sm:py-20">
        <GalleryAlbumStack items={album.items} />
      </section>
    </div>
  );
}
