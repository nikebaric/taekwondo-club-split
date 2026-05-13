/**
 * CONCEPT: TypeScript Union Types for Domain Modeling
 *
 * This file uses string literal union types (e.g., "gold" | "silver" | "bronze")
 * instead of enums for domain concepts. This approach:
 * - Produces no runtime JavaScript (types are erased at compile time)
 * - Works naturally with JSON serialization (just strings)
 * - Gives full autocomplete and type-checking in the IDE
 *
 * Also demonstrated: the `Record<K, V>` utility type for exhaustive mappings,
 * ensuring every union member has a corresponding label.
 *
 * Results — data in `data/achievements.json` (admin API).
 */

// String literal union — restricts values to exactly these three strings.
// Unlike an enum, this generates zero runtime code.
export type AchievementMedal = "gold" | "silver" | "bronze";

export type AchievementAgeGroup = "seniori" | "juniori" | "kadeti";

export type AchievementDiscipline = "forme" | "borbe";

/** Club belt palette for results (ITF-style progression without orange/purple in this list). */
export type AchievementBelt = "bijeli" | "zuti" | "zeleni" | "plavi" | "crveni" | "crni";

// `readonly T[]` means this array cannot be mutated (no push, pop, splice).
// Combined with `as const`, TS knows the exact tuple of belt values.
export const ACHIEVEMENT_BELTS: readonly AchievementBelt[] = [
  "bijeli",
  "zuti",
  "zeleni",
  "plavi",
  "crveni",
  "crni",
] as const;

export function pojasLabel(b: AchievementBelt): string {
  // CONCEPT: Record<K, V> — a utility type that creates an object type where
  // every key in K must exist with a value of type V. If you forget a belt,
  // TypeScript will show a compile error — guaranteeing exhaustive mapping.
  const m: Record<AchievementBelt, string> = {
    bijeli: "Bijeli",
    zuti: "Žuti",
    zeleni: "Zeleni",
    plavi: "Plavi",
    crveni: "Crveni",
    crni: "Crni",
  };
  return m[b];
}

export type ClubAchievement = {
  id: string;
  medal: AchievementMedal;
  discipline: AchievementDiscipline;
  name: string;
  competition: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  ageGroup?: AchievementAgeGroup;
  /** Competition category (e.g. weight class, height) — free text */
  kategorija?: string;
  pojas?: AchievementBelt;
  /** Public URL of member photo, e.g. `/uploads/achievements/uuid-….jpg` */
  photoSrc?: string;
};
