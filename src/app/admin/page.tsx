import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminLoginRedirect, getAdminPage } from "@/i18n/admin-page";
import { getMemberSession, isAdminSession } from "@/lib/auth-check";

export async function generateMetadata(): Promise<Metadata> {
  const { a } = await getAdminPage();
  return { title: a.hub.metaTitle, description: a.hub.metaDescription };
}

export default async function AdminHubPage() {
  const { locale, lp, a } = await getAdminPage();
  if (!(await isAdminSession())) {
    redirect(adminLoginRedirect("/admin", locale));
  }

  const session = await getMemberSession();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">{a.eyebrow}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        {a.hub.title}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
        {session?.name ? a.hub.greeting(session.name) : a.hub.choose}
      </p>

      <ul className="mt-12 space-y-4">
        <li>
          <Link
            href={lp("/admin/objava")}
            className="flex flex-col rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[var(--accent)]/45 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-semibold text-slate-900">{a.hub.newsTitle}</span>
            <span className="mt-1 text-sm text-[var(--muted)] sm:mt-0">{a.hub.newsDesc}</span>
          </Link>
        </li>
        <li>
          <Link
            href={lp("/admin/galerija")}
            className="flex flex-col rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[var(--accent)]/45 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-semibold text-slate-900">{a.hub.galleryTitle}</span>
            <span className="mt-1 text-sm text-[var(--muted)] sm:mt-0">{a.hub.galleryDesc}</span>
          </Link>
        </li>
        <li>
          <Link
            href={lp("/admin/kalendar")}
            className="flex flex-col rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[var(--accent)]/45 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-semibold text-slate-900">{a.hub.calendarTitle}</span>
            <span className="mt-1 text-sm text-[var(--muted)] sm:mt-0">{a.hub.calendarDesc}</span>
          </Link>
        </li>
        <li>
          <Link
            href={lp("/admin/rezultati")}
            className="flex flex-col rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[var(--accent)]/45 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-semibold text-slate-900">{a.hub.resultsTitle}</span>
            <span className="mt-1 text-sm text-[var(--muted)] sm:mt-0">{a.hub.resultsDesc}</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
