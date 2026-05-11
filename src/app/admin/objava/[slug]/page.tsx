import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminNewsForm } from "@/app/admin/objava/admin-news-form";
import { isAdminSession } from "@/lib/auth-check";
import {
  extractDescriptionPlainFromBodyHtml,
  extractYoutubeWatchHintFromBody,
} from "@/lib/news-extract-body";
import { normalizeNewsDescriptionPlain } from "@/lib/news-compose-body";
import { resolveHeroCoverSrc } from "@/lib/news-cover";
import { resolveArticleGallery } from "@/lib/news-resolve-gallery";
import { findLocalPostBySlug } from "@/lib/news-store";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await findLocalPostBySlug(slug);
  return {
    title: post ? `Uredi: ${post.title}` : "Uredi novost",
  };
}

export default async function AdminEditNewsPage({ params }: Props) {
  if (!(await isAdminSession())) {
    const { slug } = await params;
    redirect(`/prijava?next=${encodeURIComponent(`/admin/objava/${slug}`)}`);
  }

  const { slug } = await params;
  const post = await findLocalPostBySlug(slug);
  if (!post) notFound();

  const descriptionPlain = normalizeNewsDescriptionPlain(
    post.descriptionPlain?.trim() || extractDescriptionPlainFromBodyHtml(post.bodyHtml),
  );

  const gallery = resolveArticleGallery(post);
  const initialCoverSrc = resolveHeroCoverSrc(post, gallery.images);
  const youtubeInitial =
    (post.galleryYoutubeEmbeds ?? []).join("\n").trim() ||
    post.youtubeEmbedStored?.trim() ||
    extractYoutubeWatchHintFromBody(post.bodyHtml) ||
    "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
        Administracija
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Uredi novost
      </h1>
      <p className="mt-2 font-mono text-sm text-[var(--muted)]">{slug}</p>
      <div className="mt-10">
        <AdminNewsForm
          mode="edit"
          editSlug={slug}
          initialTitle={post.title}
          initialDescription={descriptionPlain}
          initialYoutube={youtubeInitial}
          hasGalleryImages={gallery.images.length > 0}
          hasGalleryVideos={gallery.videos.length > 0}
          hasYoutube={gallery.youtubeEmbeds.length > 0}
          existingImageSrcs={gallery.images}
          initialCoverSrc={initialCoverSrc}
          initialPublishedAtIso={post.date}
        />
      </div>
    </div>
  );
}
