import Image from "next/image";
import { homeGalleryStripPool } from "@/config/home-gallery-strip";

function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function staggerClass(index: number): string {
  return index === 1 || index === 3 ? "lg:mt-8" : "";
}

/** Četiri slike odabrane na poslužitelju — bez čekanja na klijentski JS (pouzdano na mobitelu). */
export function HomeClubPhotoStrip() {
  const pool = homeGalleryStripPool;
  const count = Math.min(4, pool.length);
  const photos = shuffle(pool).slice(0, count);

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {photos.map((item, i) => (
        <div
          key={`${item.src}-${i}`}
          className={`relative aspect-[4/5] w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)] sm:aspect-[3/4] ${staggerClass(i)}`}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
            className="object-cover transition duration-500 hover:scale-[1.03]"
            priority={i < 2}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80" />
        </div>
      ))}
    </div>
  );
}
