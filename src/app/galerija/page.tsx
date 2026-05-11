/**
 * src/app/galerija/page.tsx — Gallery listing page (route: /galerija)
 *
 * KEY CONCEPTS:
 * - Async Server Component that fetches data (album list) at request time.
 * - Each album links to a dynamic route `/galerija/[slug]` — the same
 *   pattern as the news articles, applied to a different content type.
 * - Composition: the page delegates album card rendering to a dedicated
 *   `<GalleryAlbumCard>` component, keeping this file focused on layout.
 */
import type { Metadata } from "next";
import { GalleryAlbumCard } from "@/components/gallery-album-card";
import { SectionHeading } from "@/components/section-heading";
import { readGalleryAlbums } from "@/lib/gallery-store";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Galerija",
  description: `Albumi fotografija — ${site.name}, ${site.city}.`,
};

// Server Component: data fetched on the server, HTML streamed to client
export default async function GalerijaPage() {
  const galleryAlbums = await readGalleryAlbums();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading eyebrow="Mediji" title="Galerija" />

      <ul className="mt-14 grid list-none gap-8 sm:grid-cols-2 lg:gap-10">
        {galleryAlbums.map((album) => (
          <li key={album.slug}>
            <GalleryAlbumCard album={album} />
          </li>
        ))}
      </ul>
    </div>
  );
}
