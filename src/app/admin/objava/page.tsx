import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { adminLoginRedirect, getAdminPage } from "@/i18n/admin-page";
import { isAdminSession } from "@/lib/auth-check";
import { readLocalNewsPosts } from "@/lib/news-store";

export async function generateMetadata(): Promise<Metadata> {
  const { a } = await getAdminPage();
  return { title: a.news.metaTitle, description: a.news.metaDescription };
}

export default async function AdminObjavaPage() {
  const { locale, lp, a } = await getAdminPage();
  if (!(await isAdminSession())) {
    redirect(adminLoginRedirect("/admin/objava", locale));
  }

  const postsRaw = await readLocalNewsPosts();
  const posts = [...postsRaw].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">{a.eyebrow}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        {a.news.listTitle}
      </h1>
      <div className="mt-8">
        <Link
          href={lp("/admin/objava/novi")}
          className="inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110"
        >
          {a.news.newPost}
        </Link>
      </div>
      <ul className="mt-12 space-y-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={lp(`/admin/objava/${encodeURIComponent(p.slug)}`)}
              className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-semibold text-slate-900">{p.title}</span>
              <span className="mt-1 font-mono text-xs text-[var(--muted)] sm:mt-0">/{p.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
      {posts.length === 0 ? <p className="mt-8 text-sm text-[var(--muted)]">{a.news.empty}</p> : null}
      <div className="mt-14 text-center text-sm text-[var(--muted)]">
        <AdminBackNav label={a.back} />
      </div>
    </div>
  );
}
