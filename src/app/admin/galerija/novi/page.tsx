import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminGalleryAlbumForm } from "@/components/admin-gallery-album-form";
import { adminLoginRedirect, getAdminPage } from "@/i18n/admin-page";
import { getMemberSession, isGalleryAdminSession } from "@/lib/auth-check";

export async function generateMetadata(): Promise<Metadata> {
  const { a } = await getAdminPage();
  return { title: a.gallery.newMetaTitle };
}

export default async function AdminNoviAlbumPage() {
  const { locale, lp, a } = await getAdminPage();
  const session = await getMemberSession();
  if (!session) redirect(adminLoginRedirect("/admin/galerija/novi", locale));
  if (!(await isGalleryAdminSession())) {
    redirect(lp("/admin/galerija"));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">{a.eyebrow}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        {a.gallery.newAlbum}
      </h1>
      <div className="mt-10">
        <AdminGalleryAlbumForm
          mode="create"
          a={a}
          listPath={lp("/admin/galerija")}
          publicGalleryPath={lp("/galerija")}
        />
      </div>
    </div>
  );
}
