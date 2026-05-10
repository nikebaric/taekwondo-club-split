import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { AdminAchievementForm } from "@/components/admin-achievement-form";
import { isAdminSession } from "@/lib/auth-check";
import { findAchievementById } from "@/lib/achievements-store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await findAchievementById(id);
  return {
    title: row ? `Uredi: ${row.name}` : "Uredi rezultat",
  };
}

export default async function AdminRezultatiEditPage({ params }: Props) {
  if (!(await isAdminSession())) {
    const { id } = await params;
    redirect(`/login?next=${encodeURIComponent(`/admin/rezultati/${id}`)}`);
  }

  const { id } = await params;
  const row = await findAchievementById(id);
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Administracija</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Uredi rezultat
      </h1>
      <div className="mt-10">
        <AdminAchievementForm mode="edit" initial={row} />
      </div>
      <div className="mt-12 text-center text-sm text-[var(--muted)]">
        <AdminBackNav />
      </div>
    </div>
  );
}
