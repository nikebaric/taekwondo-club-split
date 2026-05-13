import {
  ACHIEVEMENT_BELTS,
  type AchievementAgeGroup,
  type AchievementBelt,
  type AchievementDiscipline,
  type AchievementMedal,
} from "@/config/club-achievements";

const MEDALS = new Set<AchievementMedal>(["gold", "silver", "bronze"]);
const DISC = new Set<AchievementDiscipline>(["forme", "borbe"]);
const AGE = new Set<AchievementAgeGroup>(["seniori", "juniori", "kadeti"]);
const BELTS = new Set<AchievementBelt>(ACHIEVEMENT_BELTS);

function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(`${s}T12:00:00`);
  return !Number.isNaN(t);
}

export type AchievementFormFields = {
  medal: AchievementMedal;
  discipline: AchievementDiscipline;
  name: string;
  competition: string;
  date: string;
  ageGroup?: AchievementAgeGroup;
  kategorija?: string;
  pojas?: AchievementBelt;
};

/** Edit mode: optional fields are always present so PATCH can clear them with `undefined`. */
export type AchievementFormFieldsForPatch = Omit<AchievementFormFields, "ageGroup" | "kategorija" | "pojas"> & {
  ageGroup: AchievementAgeGroup | undefined;
  kategorija: string | undefined;
  pojas: AchievementBelt | undefined;
};

export function parseAchievementFormFields(
  fd: FormData,
  mode: "create" | "edit",
):
  | { ok: true; values: AchievementFormFields }
  | { ok: true; values: AchievementFormFieldsForPatch; mode: "edit" }
  | { ok: false; error: string } {
  const medal = String(fd.get("medal") ?? "").trim() as AchievementMedal;
  const discipline = String(fd.get("discipline") ?? "").trim() as AchievementDiscipline;
  const name = String(fd.get("name") ?? "").trim();
  const competition = String(fd.get("competition") ?? "").trim();
  const date = String(fd.get("date") ?? "").trim();
  const ageRaw = String(fd.get("ageGroup") ?? "").trim();
  const kategorijaRaw = String(fd.get("kategorija") ?? "").trim();
  const pojasRaw = String(fd.get("pojas") ?? "").trim();

  if (!MEDALS.has(medal)) {
    return { ok: false, error: "Nepoznata medalja." };
  }
  if (!DISC.has(discipline)) {
    return { ok: false, error: "Disciplina mora biti forme ili borbe." };
  }
  if (name.length < 1 || name.length > 120) {
    return { ok: false, error: "Ime mora imati 1–120 znakova." };
  }
  if (competition.length < 1 || competition.length > 300) {
    return { ok: false, error: "Natjecanje mora imati 1–300 znakova." };
  }
  if (!isIsoDate(date)) {
    return { ok: false, error: "Datum mora biti YYYY-MM-DD." };
  }

  if (mode === "create") {
    let ageGroup: AchievementAgeGroup | undefined;
    if (ageRaw !== "") {
      const ag = ageRaw as AchievementAgeGroup;
      if (!AGE.has(ag)) return { ok: false, error: "Nepoznata dobna skupina." };
      ageGroup = ag;
    }

    let kategorija: string | undefined;
    if (kategorijaRaw !== "") {
      if (kategorijaRaw.length > 120) return { ok: false, error: "Kategorija može imati najviše 120 znakova." };
      kategorija = kategorijaRaw;
    }

    let pojas: AchievementBelt | undefined;
    if (pojasRaw !== "") {
      const p = pojasRaw as AchievementBelt;
      if (!BELTS.has(p)) return { ok: false, error: "Nepoznat pojas." };
      pojas = p;
    }

    return {
      ok: true,
      values: {
        medal,
        discipline,
        name,
        competition,
        date,
        ...(ageGroup ? { ageGroup } : {}),
        ...(kategorija ? { kategorija } : {}),
        ...(pojas ? { pojas } : {}),
      },
    };
  }

  let ageGroup: AchievementAgeGroup | undefined;
  if (ageRaw === "") {
    ageGroup = undefined;
  } else {
    const ag = ageRaw as AchievementAgeGroup;
    if (!AGE.has(ag)) return { ok: false, error: "Nepoznata dobna skupina." };
    ageGroup = ag;
  }

  let kategorija: string | undefined;
  if (kategorijaRaw === "") {
    kategorija = undefined;
  } else {
    if (kategorijaRaw.length > 120) return { ok: false, error: "Kategorija može imati najviše 120 znakova." };
    kategorija = kategorijaRaw;
  }

  let pojas: AchievementBelt | undefined;
  if (pojasRaw === "") {
    pojas = undefined;
  } else {
    const p = pojasRaw as AchievementBelt;
    if (!BELTS.has(p)) return { ok: false, error: "Nepoznat pojas." };
    pojas = p;
  }

  return {
    ok: true,
    mode: "edit",
    values: {
      medal,
      discipline,
      name,
      competition,
      date,
      ageGroup,
      kategorija,
      pojas,
    },
  };
}
