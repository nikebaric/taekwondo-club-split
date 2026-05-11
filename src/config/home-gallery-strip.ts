/**
 * CONCEPT: Data Pool Pattern for Randomized Content
 *
 * This file provides a pool (array) of photos from which the homepage randomly
 * selects a subset on each page load. The pattern:
 * - Define more items than needed (12 photos here, only 4 shown)
 * - At render time, randomly pick N items from the pool
 * - Each page load feels fresh without requiring a database or CMS
 *
 * TypeScript concepts:
 * - Simple type alias (`HomeStripPhoto`) for the item shape
 * - `readonly T[]` annotation prevents accidental array mutation
 * - Separating the data pool from the randomization logic (which lives in a component)
 *
 * Bazen fotografija za blok \u201ETrening, disciplina, zajednica\u201C na naslovnici.
 * Pri u\u010Ditavanju stranice nasumi\u010Dno se biraju 4 slike (bez promotivnih letaka i grafike).
 */
export type HomeStripPhoto = {
  src: string;
  alt: string;
};

// `readonly HomeStripPhoto[]` \u2014 the array reference AND its contents are immutable.
// Components can read from this pool but never modify it.
export const homeGalleryStripPool: readonly HomeStripPhoto[] = [
  {
    src: "/galerija/grupa-clanovi-dvorana.png",
    alt: "Skupina \u010Dlanova u doboku u \u0161kolskoj dvorani",
  },
  {
    src: "/galerija/trening-os-brda-dvorana.png",
    alt: "Trening u dvorani Osnovne \u0161kole BRDA",
  },
  {
    src: "/galerija/treneri-frane-gringo-neno.png",
    alt: "Treneri kluba u doboku na tatamiju",
  },
  {
    src: "/galerija/treneri-janez-i-nenad.png",
    alt: "Treneri u stavu u dvorani",
  },
  {
    src: "/galerija/trener-nenad-bulovic-vi-dan.png",
    alt: "Glavni trener Nenad Bulovi\u0107, VI. DAN ITF",
  },
  {
    src: "/galerija/trener-neno-kod-lutke-2023.png",
    alt: "Trener uz lutku za trening u dvorani",
  },
  {
    src: "/galerija/trener-neno-i-polaznik-leo-1.png",
    alt: "Trener i polaznik na tatamiju",
  },
  {
    src: "/galerija/trener-neno-i-polaznik-leo-3.png",
    alt: "Trener i polaznik na treningu",
  },
  {
    src: "/galerija/arhiva-demonstracija-yop-chagi.png",
    alt: "Demonstracija tehnike iz klupske arhive",
  },
  {
    src: "/galerija/arhiva-sparring.png",
    alt: "Sparing iz klupske arhive",
  },
  {
    src: "/galerija/trening-niko-sparring-stav.png",
    alt: "Polaznik u sparing stavu u dvorani",
  },
  {
    src: "/galerija/treneri-neno-mirko.png",
    alt: "Dva trenera u doboku u dvorani",
  },
];
