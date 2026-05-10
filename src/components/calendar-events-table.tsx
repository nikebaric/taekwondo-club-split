import type { ClubCalendarEvent } from "@/config/club-calendar-events";

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Natjecanja i seminari — bez horizontalnog scrolla na mobitelu (kartice), tablica od md. */
export function CalendarEventsTable({ rows }: { rows: readonly ClubCalendarEvent[] }) {
  const sorted = [...rows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <div className="space-y-3 md:hidden">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--muted)] shadow-sm">
            Još nema unesenih natjecanja ili seminara.
          </div>
        ) : (
          sorted.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-[var(--surface)] p-4 shadow-sm"
            >
              <p className="font-medium leading-snug text-slate-900">{row.title}</p>
              <dl className="mt-3 grid gap-2 text-sm text-slate-600">
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-slate-500">Datum</dt>
                  <dd className="tabular-nums text-[var(--muted)]">{formatDisplayDate(row.date)}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-slate-500">Mjesto</dt>
                  <dd className="min-w-0 break-words">{row.place}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-slate-500">Organizator</dt>
                  <dd className="min-w-0 break-words">
                    {row.organizator?.trim() ? row.organizator.trim() : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          ))
        )}
      </div>

      <div className="hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full table-fixed border-collapse text-left text-xs lg:text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 lg:text-xs">
            <tr>
              <th className="w-[30%] py-3 pl-3 pr-1 font-semibold lg:py-4 lg:pl-4">Naziv</th>
              <th className="w-[14%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Datum</th>
              <th className="w-[18%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Mjesto</th>
              <th className="w-[38%] py-3 pl-1 pr-3 font-semibold lg:py-4 lg:pr-4">Organizator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[var(--muted)]">
                  Još nema unesenih natjecanja ili seminara.
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="min-w-0 break-words px-2 py-3 font-medium text-slate-900 sm:px-3 lg:px-4">
                    {row.title}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums text-[var(--muted)] sm:px-3 lg:px-4">
                    {formatDisplayDate(row.date)}
                  </td>
                  <td className="min-w-0 break-words px-2 py-3 text-slate-700 sm:px-3 lg:px-4">{row.place}</td>
                  <td className="min-w-0 break-words px-2 py-3 text-slate-700 sm:px-3 lg:px-4">
                    {row.organizator?.trim() ? row.organizator.trim() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
