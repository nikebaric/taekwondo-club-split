import Image from "next/image";
import Link from "next/link";
import type { GalleryAlbum } from "@/config/gallery";
import { countAlbumMedia, getAlbumCover } from "@/config/gallery";

function mediaLabel(album: GalleryAlbum): string {
  const { images, videos } = countAlbumMedia(album);
  const parts: string[] = [];
  if (images === 1) parts.push("1 fotografija");
  else if (images >= 2 && images <= 4) parts.push(`${images} fotografije`);
  else if (images > 0) parts.push(`${images} fotografija`);

  if (videos === 1) parts.push("1 video");
  else if (videos > 1) parts.push(`${videos} video zapisa`);

  return parts.join(" · ") || "Album";
}

export function GalleryAlbumCard({ album }: { album: GalleryAlbum }) {
  const cover = getAlbumCover(album);

  return (
    <Link
      href={`/galerija/${album.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/35 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[16/10] w-full bg-black/40">
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
            {mediaLabel(album)}
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
