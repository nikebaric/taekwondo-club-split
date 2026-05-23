/**
 * src/app/news/[slug]/page.tsx — Single news article (route: /news/:slug)
 *
 * KEY CONCEPTS:
 * - DYNAMIC ROUTE SEGMENT — the folder name `[slug]` tells Next.js this
 *   route has a variable segment. Visiting `/news/my-article` passes
 *   `{ slug: "my-article" }` in the `params` prop. The brackets are
 *   part of the file-system convention, not actual file characters.
 * - `generateMetadata` — an async function export that computes <head>
 *   tags dynamically per request. Next.js calls it before rendering the
 *   page, passing the same `params`. This lets you set the <title> and
 *   Open Graph tags to the actual article title, which is essential for
 *   SEO and social sharing of dynamic content.
 * - `notFound()` — a Next.js helper that triggers the nearest
 *   `not-found.tsx` boundary (or the built-in 404). No need to return
 *   a component — calling notFound() throws a special signal internally.
 * - `params` is a Promise in Next.js 15+ (it was a plain object before).
 *   You must `await params` before reading its properties.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleAdminToolbar } from "@/components/article-admin-toolbar";
import { NewsArticleBelowBody } from "@/components/news-article-below-body";
import { PORTAL_BRAND_NAME } from "@/config/news-portal";
import { site } from "@/config/site";
import { isAdminSession } from "@/lib/auth-check";
import { composeNewsDescriptionHtml } from "@/lib/news-compose-body";
import { extractDescriptionPlainFromBodyHtml } from "@/lib/news-extract-body";
import { extractNewsBodyHtmlFragment } from "@/lib/news-legacy-media";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { resolveHeroCoverSrc } from "@/lib/news-cover";
import { fetchLocalNewsPostBySlug, fetchNewsPostBySlug } from "@/lib/news-queries";
import { resolveArticleGallery } from "@/lib/news-resolve-gallery";
import { stripHtml } from "@/lib/news-post";

// TypeScript type for the component's props.
// `params` is a Promise in Next.js 15+ — this is a breaking change from
// earlier versions where it was a synchronous plain object.
type Props = { params: Promise<{ slug: string }> };

// generateMetadata runs on the server before the page renders.
// It receives the same props as the page component, so you can fetch
// the article and dynamically set <title>, description, og:image, etc.
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
  // Destructure the slug from the awaited params Promise
  const { slug } = await params;

  // Fetch article data on the server — the client never sees these calls
  const post = await fetchNewsPostBySlug(slug);
  const raw = await fetchLocalNewsPostBySlug(slug);
  // notFound() immediately halts rendering and shows the 404 page
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
        {PORTAL_BRAND_NAME} · klub
      </p>
      <Link href="/portal-novosti" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">
        ← {PORTAL_BRAND_NAME}
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
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.title.rendered) }}
        />
      </header>
      {coverSrc ? (
        <div className="mt-8 aspect-[2/1] overflow-hidden rounded-2xl bg-slate-200 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- article cover photo */}
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
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(bodyHtml) }}
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
