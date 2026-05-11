/**
 * src/app/news/page.tsx — News listing page (route: /news)
 *
 * KEY CONCEPTS:
 * - SERVER-SIDE DATA FETCHING — this is an async Server Component that
 *   awaits data before rendering. The `await` runs on the server; the
 *   client receives fully rendered HTML with the posts already embedded.
 *   No useEffect, no loading state, no client-side fetch waterfall.
 * - DYNAMIC CONTENT — because the function is async, Next.js treats this
 *   page as dynamically rendered (not statically generated at build time).
 *   Each request fetches the latest posts from the data store.
 * - Conditional rendering (`posts.length === 0 ? ... : ...`) shows an
 *   empty-state message or the grid — a common React pattern.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { newsPortalCopy } from "@/config/news-portal";
import { site } from "@/config/site";
import { fetchNewsPosts } from "@/lib/news-queries";
import { getListingCover, getPostAuthor, stripHtml } from "@/lib/news-post";

export const metadata: Metadata = {
  title: "Novosti",
  description: `${newsPortalCopy.metaDescription} ${site.name}.`,
};

// async function → this page fetches data on every request (dynamic rendering).
// The `24` argument limits how many posts to fetch — pagination/infinite
// scroll could be layered on top with searchParams or a Client Component.
export default async function NewsPage() {
  const posts = await fetchNewsPosts(24);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading eyebrow={newsPortalCopy.pageEyebrow} title={newsPortalCopy.pageTitle} />

      {posts.length === 0 ? (
        <p className="mx-auto mt-14 max-w-2xl text-center text-[var(--muted)]">{newsPortalCopy.emptyPosts}</p>
      ) : (
        <ul className="mt-14 grid gap-8 md:grid-cols-2">
          {posts.map((post) => {
            const cover = getListingCover(post);
            const author = getPostAuthor(post);
            return (
              <li key={post.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-card-hover)]">
                  <div className="aspect-[2/1] bg-[var(--surface-muted)]">
                    {cover?.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover.src} alt={cover.alt || ""} className="h-full w-full object-cover" />
                    ) : cover?.kind === "video" ? (
                      <video
                        src={cover.src}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                        aria-label="Video novost"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                        Bez istaknute slike
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-8">
                    <time className="text-xs uppercase tracking-wider text-zinc-500" dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("hr-HR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    {author ? (
                      <p className="mt-2 text-xs font-medium text-[var(--accent)]">Autor: {author}</p>
                    ) : null}
                    <h2
                      className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.04em] text-slate-900 sm:text-3xl"
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                    <p className="mt-3 flex-1 text-[var(--muted)]">{stripHtml(post.excerpt.rendered)}</p>
                    <Link
                      href={`/novosti/${post.slug}`}
                      className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)]"
                    >
                      Pročitaj članak →
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
