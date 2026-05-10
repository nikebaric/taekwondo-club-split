import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { getMemberSession, isGalleryAdminSession } from "@/lib/auth-check";
import { readGalleryAlbums } from "@/lib/gallery-store";

export const metadata: Metadata = {
  title: "Administracija galerije",
  description: "Albumi i mediji — samo ovlašteni administrator.",
};

export default async function AdminGalerijaPage() {
  const session = await getMemberSession();
  if (!session) {
    redirect("/login?next=/admin/galerija");
  }
  if (!(await isGalleryAdminSession())) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">
          Pristup odbijen
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          Uređivanje galerije imaju klupski administratori ili račun iz postavke GALLERY_ADMIN_EMAIL.
        </p>
        <div className="mt-10 text-sm text-[var(--muted)]">
          <AdminBackNav className="font-semibold" />
          {" · "}
          <Link href="/galerija" className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
            ← Natrag na galeriju
          </Link>
        </div>
      </div>
    );
  }

  const albums = await readGalleryAlbums();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Administracija</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Galerija — albumi
      </h1>
      <div className="mt-8">
        <Link
          href="/admin/galerija/novi"
          className="inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110"
        >
          Novi album
        </Link>
      </div>
      <ul className="mt-12 space-y-3">
        {albums.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/admin/galerija/${encodeURIComponent(a.slug)}`}
              className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-semibold text-slate-900">{a.title}</span>
              <span className="mt-1 font-mono text-xs text-[var(--muted)] sm:mt-0">/{a.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
      {albums.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">Još nema albuma u podacima.</p>
      ) : null}
      <div className="mt-14 text-center text-sm text-[var(--muted)]">
        <AdminBackNav />
      </div>
    </div>
  );
}
