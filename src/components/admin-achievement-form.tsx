"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AchievementBelt, ClubAchievement } from "@/config/club-achievements";
import { ACHIEVEMENT_BELTS } from "@/config/club-achievements";
import type { Dictionary } from "@/i18n/dictionaries/hr";
import type { AdminPanel } from "@/i18n/dictionaries/admin-panel";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

type ModeProps =
  | { mode: "create" }
  | { mode: "edit"; initial: ClubAchievement };

type Props = ModeProps & {
  listPath: string;
  a: AdminPanel;
  rt: Dictionary["resultsTable"];
};

export function AdminAchievementForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { a, rt } = props;
  const f = a.achievementForm;
  const initial = props.mode === "edit" ? props.initial : null;

  function beltLabel(b: AchievementBelt): string {
    return rt.belts[b];
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    setPending(true);
    try {
      const url =
        props.mode === "create" ? "/api/achievements" : `/api/achievements/${encodeURIComponent(initial!.id)}`;
      const method = props.mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        body: fd,
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? a.saveFailed);
        return;
      }
      router.push(props.listPath);
      router.refresh();
    } catch {
      setError(a.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form encType="multipart/form-data" onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{f.medal}</span>
          <select name="medal" required defaultValue={initial?.medal ?? "gold"} className={inputClass}>
            <option value="gold">{rt.gold}</option>
            <option value="silver">{rt.silver}</option>
            <option value="bronze">{rt.bronze}</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{f.discipline}</span>
          <select name="discipline" required defaultValue={initial?.discipline ?? "forme"} className={inputClass}>
            <option value="forme">{rt.forme}</option>
            <option value="borbe">{rt.sparring}</option>
          </select>
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{f.name}</span>
        <input name="name" required maxLength={120} defaultValue={initial?.name ?? ""} className={inputClass} />
      </label>
      <div className="space-y-2">
        <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">{f.photo}</span>
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={`${inputClass} py-2 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200`}
        />
        {initial?.photoSrc ? (
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary upload path */}
            <img
              src={initial.photoSrc}
              alt=""
              className="h-16 w-16 shrink-0 rounded-full border border-slate-200 object-cover"
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="removePhoto" value="true" className="rounded border-slate-300" />
              {f.removePhoto}
            </label>
          </div>
        ) : null}
      </div>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{f.competition}</span>
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
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{f.date}</span>
          <input name="date" type="date" required defaultValue={initial?.date ?? ""} className={inputClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{f.ageGroup}</span>
          <select name="ageGroup" defaultValue={initial?.ageGroup ?? ""} className={inputClass}>
            <option value="">—</option>
            <option value="seniori">{rt.seniors}</option>
            <option value="juniori">{rt.juniors}</option>
            <option value="kadeti">{rt.cadets}</option>
          </select>
        </label>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{f.category}</span>
          <input
            name="kategorija"
            maxLength={120}
            placeholder={f.categoryPlaceholder}
            defaultValue={initial?.kategorija ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{f.belt}</span>
          <select name="pojas" defaultValue={initial?.pojas ?? ""} className={inputClass}>
            <option value="">—</option>
            {ACHIEVEMENT_BELTS.map((b) => (
              <option key={b} value={b}>
                {beltLabel(b)}
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
          {pending ? a.saving : props.mode === "create" ? f.add : a.saveChanges}
        </button>
      </div>
    </form>
  );
}
