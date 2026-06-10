import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { AdminAchievementForm } from "@/components/admin-achievement-form";
import { adminLoginRedirect, getAdminPage } from "@/i18n/admin-page";
import { isAdminSession } from "@/lib/auth-check";
import { findAchievementById } from "@/lib/achievements-store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { a } = await getAdminPage();
  const { id } = await params;
  const row = await findAchievementById(id);
  return { title: row ? a.results.editMeta(row.name) : a.results.editFallback };
}

export default async function AdminRezultatiEditPage({ params }: Props) {
  const { locale, lp, a, t } = await getAdminPage();
  const { id } = await params;
  if (!(await isAdminSession())) {
    redirect(adminLoginRedirect(`/admin/rezultati/${id}`, locale));
  }

  const row = await findAchievementById(id);
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">{a.eyebrow}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        {a.results.editTitle}
      </h1>
      <div className="mt-10">
        <AdminAchievementForm mode="edit" initial={row} a={a} rt={t.resultsTable} listPath={lp("/admin/rezultati")} />
      </div>
      <div className="mt-12 text-center text-sm text-[var(--muted)]">
        <AdminBackNav label={a.back} />
      </div>
    </div>
  );
}
