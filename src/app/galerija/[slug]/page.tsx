/**
 * src/app/galerija/[slug]/page.tsx — Single gallery album (route: /galerija/:slug)
 *
 * KEY CONCEPTS:
 * - DYNAMIC ROUTE with [slug] — same pattern as /news/[slug].
 * - `generateStaticParams` — tells Next.js which slug values exist at
 *   BUILD time, so it can statically generate (SSG) a page for each album.
 *   At build, Next.js calls this function, gets all slugs, then calls the
 *   page component once per slug. The result is a set of static HTML files
 *   that are served instantly — no server rendering at request time.
 *   This is ideal for content that doesn't change on every request.
 * - `generateMetadata` — dynamically sets <title>, description, and
 *   og:image per album, using the same params as the page component.
 * - `notFound()` — returns the 404 page if the slug doesn't match an album.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryAlbumStack } from "@/components/gallery-album-stack";
import { galleryAlbumHeroGradientClass, galleryAlbumHeroStripClass } from "@/components/gallery-item";
import {
  type GalleryAlbum,
  countAlbumMedia,
  getAlbumCover,
  getGalleryAlbumBySlug,
} from "@/config/gallery";
import { readGalleryAlbums } from "@/lib/gallery-store";
import { site } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

// generateStaticParams enables Static Site Generation (SSG) for dynamic
// routes. Next.js calls this at build time and pre-renders a page for
// each returned object. If a user visits a slug NOT in this list and
// `dynamicParams` is true (default), Next.js renders on demand and caches it.
export async function generateStaticParams() {
  const albums = await readGalleryAlbums();
  return albums.map((a) => ({ slug: a.slug }));
}

// Per-album metadata for SEO and social sharing — same concept as in
// the news article page but applied to gallery albums.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const albums = await readGalleryAlbums();
  const album = getGalleryAlbumBySlug(slug, albums);
  if (!album) {
    return { title: "Album" };
  }
  const cover = getAlbumCover(album);
  return {
    title: album.title,
    description: `${album.description} — ${site.name}, ${site.city}.`,
    openGraph: {
      title: `${album.title} | ${site.name}`,
      description: album.description,
      images: [{ url: cover.src, alt: cover.alt }],
    },
  };
}

function mediaSummary(album: GalleryAlbum): string {
  const { images, videos } = countAlbumMedia(album);
  const parts: string[] = [];
  if (images === 1) parts.push("1 fotografija");
  else if (images >= 2 && images <= 4) parts.push(`${images} fotografije`);
  else if (images > 0) parts.push(`${images} fotografija`);
  if (videos === 1) parts.push("1 video zapis");
  else if (videos > 1) parts.push(`${videos} video zapisa`);
  return parts.join(" · ");
}

export default async function GalleryAlbumPage({ params }: Props) {
  const { slug } = await params;
  const albums = await readGalleryAlbums();
  const album = getGalleryAlbumBySlug(slug, albums);
  if (!album) notFound();

  const cover = getAlbumCover(album);

  return (
    <div>
      <div className={galleryAlbumHeroStripClass}>
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className={galleryAlbumHeroGradientClass} />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-8 sm:px-6">
          <nav className="absolute left-4 top-6 text-sm sm:left-6">
            <Link
              href="/galerija"
              className="font-medium text-[var(--brand-gold)] underline-offset-4 hover:underline"
            >
              ← Galerija
            </Link>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-gold)]">
            Album
          </p>
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
          <p className="mt-2 text-xs text-zinc-500">{mediaSummary(album)}</p>
        </div>
      </div>

      <section className="py-14 sm:py-20">
        <GalleryAlbumStack items={album.items} />
      </section>
    </div>
  );
}
