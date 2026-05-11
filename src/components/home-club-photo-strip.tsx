/**
 * HomeClubPhotoStrip — displays a randomized strip of 4 club photos on the homepage.
 *
 * KEY CONCEPTS:
 * - **Server Component with randomization:** The `shuffle()` runs on the server at
 *   render time, so each page load shows different photos without any client JS.
 *   In Next.js, Server Components re-execute on each request (with dynamic rendering)
 *   or at build time (with static rendering), depending on the route configuration.
 * - **Next.js Image optimization:** The `<Image>` component automatically generates
 *   responsive image variants (WebP/AVIF), sets width/height to prevent layout shift,
 *   and lazy-loads by default. `priority={i < 2}` eagerly loads the first two images
 *   since they're likely visible above the fold.
 * - **TypeScript generics:** `shuffle<T>` works with any array type — the `<T>` is a
 *   type parameter that TypeScript infers from the argument. This makes the function
 *   reusable for any data type without losing type safety.
 */
import Image from "next/image";
import { homeGalleryStripPool } from "@/config/home-gallery-strip";

// Generic function: <T> is a type parameter — TypeScript infers it from the argument.
// `readonly T[]` accepts both mutable and readonly arrays as input.
function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];  // spread into a new array to avoid mutating the original
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];  // destructuring swap — a concise JS idiom
  }
  return a;
}

function staggerClass(index: number): string {
  return index === 1 || index === 3 ? "lg:mt-8" : "";
}

/** Four images selected on the server — no waiting for client-side JS (reliable on mobile). */
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
          {/* `fill` makes the image fill its parent (needs `relative` on parent).
              `priority={i < 2}` uses a dynamic expression: true for first 2 images
              (likely above the fold), false for the rest (lazy-loaded). */}
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
