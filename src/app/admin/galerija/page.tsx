import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { adminLoginRedirect, getAdminPage } from "@/i18n/admin-page";
import { getMemberSession, isGalleryAdminSession } from "@/lib/auth-check";
import { readGalleryAlbums } from "@/lib/gallery-store";

export async function generateMetadata(): Promise<Metadata> {
  const { a } = await getAdminPage();
  return { title: a.gallery.metaTitle, description: a.gallery.metaDescription };
}

export default async function AdminGalerijaPage() {
  const { locale, lp, a } = await getAdminPage();
  const session = await getMemberSession();
  if (!session) {
    redirect(adminLoginRedirect("/admin/galerija", locale));
  }
  if (!(await isGalleryAdminSession())) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">
          {a.gallery.accessDenied}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{a.gallery.accessDeniedDesc}</p>
        <div className="mt-10 text-sm text-[var(--muted)]">
          <AdminBackNav label={a.back} className="font-semibold" />
          {" · "}
          <Link href={lp("/galerija")} className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
            {a.gallery.backToGallery}
          </Link>
        </div>
      </div>
    );
  }

  const albums = await readGalleryAlbums();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">{a.eyebrow}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        {a.gallery.listTitle}
      </h1>
      <div className="mt-8">
        <Link
          href={lp("/admin/galerija/novi")}
          className="inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110"
        >
          {a.gallery.newAlbum}
        </Link>
      </div>
      <ul className="mt-12 space-y-3">
        {albums.map((album) => (
          <li key={album.slug}>
            <Link
              href={lp(`/admin/galerija/${encodeURIComponent(album.slug)}`)}
              className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-semibold text-slate-900">{album.title}</span>
              <span className="mt-1 font-mono text-xs text-[var(--muted)] sm:mt-0">/{album.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
      {albums.length === 0 ? <p className="mt-8 text-sm text-[var(--muted)]">{a.gallery.empty}</p> : null}
      <div className="mt-14 text-center text-sm text-[var(--muted)]">
        <AdminBackNav label={a.back} />
      </div>
    </div>
  );
}
