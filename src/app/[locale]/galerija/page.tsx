import type { Metadata } from "next";
import { GalleryAlbumCard } from "@/components/gallery-album-card";
import { SectionHeading } from "@/components/section-heading";
import { localizeGalleryAlbum } from "@/lib/localize-club-data";
import { readGalleryAlbums } from "@/lib/gallery-store";
import { getPageLocale } from "@/i18n/locale";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getPageLocale(params);
  return {
    title: t.gallery.title,
    description: `${t.gallery.metaDescription} — ${t.meta.siteName}, ${t.meta.city}.`,
  };
}

export default async function GalleryPage({ params }: Props) {
  const { locale, t } = await getPageLocale(params);
  const galleryAlbums = (await readGalleryAlbums()).map((a) => localizeGalleryAlbum(a, locale));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading eyebrow={t.gallery.eyebrow} title={t.gallery.title} />
      <ul className="mt-14 grid list-none gap-8 sm:grid-cols-2 lg:gap-10">
        {galleryAlbums.map((album) => (
          <li key={album.slug}>
            <GalleryAlbumCard album={album} locale={locale} t={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}
