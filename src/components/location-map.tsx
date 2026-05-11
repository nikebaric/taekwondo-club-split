/**
 * LocationMap — embeds a Google Maps iframe showing the club's training location.
 *
 * KEY CONCEPTS:
 * - **Server Component:** No "use client" — the iframe HTML is rendered on the server.
 *   Iframes don't need React interactivity; the browser handles them natively.
 * - **iframe embed pattern:** Third-party content (maps, videos) is safely embedded
 *   via iframes. `loading="lazy"` defers loading until the user scrolls near it.
 * - **Default parameter values:** `fullBleed = false` in the destructuring means
 *   callers can omit the prop and get the default. TypeScript's `?` marks it optional.
 * - **Responsive aspect ratio:** Tailwind's `aspect-[4/3]` and `aspect-video`
 *   maintain proportions without explicit height, adapting to container width.
 */
import { site } from "@/config/site";

type Props = {
  fullBleed?: boolean;  // optional with default — see destructuring below
  className?: string;
};

// Default parameter values: if `fullBleed` isn't passed, it defaults to `false`.
// This is a JavaScript feature — TypeScript's `?` just marks it as optional in the type.
export function LocationMap({ fullBleed = false, className = "" }: Props) {
  const shell = fullBleed
    ? `relative isolate min-h-[min(52vh,480px)] w-full overflow-hidden border-y border-slate-200 bg-[var(--surface)] shadow-inner ${className}`
    : `relative isolate aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-inner sm:aspect-video ${className}`;

  const iframeClass = fullBleed
    ? "relative z-0 h-[min(52vh,480px)] min-h-[280px] w-full border-0 sm:min-h-[360px]"
    : "relative z-0 h-full min-h-[260px] w-full border-0 sm:min-h-[300px]";

  return (
    <div className={shell}>
      {/* `loading="lazy"` tells the browser to only load the iframe when it's
          near the viewport — saves bandwidth on pages where the map is below the fold.
          `referrerPolicy` controls what URL info is sent to Google's servers. */}
      <iframe
        title={`Lokacija — ${site.address.venueName}, ${site.address.street}, ${site.city}`}
        src={site.mapsEmbedUrl}
        className={iframeClass}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
