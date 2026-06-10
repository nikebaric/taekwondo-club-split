"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminPanel } from "@/i18n/dictionaries/admin-panel";

type Labels = Pick<AdminPanel, "delete" | "deleteFailed" | "saving"> & {
  confirm: string;
};

export function DeleteCalendarEventButton({ id, labels }: { id: string; labels: Labels }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!window.confirm(labels.confirm)) return;
    setPending(true);
    try {
      const res = await fetch(`/api/calendar-events/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        window.alert(data.error ?? labels.deleteFailed);
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
      {pending ? "…" : labels.delete}
    </button>
  );
}

export function DeleteAchievementButton({ id, labels }: { id: string; labels: Labels }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!window.confirm(labels.confirm)) return;
    setPending(true);
    try {
      const res = await fetch(`/api/achievements/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        window.alert(data.error ?? labels.deleteFailed);
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
      {pending ? "…" : labels.delete}
    </button>
  );
}
