"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ClubCalendarEvent } from "@/config/club-calendar-events";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

type Props =
  | { mode: "create" }
  | { mode: "edit"; initial: ClubCalendarEvent };

export function AdminCalendarEventForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const initial = props.mode === "edit" ? props.initial : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const date = String(fd.get("date") ?? "").trim();
    const place = String(fd.get("place") ?? "").trim();
    const organizatorRaw = String(fd.get("organizator") ?? "").trim();

    const payload: Record<string, unknown> =
      props.mode === "create"
        ? { title, date, place, ...(organizatorRaw ? { organizator: organizatorRaw } : {}) }
        : { title, date, place, organizator: organizatorRaw === "" ? null : organizatorRaw };
    setPending(true);
    try {
      const url =
        props.mode === "create"
          ? "/api/calendar-events"
          : `/api/calendar-events/${encodeURIComponent(initial!.id)}`;
      const method = props.mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? "Spremanje nije uspjelo.");
        return;
      }
      router.push("/admin/kalendar");
      router.refresh();
    } catch {
      setError("Mrežna greška.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Naziv</span>
        <input
          name="title"
          required
          maxLength={300}
          defaultValue={initial?.title ?? ""}
          className={inputClass}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Datum</span>
        <input name="date" type="date" required defaultValue={initial?.date ?? ""} className={inputClass} />
      </label>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Mjesto</span>
        <input
          name="place"
          required
          maxLength={200}
          defaultValue={initial?.place ?? ""}
          className={inputClass}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Organizator (opcionalno)</span>
        <input
          name="organizator"
          maxLength={200}
          placeholder="npr. HITF, lokalni savez, klub domaćin"
          defaultValue={initial?.organizator ?? ""}
          className={inputClass}
        />
      </label>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Spremam…" : props.mode === "create" ? "Dodaj zapis" : "Spremi izmjene"}
        </button>
      </div>
    </form>
  );
}
