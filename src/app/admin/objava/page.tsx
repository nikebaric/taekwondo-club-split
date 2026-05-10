import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { isAdminSession } from "@/lib/auth-check";
import { readLocalNewsPosts } from "@/lib/news-store";

export const metadata: Metadata = {
  title: "Administracija novosti",
  description: "Članci i objave — klupska administracija.",
};

export default async function AdminObjavaPage() {
  if (!(await isAdminSession())) {
    redirect("/login?next=/admin/objava");
  }

  const postsRaw = await readLocalNewsPosts();
  const posts = [...postsRaw].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Administracija</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Novosti — članci
      </h1>
      <div className="mt-8">
        <Link
          href="/admin/objava/novi"
          className="inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110"
        >
          Nova novost
        </Link>
      </div>
      <ul className="mt-12 space-y-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/admin/objava/${encodeURIComponent(p.slug)}`}
              className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-semibold text-slate-900">{p.title}</span>
              <span className="mt-1 font-mono text-xs text-[var(--muted)] sm:mt-0">/{p.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">Još nema članaka u podacima.</p>
      ) : null}
      <div className="mt-14 text-center text-sm text-[var(--muted)]">
        <AdminBackNav />
      </div>
    </div>
  );
}
