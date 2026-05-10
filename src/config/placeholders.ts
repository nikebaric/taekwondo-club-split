/**
 * Hero i dodatne lokalne slike u /public/images/.
 * Ostatak su privremeni Unsplashovi — slobodno zamijenite.
 * @see https://unsplash.com/license
 */
export const placeholders = {
  hero: "/images/klub-naslovna.png",
  /** Stranica Programi + kartice na naslovnici */
  programs: {
    djeca: "/galerija/trening-os-brda-dvorana.png",
    odrasli: "/galerija/treneri-frane-gringo-neno.png",
  },
  /** Naslovnica: blok „Trening, disciplina, zajednica“ koristi `homeGalleryStripPool` u `home-gallery-strip.ts`. */
  about:
    "https://images.unsplash.com/photo-1476480862861-fa369fcb6019?auto=format&fit=crop&w=2000&q=85",
  instructors:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=2000&q=85",
  contact:
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=85",
} as const;
