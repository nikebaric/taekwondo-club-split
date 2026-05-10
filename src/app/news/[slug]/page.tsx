import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleAdminToolbar } from "@/components/article-admin-toolbar";
import { NewsArticleBelowBody } from "@/components/news-article-below-body";
import { site } from "@/config/site";
import { isAdminSession } from "@/lib/auth-check";
import { composeNewsDescriptionHtml } from "@/lib/news-compose-body";
import { extractDescriptionPlainFromBodyHtml } from "@/lib/news-extract-body";
import { extractNewsBodyHtmlFragment } from "@/lib/news-legacy-media";
import { resolveHeroCoverSrc } from "@/lib/news-cover";
import { fetchLocalNewsPostBySlug, fetchNewsPostBySlug } from "@/lib/news-queries";
import { resolveArticleGallery } from "@/lib/news-resolve-gallery";
import { stripHtml } from "@/lib/news-post";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchNewsPostBySlug(slug);
  if (!post) return { title: "Nije pronađeno" };
  const title = stripHtml(post.title.rendered);
  const excerpt = stripHtml(post.excerpt.rendered);
  const description = excerpt.length > 0 ? excerpt.slice(0, 180) : site.description;
  return {
    title,
    description,
    openGraph: { title, description, type: "article", publishedTime: post.date },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await fetchNewsPostBySlug(slug);
  const raw = await fetchLocalNewsPostBySlug(slug);
  if (!post || !raw) notFound();

  const credit = post.articleCreditLine?.trim();
  const isAdmin = await isAdminSession();
  const plainTitle = stripHtml(post.title.rendered);
  const gallery = resolveArticleGallery(raw);
  const coverSrc = resolveHeroCoverSrc(raw, gallery.images);
  const plainForBody =
    raw.descriptionPlain?.trim() || extractDescriptionPlainFromBodyHtml(raw.bodyHtml);
  const bodyHtml = extractNewsBodyHtmlFragment(composeNewsDescriptionHtml(plainForBody));

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--brand-gold)]">
        Borilački portal · klub
      </p>
      <Link href="/news" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">
        ← Portal
      </Link>
      <header className="mt-8">
        <time className="text-xs uppercase tracking-wider text-zinc-500" dateTime={post.date}>
          {new Date(post.date).toLocaleDateString("hr-HR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <h1
          className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-[0.06em] text-slate-900 sm:text-5xl"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
      </header>
      {coverSrc ? (
        <div className="mt-8 aspect-[2/1] overflow-hidden rounded-2xl bg-slate-200 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- naslovna fotografija članka */}
          <img
            src={coverSrc}
            alt={plainTitle}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      ) : null}
      <div
        className={`prose prose-site prose-lg max-w-none prose-headings:font-[family-name:var(--font-display)] prose-headings:tracking-wide prose-headings:text-slate-900 ${coverSrc ? "mt-6" : "mt-8"}`}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
      <NewsArticleBelowBody
        images={gallery.images}
        youtubeEmbeds={gallery.youtubeEmbeds}
        videos={gallery.videos}
        altBase={plainTitle}
      />
      {isAdmin ? <ArticleAdminToolbar slug={slug} /> : null}
      {credit ? (
        <p className="mt-12 border-t border-slate-200 pt-8 text-sm font-medium text-slate-600">{credit}</p>
      ) : null}
    </article>
  );
}
