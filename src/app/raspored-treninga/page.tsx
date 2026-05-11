/**
 * src/app/schedule/page.tsx — Schedule page (route: /schedule)
 *
 * KEY CONCEPTS:
 * - RESPONSIVE DESIGN with Tailwind — this page shows the same data in
 *   two different layouts: mobile-friendly CARDS and a desktop TABLE.
 *   The `md:hidden` / `hidden md:block` classes toggle visibility at the
 *   `md` breakpoint (768px). The markup for BOTH layouts is rendered
 *   server-side; CSS alone controls which one is visible.
 * - Data-driven rendering — the schedule slots come from a config object
 *   and are rendered via .map(), keeping the template DRY.
 */
import type { Metadata } from "next";
import { LocationMap } from "@/components/location-map";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Treninzi",
  description: `Gdje treniramo i termini — ${site.name}, ${site.address.venueName}, Split.`,
};

export default function SchedulePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Klub"
        title="Treninzi"
        subtitle={`Treningi su u ${site.address.venueName}. Za izvanredne izmjene termina prvo provjerite ${site.name} na Facebooku.`}
      />

      <div className="mt-14 rounded-2xl border border-slate-200 bg-[var(--surface)] p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Dvorana</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">
          Gdje treniramo
        </h2>
        <address className="mt-4 text-sm not-italic leading-relaxed text-slate-700">
          <div className="font-semibold text-slate-900">{site.address.venueName}</div>
          <div>
            {site.address.street}, {site.city} {site.address.postalCode}
          </div>
          <div>
            {site.address.region}, {site.address.country}
          </div>
        </address>
        {site.hours ? (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600">
            <span className="font-medium text-slate-800">Sažetak termina:</span> {site.hours}
          </p>
        ) : null}
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Dvorana za trening nalazi se u {site.address.venueName}, {site.address.street}, {site.city}. Zoom na ugrađenoj karti
          podešava se na samoj karti; za navigaciju ili veći prikaz otvorite lokaciju u{" "}
          <span className="font-medium text-slate-700">Google Kartama</span> poveznicom ispod.
        </p>
        <div className="mt-6">
          <LocationMap />
        </div>
        <a
          href={site.mapsPlaceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Otvori lokaciju u Google Kartama →
        </a>
      </div>

      <div className="mt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Tjedni raspored</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">
          Termini treninga
        </h2>
      </div>

      <div className="mt-8">
        {/* MOBILE layout (visible below md breakpoint, hidden on md+).
            Each schedule slot is its own card — better touch targets and
            readability on narrow screens than a cramped table. */}
        <div className="space-y-3 md:hidden">
          {site.scheduleSlots.map((r) => (
            <div
              key={`${r.day}-${r.time}`}
              className="rounded-2xl border border-slate-200 bg-[var(--surface)] p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-slate-900">{r.day}</span>
                <span className="tabular-nums text-sm text-[var(--muted)]">{r.time}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{r.program}</p>
              <p className="mt-2 text-sm text-slate-500">{r.place}</p>
            </div>
          ))}
        </div>

        {/* DESKTOP layout (hidden below md, visible on md+).
            A traditional <table> is ideal when horizontal space allows
            columnar comparison. Both layouts render the same data from
            site.scheduleSlots — only the presentation differs. */}
        <div className="hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-sm md:block">
          <table className="w-full table-fixed border-collapse text-left text-xs lg:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 lg:text-xs">
              <tr>
                <th className="w-[18%] py-3 pl-3 pr-1 font-semibold lg:py-4 lg:pl-4">Dan</th>
                <th className="w-[14%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Vrijeme</th>
                <th className="w-[38%] px-1 py-3 font-semibold lg:px-2 lg:py-4">Program</th>
                <th className="w-[30%] py-3 pl-1 pr-3 font-semibold lg:py-4 lg:pr-4">Mjesto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {site.scheduleSlots.map((r) => (
                <tr key={`${r.day}-${r.time}`} className="hover:bg-slate-50/80">
                  <td className="min-w-0 break-words px-2 py-3 font-medium text-slate-900 sm:px-3 lg:px-4">
                    {r.day}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-[var(--muted)] sm:px-3 lg:px-4">{r.time}</td>
                  <td className="min-w-0 break-words px-2 py-3 text-slate-700 sm:px-3 lg:px-4">{r.program}</td>
                  <td className="min-w-0 break-words px-2 py-3 text-slate-500 sm:px-3 lg:px-4">{r.place}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
