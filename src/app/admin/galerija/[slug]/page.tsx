import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminGalleryAlbumForm } from "@/components/admin-gallery-album-form";
import { getGalleryAlbumBySlug } from "@/config/gallery";
import { getMemberSession, isGalleryAdminSession } from "@/lib/auth-check";
import { readGalleryAlbums } from "@/lib/gallery-store";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const albums = await readGalleryAlbums();
  const album = getGalleryAlbumBySlug(slug, albums);
  return {
    title: album ? `Uredi: ${album.title}` : "Uredi album",
  };
}

export default async function AdminUrediAlbumPage({ params }: Props) {
  const session = await getMemberSession();
  if (!session) {
    const { slug } = await params;
    redirect(`/login?next=${encodeURIComponent(`/admin/galerija/${slug}`)}`);
  }
  if (!(await isGalleryAdminSession())) {
    redirect("/admin/galerija");
  }

  const { slug } = await params;
  const albums = await readGalleryAlbums();
  const album = getGalleryAlbumBySlug(slug, albums);
  if (!album) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Administracija</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Uredi album
      </h1>
      <p className="mt-2 font-mono text-sm text-[var(--muted)]">{album.slug}</p>
      <div className="mt-10">
        <AdminGalleryAlbumForm mode="edit" editSlug={slug} initialAlbum={album} />
      </div>
    </div>
  );
}
