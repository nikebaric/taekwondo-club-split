"use client";

import Link from "next/link";

type Props = { slug: string };

export function ArticleAdminToolbar({ slug }: Props) {
  async function handleDelete() {
    if (!window.confirm("Obrisati ovaj članak? Ova radnja se ne može poništiti.")) return;
    const res = await fetch(`/api/news/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      window.alert(data.error ?? "Brisanje nije uspjelo.");
      return;
    }
    window.location.assign("/news");
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm">
      <span className="font-semibold text-amber-950">Administracija</span>
      <Link
        href={`/admin/objava/${encodeURIComponent(slug)}`}
        className="rounded-full bg-[var(--accent)] px-4 py-2 font-semibold text-white shadow-sm transition hover:brightness-110"
      >
        Uredi članak
      </Link>
      <button
        type="button"
        onClick={() => void handleDelete()}
        className="rounded-full border border-red-300 bg-white px-4 py-2 font-semibold text-red-800 shadow-sm transition hover:bg-red-50"
      >
        Obriši članak
      </button>
    </div>
  );
}
