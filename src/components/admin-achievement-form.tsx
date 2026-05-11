/**
 * AdminAchievementForm — form for creating and editing achievement records.
 *
 * KEY CONCEPTS:
 * - **Controlled form with select elements:** Uses `<select>` for enum fields (medal,
 *   discipline, age group, belt). `defaultValue` pre-fills the initial value without
 *   requiring onChange handlers — these are "uncontrolled" selects with defaults.
 * - **TypeScript discriminated union for props:** The `Props` type is a union of two
 *   shapes: `{ mode: "create" }` and `{ mode: "edit"; initial: ClubAchievement }`.
 *   When `mode === "edit"`, TypeScript knows `initial` exists. When `mode === "create"`,
 *   accessing `initial` would be a compile error. This ensures type safety at the call site.
 * - **Type assertions with `as`:** `String(fd.get("medal")) as AchievementMedal`
 *   tells TypeScript to trust that the form value matches the expected type.
 *   This is necessary because FormData always returns strings, not typed values.
 * - **`type` keyword in imports:** `import type { ... }` imports types only — they're
 *   stripped at compile time and don't increase the JavaScript bundle size.
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  AchievementAgeGroup,
  AchievementBelt,
  AchievementDiscipline,
  AchievementMedal,
  ClubAchievement,
} from "@/config/club-achievements";
import { ACHIEVEMENT_BELTS, pojasLabel } from "@/config/club-achievements";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

// Discriminated union: TypeScript uses the `mode` field to narrow the type.
// When mode is "edit", `initial` is guaranteed to exist.
type Props =
  | { mode: "create" }
  | { mode: "edit"; initial: ClubAchievement };

export function AdminAchievementForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Type narrowing: checking `props.mode` tells TypeScript which variant we have.
  // After this, `initial` is `ClubAchievement | null` — safe to access in the JSX.
  const initial = props.mode === "edit" ? props.initial : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const medal = String(fd.get("medal") ?? "") as AchievementMedal;
    const discipline = String(fd.get("discipline") ?? "") as AchievementDiscipline;
    const name = String(fd.get("name") ?? "").trim();
    const competition = String(fd.get("competition") ?? "").trim();
    const date = String(fd.get("date") ?? "").trim();
    const ageRaw = String(fd.get("ageGroup") ?? "").trim();
    const kategorijaRaw = String(fd.get("kategorija") ?? "").trim();
    const pojasRaw = String(fd.get("pojas") ?? "").trim();

    const payload: Record<string, unknown> = {
      medal,
      discipline,
      name,
      competition,
      date,
    };

    if (props.mode === "create") {
      if (ageRaw !== "") payload.ageGroup = ageRaw as AchievementAgeGroup;
      if (kategorijaRaw !== "") payload.kategorija = kategorijaRaw;
      if (pojasRaw !== "") payload.pojas = pojasRaw as AchievementBelt;
    } else {
      payload.ageGroup = ageRaw === "" ? null : ageRaw;
      payload.kategorija = kategorijaRaw === "" ? null : kategorijaRaw;
      payload.pojas = pojasRaw === "" ? null : pojasRaw;
    }

    setPending(true);
    try {
      const url =
        props.mode === "create" ? "/api/achievements" : `/api/achievements/${encodeURIComponent(initial!.id)}`;
      const method = props.mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? "Spremanje nije uspjelo.");
        return;
      }
      router.push("/admin/rezultati");
      router.refresh();
    } catch {
      setError("Mrežna greška.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Medalja</span>
          <select
            name="medal"
            required
            defaultValue={initial?.medal ?? "gold"}
            className={inputClass}
          >
            <option value="gold">Zlato</option>
            <option value="silver">Srebro</option>
            <option value="bronze">Bronca</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Disciplina</span>
          <select
            name="discipline"
            required
            defaultValue={initial?.discipline ?? "forme"}
            className={inputClass}
          >
            <option value="forme">Forme</option>
            <option value="borbe">Borbe</option>
          </select>
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Ime i prezime</span>
        <input
          name="name"
          required
          maxLength={120}
          defaultValue={initial?.name ?? ""}
          className={inputClass}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Natjecanje / događaj</span>
        <input
          name="competition"
          required
          maxLength={300}
          defaultValue={initial?.competition ?? ""}
          className={inputClass}
        />
      </label>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Datum</span>
          <input name="date" type="date" required defaultValue={initial?.date ?? ""} className={inputClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Dobna skupina (opcionalno)
          </span>
          <select name="ageGroup" defaultValue={initial?.ageGroup ?? ""} className={inputClass}>
            <option value="">—</option>
            <option value="seniori">Seniori</option>
            <option value="juniori">Juniori</option>
            <option value="kadeti">Kadeti</option>
          </select>
        </label>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Kategorija / težinska skupina (opcionalno)
          </span>
          <input
            name="kategorija"
            maxLength={120}
            placeholder="npr. do 54 kg, visina A"
            defaultValue={initial?.kategorija ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Pojas (opcionalno)</span>
          <select name="pojas" defaultValue={initial?.pojas ?? ""} className={inputClass}>
            <option value="">—</option>
            {ACHIEVEMENT_BELTS.map((b) => (
              <option key={b} value={b}>
                {pojasLabel(b)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Spremam…" : props.mode === "create" ? "Dodaj rezultat" : "Spremi izmjene"}
        </button>
      </div>
    </form>
  );
}
