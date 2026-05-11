import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminGalleryAlbumForm } from "@/components/admin-gallery-album-form";
import { getMemberSession, isGalleryAdminSession } from "@/lib/auth-check";

export const metadata: Metadata = {
  title: "Novi album — galerija",
};

export default async function AdminNoviAlbumPage() {
  const session = await getMemberSession();
  if (!session) redirect("/prijava?next=/admin/galerija/novi");
  if (!(await isGalleryAdminSession())) {
    redirect("/admin/galerija");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Administracija</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Novi album
      </h1>
      <div className="mt-10">
        <AdminGalleryAlbumForm mode="create" />
      </div>
    </div>
  );
}
