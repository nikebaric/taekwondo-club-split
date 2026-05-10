/**
 * Bazen fotografija za blok „Trening, disciplina, zajednica“ na naslovnici.
 * Pri učitavanju stranice nasumično se biraju 4 slike (bez promotivnih letaka i grafike).
 */
export type HomeStripPhoto = {
  src: string;
  alt: string;
};

export const homeGalleryStripPool: readonly HomeStripPhoto[] = [
  {
    src: "/galerija/grupa-clanovi-dvorana.png",
    alt: "Skupina članova u doboku u školskoj dvorani",
  },
  {
    src: "/galerija/trening-os-brda-dvorana.png",
    alt: "Trening u dvorani Osnovne škole BRDA",
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
    alt: "Glavni trener Nenad Bulović, VI. DAN ITF",
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
