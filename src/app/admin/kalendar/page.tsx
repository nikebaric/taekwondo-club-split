import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { DeleteCalendarEventButton } from "@/components/admin-data-delete-buttons";
import { isAdminSession } from "@/lib/auth-check";
import { readCalendarEvents } from "@/lib/calendar-events-store";

export const metadata: Metadata = {
  title: "Kalendar — administracija",
  description: "Natjecanja i seminari.",
};

export default async function AdminKalendarPage() {
  if (!(await isAdminSession())) {
    redirect("/prijava?next=/admin/kalendar");
  }

  const events = [...(await readCalendarEvents())].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Administracija</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Natjecanja i seminari
      </h1>
      <div className="mt-8">
        <Link
          href="/admin/kalendar/novi"
          className="inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110"
        >
          Novi zapis
        </Link>
      </div>
      <ul className="mt-12 space-y-3">
        {events.map((e) => (
          <li
            key={e.id}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <Link
              href={`/admin/kalendar/${encodeURIComponent(e.id)}`}
              className="min-w-0 flex-1 font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              <span className="text-slate-900">{e.title}</span>
              <span className="mt-1 block font-mono text-xs font-normal text-[var(--muted)]">
                {e.date} · {e.place}
                {e.organizator?.trim() ? ` · ${e.organizator.trim()}` : ""}
              </span>
            </Link>
            <DeleteCalendarEventButton id={e.id} />
          </li>
        ))}
      </ul>
      {events.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">Još nema zapisa — dodajte prvi.</p>
      ) : null}
      <div className="mt-14 text-center text-sm text-[var(--muted)]">
        <AdminBackNav />
      </div>
    </div>
  );
}
