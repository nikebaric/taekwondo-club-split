import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMemberSession, isAdminSession } from "@/lib/auth-check";

export const metadata: Metadata = {
  title: "Administracija",
  description: "Novosti i galerija — klupska administracija.",
};

export default async function AdminHubPage() {
  if (!(await isAdminSession())) {
    redirect("/prijava?next=/admin");
  }

  const session = await getMemberSession();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Administracija</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Klupska administracija
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
        {session?.name ? (
          <>
            Pozdrav, <span className="font-semibold text-slate-800">{session.name}</span>. Odaberite što želite
            uređivati.
          </>
        ) : (
          <>Odaberite što želite uređivati.</>
        )}
      </p>

      <ul className="mt-12 space-y-4">
        <li>
          <Link
            href="/admin/objava"
            className="flex flex-col rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[var(--accent)]/45 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-semibold text-slate-900">Novosti</span>
            <span className="mt-1 text-sm text-[var(--muted)] sm:mt-0">
              Popis članaka, nova objava i uređivanje
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/galerija"
            className="flex flex-col rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[var(--accent)]/45 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-semibold text-slate-900">Galerija</span>
            <span className="mt-1 text-sm text-[var(--muted)] sm:mt-0">Albumi, slike i videi</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/kalendar"
            className="flex flex-col rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[var(--accent)]/45 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-semibold text-slate-900">Natjecanja i seminari</span>
            <span className="mt-1 text-sm text-[var(--muted)] sm:mt-0">Kalendar događaja</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/rezultati"
            className="flex flex-col rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[var(--accent)]/45 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-semibold text-slate-900">Rezultati</span>
            <span className="mt-1 text-sm text-[var(--muted)] sm:mt-0">Medalje i tablica uspjeha</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
