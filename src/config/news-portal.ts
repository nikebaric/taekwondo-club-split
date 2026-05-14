/**
 * CONCEPT: Copy/i18n Pattern — Keeping UI Strings in Config
 *
 * All user-facing text for the news portal lives here, not sprinkled across
 * components. This pattern (sometimes called "copy deck" or "i18n strings"):
 * - Makes it easy to hand off to translators or content editors
 * - Allows switching languages by swapping the config object
 * - Keeps components focused on layout, not content decisions
 * - `as const` ensures the strings are literal-typed and immutable
 *
 * Even in a single-language app, this separation pays off — you can search
 * this file to find any text shown to users.
 *
 * Tekstovi za PORTAL BORBENI SPLIT — borilački portal + službene vijesti kluba.
 * @see https://www.jutarnji.hr/sportske/fightsite — referenca za koncept (UFC, regija, K1/boks, ostalo).
 */
export const PORTAL_BRAND_NAME = "PORTAL BORBENI SPLIT" as const;

export const newsPortalCopy = {
  metaDescription:
    "PORTAL BORBENI SPLIT — borilački portal i vijesti Taekwondo kluba Split; sadržaj iz svijeta borilačkih sportova uz klupske objave.",

  pageEyebrow: PORTAL_BRAND_NAME,
  pageTitle: "Novosti",

  homeEyebrow: PORTAL_BRAND_NAME,
  homeTitle: "Zadnje s portala",
  homeSubtitle: "Borilački sadržaj i vijesti kluba — objavljuju se izravno kroz web sučelje kluba.",

  emptyPosts:
    "Još nema objava. Kad administrator objavi prvu novost (Prijava korisnika → nova novost), pojavit će se ovdje.",
} as const;
