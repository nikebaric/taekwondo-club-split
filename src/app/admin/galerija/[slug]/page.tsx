import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminGalleryAlbumForm } from "@/components/admin-gallery-album-form";
import { getGalleryAlbumBySlug } from "@/config/gallery";
import { adminLoginRedirect, getAdminPage } from "@/i18n/admin-page";
import { getMemberSession, isGalleryAdminSession } from "@/lib/auth-check";
import { readGalleryAlbums } from "@/lib/gallery-store";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { a } = await getAdminPage();
  const { slug } = await params;
  const albums = await readGalleryAlbums();
  const album = getGalleryAlbumBySlug(slug, albums);
  return { title: album ? a.gallery.editMeta(album.title) : a.gallery.editTitle };
}

export default async function AdminUrediAlbumPage({ params }: Props) {
  const { locale, lp, a } = await getAdminPage();
  const { slug } = await params;
  const session = await getMemberSession();
  if (!session) {
    redirect(adminLoginRedirect(`/admin/galerija/${slug}`, locale));
  }
  if (!(await isGalleryAdminSession())) {
    redirect(lp("/admin/galerija"));
  }

  const albums = await readGalleryAlbums();
  const album = getGalleryAlbumBySlug(slug, albums);
  if (!album) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">{a.eyebrow}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        {a.gallery.editTitle}
      </h1>
      <p className="mt-2 font-mono text-sm text-[var(--muted)]">{album.slug}</p>
      <div className="mt-10">
        <AdminGalleryAlbumForm
          mode="edit"
          editSlug={slug}
          initialAlbum={album}
          a={a}
          listPath={lp("/admin/galerija")}
          publicGalleryPath={lp("/galerija")}
        />
      </div>
    </div>
  );
}
