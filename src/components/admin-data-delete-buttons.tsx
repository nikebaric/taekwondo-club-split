"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteCalendarEventButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!window.confirm("Obrisati ovaj zapis iz kalendara?")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/calendar-events/${encodeURIComponent(id)}`, { method: "DELETE" });
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
