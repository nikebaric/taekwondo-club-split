/**
 * Delete buttons for calendar events and achievements — used in admin data tables.
 *
 * KEY CONCEPTS:
 * - **Confirmation dialog pattern:** `window.confirm()` shows a native browser dialog
 *   before destructive actions. The user must explicitly confirm — if they cancel,
 *   the function returns early and nothing happens. Simple but effective UX guard.
 * - **Optimistic-ish delete with router.refresh():** After a successful DELETE request,
 *   `router.refresh()` tells Next.js to re-fetch all Server Component data on the
 *   current page. The deleted item disappears because the server no longer returns it.
 *   This is simpler than managing local state — let the server be the source of truth.
 * - **Two similar components in one file:** DeleteCalendarEventButton and
 *   DeleteAchievementButton follow the same pattern but hit different API endpoints.
 *   Keeping them in one file is fine when they're closely related and small.
 * - **`void` expression:** `void onDelete()` explicitly discards the Promise to
 *   prevent ESLint's "no-floating-promises" warning in the onClick handler.
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteCalendarEventButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    // window.confirm returns a boolean — early return on "Cancel".
    if (!window.confirm("Obrisati ovaj zapis iz kalendara?")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/calendar-events/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        window.alert(data.error ?? "Brisanje nije uspjelo.");
        return;
      }
      // router.refresh() re-fetches Server Component data without a full page reload.
      // The deleted item disappears from the table because the server omits it.
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void onDelete()}
      className="text-sm font-semibold text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
    >
      {pending ? "…" : "Obriši"}
    </button>
  );
}

export function DeleteAchievementButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!window.confirm("Obrisati ovaj rezultat?")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/achievements/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        window.alert(data.error ?? "Brisanje nije uspjelo.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void onDelete()}
      className="text-sm font-semibold text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
    >
      {pending ? "…" : "Obriši"}
    </button>
  );
}
