/**
 * Rezultati — podaci u `data/achievements.json` (API administracije).
 */
export type AchievementMedal = "gold" | "silver" | "bronze";

export type AchievementAgeGroup = "seniori" | "juniori" | "kadeti";

export type AchievementDiscipline = "forme" | "borbe";

/** ITF / klupska paleta pojaseva za prikaz rezultata */
export type AchievementBelt =
  | "bijeli"
  | "zuti"
  | "narancasti"
  | "zeleni"
  | "plavi"
  | "ljubicasti"
  | "crveni"
  | "crni";

export const ACHIEVEMENT_BELTS: readonly AchievementBelt[] = [
  "bijeli",
  "zuti",
  "narancasti",
  "zeleni",
  "plavi",
  "ljubicasti",
  "crveni",
  "crni",
] as const;

export function pojasLabel(b: AchievementBelt): string {
  const m: Record<AchievementBelt, string> = {
    bijeli: "Bijeli",
    zuti: "Žuti",
    narancasti: "Narančasti",
    zeleni: "Zeleni",
    plavi: "Plavi",
    ljubicasti: "Ljubičasti",
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
  /** ISO datum YYYY-MM-DD */
  date: string;
  ageGroup?: AchievementAgeGroup;
  /** Natjecateljska kategorija (npr. težinska skupina, visina) — slobodan tekst */
  kategorija?: string;
  pojas?: AchievementBelt;
};
