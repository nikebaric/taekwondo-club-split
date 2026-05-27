import type { Metadata } from "next";
import Link from "next/link";
import { PortalBorbeniShowcase } from "@/components/portal-borbeni-showcase";
import { SectionHeading } from "@/components/section-heading";
import { PORTAL_BRAND_NAME } from "@/config/news-portal";
import { formatPostDate } from "@/i18n/format-date";
import { getPageLocale } from "@/i18n/locale";
import { localizedPath } from "@/i18n/routing";
import { fetchNewsPosts } from "@/lib/news-queries";
import { getListingCover, getPostAuthor, stripHtml } from "@/lib/news-post";
import { sanitizeHtml } from "@/lib/sanitize-html";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getPageLocale(params);
  return {
    title: PORTAL_BRAND_NAME,
    description: `${t.portal.metaDescription} ${t.meta.siteName}.`,
  };
}

export default async function NewsPage({ params }: Props) {
  const { locale, t } = await getPageLocale(params);
  const posts = await fetchNewsPosts(24, locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <PortalBorbeniShowcase locale={locale} subtitle={t.home.news.subtitle} />
      <div className="mt-16 border-t border-slate-200 pt-16">
        <SectionHeading eyebrow={t.portal.pageEyebrow} title={t.portal.pageTitle} />
        {posts.length === 0 ? (
          <p className="mx-auto mt-14 max-w-2xl text-center text-[var(--muted)]">{t.portal.empty}</p>
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
                          aria-label={t.home.news.videoLabel}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                          {t.home.news.noImage}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-8">
                      <time className="text-xs uppercase tracking-wider text-zinc-500" dateTime={post.date}>
                        {formatPostDate(post.date, locale)}
                      </time>
                      {author ? (
                        <p className="mt-2 text-xs font-medium text-[var(--accent)]">
                          {t.portal.author}: {author}
                        </p>
                      ) : null}
                      <h2
                        className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.04em] text-slate-900 sm:text-3xl"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.title.rendered) }}
                      />
                      <p className="mt-3 flex-1 text-[var(--muted)]">{stripHtml(post.excerpt.rendered)}</p>
                      <Link
                        href={localizedPath(`/portal-novosti/${post.slug}`, locale)}
                        className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)]"
                      >
                        {t.common.readMore} →
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
