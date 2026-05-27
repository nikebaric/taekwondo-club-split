import type { ClubCalendarEvent } from "@/config/club-calendar-events";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

function formatDisplayDate(iso: string, locale: Locale): string {
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CalendarEventsTable({
  rows,
  locale,
}: {
  rows: readonly ClubCalendarEvent[];
  locale: Locale;
}) {
  const ct = getDictionary(locale).calendarTable;
  const sorted = [...rows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <div className="space-y-3 md:hidden">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--muted)] shadow-sm">
            {ct.empty}
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
                  <dt className="font-medium text-slate-500">{ct.date}</dt>
                  <dd className="tabular-nums text-[var(--muted)]">{formatDisplayDate(row.date, locale)}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-slate-500">{ct.place}</dt>
                  <dd className="min-w-0 break-words">{row.place}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-slate-500">{ct.organizer}</dt>
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
              <th className="w-[30%] py-3 pl-3 pr-1 font-semibold lg:py-4 lg:pl-4">{ct.title}</th>
              <th className="w-[14%] px-1 py-3 font-semibold lg:px-2 lg:py-4">{ct.date}</th>
              <th className="w-[18%] px-1 py-3 font-semibold lg:px-2 lg:py-4">{ct.place}</th>
              <th className="w-[38%] py-3 pl-1 pr-3 font-semibold lg:py-4 lg:pr-4">{ct.organizer}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[var(--muted)]">
                  {ct.empty}
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="min-w-0 break-words px-2 py-3 font-medium text-slate-900 sm:px-3 lg:px-4">
                    {row.title}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-[var(--muted)] sm:px-3 lg:px-4">
                    {formatDisplayDate(row.date, locale)}
                  </td>
                  <td className="min-w-0 break-words px-2 py-3 text-slate-700 sm:px-3 lg:px-4">{row.place}</td>
                  <td className="min-w-0 break-words px-2 py-3 text-slate-500 sm:px-3 lg:px-4">
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
