/**
 * CONCEPT: Constants File Pattern — Separating Asset Paths from Components
 *
 * Instead of embedding image URLs directly in JSX components, we keep them
 * in a dedicated config file. This provides:
 * - Single place to update when images change (swap Unsplash → local)
 * - Components remain generic and reusable
 * - Easy to see all external dependencies (Unsplash URLs) at a glance
 * - `as const` makes the entire object deeply readonly and literal-typed
 *
 * Hero and additional local images in /public/images/.
 * The rest are temporary Unsplash images — feel free to replace them.
 * @see https://unsplash.com/license
 */
export const placeholders = {
  hero: "/images/klub-naslovna.png",
  /** Programs page + homepage cards */
  programs: {
    djeca: "/galerija/trening-os-brda-dvorana.png",
    odrasli: "/galerija/treneri-frane-gringo-neno.png",
  },
  /** Homepage: the "Training, discipline, community" block uses `homeGalleryStripPool` in `home-gallery-strip.ts`. */
  about:
    "https://images.unsplash.com/photo-1476480862861-fa369fcb6019?auto=format&fit=crop&w=2000&q=85",
  instructors:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=2000&q=85",
  contact:
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=85",
} as const;
