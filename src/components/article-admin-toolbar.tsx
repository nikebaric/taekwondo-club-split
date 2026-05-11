/**
 * ArticleAdminToolbar — admin edit/delete buttons shown on news article pages.
 *
 * KEY CONCEPTS:
 * - **Client Component for interactivity:** "use client" is needed for the delete
 *   button's onClick handler and the window.confirm dialog.
 * - **Conditional server-side rendering:** This component is only rendered when the
 *   parent (a Server Component) detects an admin session. The auth check happens on
 *   the server — this component never appears in the HTML for non-admin users.
 * - **Confirmation dialog pattern:** `window.confirm()` shows a native browser dialog
 *   that blocks execution until the user responds. If they cancel, we return early
 *   and skip the delete. This is a simple UX safeguard for destructive actions.
 * - **`void` expression:** `void handleDelete()` tells TypeScript/ESLint that we
 *   intentionally discard the Promise — preventing "unhandled promise" warnings.
 */
"use client";

import Link from "next/link";

type Props = { slug: string };

export function ArticleAdminToolbar({ slug }: Props) {
  async function handleDelete() {
    // window.confirm() returns false if the user clicks "Cancel" — early return prevents deletion.
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
    // Full page navigation (not router.push) ensures the server re-renders
    // the news list without the deleted article.
    window.location.assign("/portal-novosti");
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
