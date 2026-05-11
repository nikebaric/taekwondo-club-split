/**
 * CONCEPT: Centralized Configuration Pattern
 *
 * This file demonstrates the "single source of truth" pattern — all site-wide
 * data (names, URLs, contact info, schedule) lives in ONE exported object.
 * Components import from here instead of hardcoding strings, making updates
 * easy and consistent across the entire app.
 *
 * TypeScript concepts demonstrated:
 * - `as const` assertion — makes the object deeply readonly and narrows types
 *   to literal values (e.g., type is "Split" not string)
 * - Object type inference — TS infers the full shape; no explicit interface needed
 * - Separating data from UI — components stay generic, config drives content
 */

// `as const` at the end makes every property readonly and literal-typed.
// This means `site.city` has type "Split" (literal), not `string` (wide).
export const site = {
  /** Official club emblem (PNG) */
  logo: "/images/logo-kluba.png",
  brand: {
    line1: "Taekwondo klub",
    line2: "Split",
  },
  name: "Taekwondo klub Split",
  tagline: "Disciplina · Poštovanje · Izvrsnost",
  /** ITF-related style — as stated on club materials */
  styleLine: "Taekwon-Do prema programu International Taekwon-Do Federation (ITF).",
  /** Summary of the name's meaning (club leaflet) */
  taekwondoMeaningShort:
    "U nazivu: tae označava stopalo, kwon šaku, a do put ili način vježbanja — vještinu borbe nogama i rukama.",
  description:
    "Neprofitni sportski klub u Splitu. Taekwon-do (ITF) za djecu i odrasle — od početnika do naprednih skupina.",
  city: "Split",
  /** Club contact and enrollment number (099 …). For tel: links, +385… is used */
  phone: "099 255 73 45",
  // Type assertion `as string` widens this from literal "" to `string`,
  // allowing runtime assignment while keeping the rest of the object `as const`.
  email: "" as string,
  address: {
    /** School building where training sessions are held (per club leaflet). */
    venueName: 'Osnovna škola „BRDA"',
    street: "Put Brda 2",
    postalCode: "21000",
    region: "Splitsko-dalmatinska županija",
    country: "Hrvatska",
  },
  /** Schedule summary for footer and contact page (per leaflet; check Facebook for changes). */
  hours:
    "Treningi: ponedjeljak 19:30–20:30 i subota 17:00–18:00 (dvorana OS „BRDA“). Za izvanredne izmjene pratite Facebook.",
  /** Embedded Google map — pin at the training venue address */
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Put+Brda+2,+21000+Split,+Hrvatska&hl=hr&z=17&output=embed",
  /** Full location view in a new tab */
  mapsPlaceUrl:
    "https://www.google.com/maps/search/?api=1&query=Put+Brda+2%2C+21000+Split%2C+Hrvatska",
  /**
   * Competition medals — update numbers per club records.
   * Displayed on: homepage (hero).
   */
  medalStats: {
    gold: 12,
    silver: 18,
    bronze: 24,
    /** Short subtitle below the numbers; an empty string hides the row. */
    footnote: "Zlatne, srebrne i brončane — ukupno na natjecanjima",
  },
  social: {
    instagram: "",
    facebook: "https://www.facebook.com/TkdSplit/",
    youtube: "",
  },
  // `as const` on arrays creates a readonly tuple with literal element types —
  // TS knows the exact length and each element's shape at compile time.
  /** Weekly schedule — one row per time slot */
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
   * Training curriculum per the club's tri-fold leaflet (summary).
   * Wording was slightly shortened for the web; details confirmed by the coach.
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
  /** Assistant coach mentioned on club materials */
  assistantCoaches: [{ name: "Janez Stor", role: "Trener" }] as const,
  /** Head coach — bio and photo for the Coaches page */
  headCoach: {
    academicTitle: "Dr. sc.",
    name: "Nenad Bulović",
    role: "Glavni trener",
    rank: "VI. DAN",
    federation: "International Taekwon-Do Federation (ITF)",
    photo: "/images/nenad-bulovic-vi-dan.png",
    /** Short paragraphs for display on the page (edit as desired). */
    bio: [
      "Dr. sc. Nenad Bulović glavni je trener Taekwondo kluba Split i nositelj majstorske razine VI. DAN unutar Međunarodne federacije taekwon-do (ITF). Na treningima u Osnovnoj školi „BRDA“ vodi skupine za djecu i odrasle, s naglaskom na siguran napredak i klupske vrijednosti.",
      "Na portalu objavljuje klupske obavijesti i sadržaj za članove; za upite o upisu i terminima dostupan je i na broju kluba navedenom na stranici Kontakt.",
    ],
  },
} as const;

/**
 * Helper functions co-located with config — they derive values from `site`
 * so consumers don't need to know the internal structure.
 *
 * CONCEPT: Destructuring assignment — `{ address: a, city }` pulls nested
 * properties and renames `address` to `a` for brevity.
 */

/** Single line for map / structured data */
export function formatClubAddressSingleLine(): string {
  const { address: a, city } = site;
  return `${a.venueName}, ${a.street}, ${city} ${a.postalCode}, ${a.country}`;
}

/** tel: link for a Croatian mobile number starting with 09… */
export function phoneToTelHref(phone: string): string {
  // Regex \D matches any non-digit; replaceAll strips formatting (spaces, dashes)
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("385")) return `+${digits}`;
  if (digits.startsWith("0")) return `+385${digits.slice(1)}`;
  return `+${digits}`;
}

// `as const` on a string literal narrows the type from `string` to `"Kontakt"` —
// useful when the value is reused as both a label and a type discriminator.
/** Nav menu item and page title for /contact */
export const contactPageLabel = "Kontakt" as const;

/** Route for member / admin login (header button). */
export const loginPath = "/prijava?next=/admin" as const;

// Navigation array with `as const` — components can iterate this to render the
// menu, and TypeScript knows the exact route strings at compile time (type-safe routing).
export const nav = [
  { href: "/", label: "Naslovnica" },
  { href: "/o-klubu", label: "O klubu" },
  { href: "/programi", label: "Programi" },
  { href: "/raspored-treninga", label: "Treninzi" },
  { href: "/natjecanja-seminari", label: "Natjecanja i seminari" },
  { href: "/rezultati", label: "Rezultati" },
  { href: "/portal-novosti", label: "Portal" },
  { href: "/galerija", label: "Galerija" },
  { href: "/kontakt", label: contactPageLabel },
] as const;
