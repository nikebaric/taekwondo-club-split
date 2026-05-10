export const site = {
  /** Službeni grb kluba (PNG) */
  logo: "/images/logo-kluba.png",
  brand: {
    line1: "Taekwondo klub",
    line2: "Split",
  },
  name: "Taekwondo klub Split",
  tagline: "Disciplina · Poštovanje · Izvrsnost",
  /** Stil vezan uz ITF — kako je navedeno na klupskim materijalima */
  styleLine: "Taekwon-Do prema programu International Taekwon-Do Federation (ITF).",
  /** Sažetak značenja naziva (klupski letak) */
  taekwondoMeaningShort:
    "U nazivu: tae označava stopalo, kwon šaku, a do put ili način vježbanja — vještinu borbe nogama i rukama.",
  description:
    "Neprofitni sportski klub u Splitu. Taekwon-do (ITF) za djecu i odrasle — od početnika do naprednih skupina.",
  city: "Split",
  /** Klupski kontakt i broj za upise (099 …). Za tel: link koristi se +385… */
  phone: "099 255 73 45",
  email: "" as string,
  address: {
    /** Školska zgrada u kojoj se održavaju treningi (prema klupskom letku). */
    venueName: 'Osnovna škola „BRDA"',
    street: "Put Brda 2",
    postalCode: "21000",
    region: "Splitsko-dalmatinska županija",
    country: "Hrvatska",
  },
  /** Sažetak termina za footer i kontakt (prema letku; provjerite Facebook za izmjene). */
  hours:
    "Treningi: ponedjeljak 19:30–20:30 i subota 17:00–18:00 (dvorana OS „BRDA“). Za izvanredne izmjene pratite Facebook.",
  /** Ugrađena Google karta — točka prema adresi treninga */
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Put+Brda+2,+21000+Split,+Hrvatska&hl=hr&z=17&output=embed",
  /** Puni prikaz lokacije u novoj kartici */
  mapsPlaceUrl:
    "https://www.google.com/maps/search/?api=1&query=Put+Brda+2%2C+21000+Split%2C+Hrvatska",
  /**
   * Medalje na natjecanjima — uredite brojeve prema klupskoj evidenciji.
   * Prikaz: naslovnica (hero).
   */
  medalStats: {
    gold: 12,
    silver: 18,
    bronze: 24,
    /** Kratki podnaslov ispod brojeva; prazan string sakriva redak. */
    footnote: "Zlatne, srebrne i brončane — ukupno na natjecanjima",
  },
  social: {
    instagram: "",
    facebook: "https://www.facebook.com/TkdSplit/",
    youtube: "",
  },
  /** Tjedni raspored — jedan red po terminu */
  scheduleSlots: [
    {
      day: "Ponedjeljak",
      time: "19:30 – 20:30",
      program: "Trening (djeca i odrasli)",
      place: 'Dvorana · OS „BRDA"',
    },
    {
      day: "Subota",
      time: "17:00 – 18:00",
      program: "Trening (djeca i odrasli)",
      place: 'Dvorana · OS „BRDA"',
    },
  ] as const,
  /**
   * Sadržaj treninga prema trostranom letku kluba (sažetak).
   * Za web smo formulacije blago skratili; detalje potvrđuje trener.
   */
  trainingCurriculum: [
    "Zagrijavanje i razgibavanje",
    "Ručne i nožne tehnike",
    "Kretanje i stavovi u taekwon-dou",
    "Forme (patterns / tul · hyeong)",
    "Kontrolirani sparing na jedan, dva i tri koraka",
    "Slobodna sportska borba",
    "Samobrana (Hoo Sin Sool)",
  ] as const,
  /** Dodatni trener spomenut na klupskim materijalima */
  assistantCoaches: [{ name: "Janez Stor", role: "Trener" }] as const,
  /** Glavni trener — biografija i fotografija za stranicu Treneri */
  headCoach: {
    academicTitle: "Dr. sc.",
    name: "Nenad Bulović",
    role: "Glavni trener",
    rank: "VI. DAN",
    federation: "International Taekwon-Do Federation (ITF)",
    photo: "/images/nenad-bulovic-vi-dan.png",
    /** Kratki odlomci za prikaz na stranici (uredite po želji). */
    bio: [
      "Dr. sc. Nenad Bulović glavni je trener Taekwondo kluba Split i nositelj majstorske razine VI. DAN unutar Međunarodne federacije taekwon-do (ITF). Na treningima u Osnovnoj školi „BRDA“ vodi skupine za djecu i odrasle, s naglaskom na siguran napredak i klupske vrijednosti.",
      "Na portalu objavljuje klupske obavijesti i sadržaj za članove; za upite o upisu i terminima dostupan je i na broju kluba navedenom na stranici Kontakt.",
    ],
  },
} as const;

/** Jedna linija za kartu / strukturirane podatke */
export function formatClubAddressSingleLine(): string {
  const { address: a, city } = site;
  return `${a.venueName}, ${a.street}, ${city} ${a.postalCode}, ${a.country}`;
}

/** tel: link za hrvatski mobilni broj započet s 09… */
export function phoneToTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("385")) return `+${digits}`;
  if (digits.startsWith("0")) return `+385${digits.slice(1)}`;
  return `+${digits}`;
}

/** Izbornik i naslov stranice /contact */
export const contactPageLabel = "Kontakt" as const;

/** Ruta za prijavu članova / administracije (gumb u headeru). */
export const loginPath = "/login?next=/admin" as const;

export const nav = [
  { href: "/", label: "Naslovnica" },
  { href: "/about", label: "O klubu" },
  { href: "/programs", label: "Programi" },
  { href: "/schedule", label: "Treninzi" },
  { href: "/natjecanja-seminari", label: "Natjecanja i seminari" },
  { href: "/uspjesi", label: "Rezultati" },
  { href: "/news", label: "Portal" },
  { href: "/galerija", label: "Galerija" },
  { href: "/contact", label: contactPageLabel },
] as const;
