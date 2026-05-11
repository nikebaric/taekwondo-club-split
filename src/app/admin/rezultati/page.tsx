import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import type { AchievementAgeGroup, AchievementBelt } from "@/config/club-achievements";
import { pojasLabel } from "@/config/club-achievements";
import { DeleteAchievementButton } from "@/components/admin-data-delete-buttons";
import { isAdminSession } from "@/lib/auth-check";
import { readAchievements } from "@/lib/achievements-store";

export const metadata: Metadata = {
  title: "Rezultati — administracija",
};

function medalHr(m: string): string {
  if (m === "gold") return "Zlato";
  if (m === "silver") return "Srebro";
  return "Bronca";
}

function dobnaSkupinaHr(ag: AchievementAgeGroup): string {
  if (ag === "seniori") return "Seniori";
  if (ag === "juniori") return "Juniori";
  return "Kadeti";
}

function rezultatSubtitle(r: {
  medal: string;
  competition: string;
  date: string;
  ageGroup?: AchievementAgeGroup;
  kategorija?: string;
  pojas?: AchievementBelt;
}): string {
  const parts = [medalHr(r.medal), r.competition, r.date];
  if (r.ageGroup) parts.push(dobnaSkupinaHr(r.ageGroup));
  const kat = r.kategorija?.trim();
  if (kat) parts.push(kat);
  if (r.pojas) parts.push(pojasLabel(r.pojas));
  return parts.join(" · ");
}

export default async function AdminRezultatiPage() {
  if (!(await isAdminSession())) {
    redirect("/prijava?next=/admin/rezultati");
  }

  const rows = [...(await readAchievements())].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Administracija</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Rezultati
      </h1>
      <div className="mt-8">
        <Link
          href="/admin/rezultati/novi"
          className="inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110"
        >
          Novi rezultat
        </Link>
      </div>
      <ul className="mt-12 space-y-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <Link
              href={`/admin/rezultati/${encodeURIComponent(r.id)}`}
              className="min-w-0 flex-1 font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              <span className="text-slate-900">{r.name}</span>
              <span className="mt-1 block text-xs font-normal text-[var(--muted)]">{rezultatSubtitle(r)}</span>
            </Link>
            <DeleteAchievementButton id={r.id} />
          </li>
        ))}
      </ul>
      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">Još nema rezultata — dodajte prvi.</p>
      ) : null}
      <div className="mt-14 text-center text-sm text-[var(--muted)]">
        <AdminBackNav />
      </div>
    </div>
  );
}
