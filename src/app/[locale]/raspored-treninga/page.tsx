import type { Metadata } from "next";
import { LocationMap } from "@/components/location-map";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/config/site";
import { getPageLocale } from "@/i18n/locale";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getPageLocale(params);
  return {
    title: t.schedule.title,
    description: `${t.schedule.metaDescription} — ${t.meta.siteName}, ${t.site.address.venueName}, ${t.meta.city}.`,
  };
}

export default async function SchedulePage({ params }: Props) {
  const { t } = await getPageLocale(params);
  const s = t.schedule;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow={s.eyebrow}
        title={s.title}
        subtitle={`${s.subtitlePrefix} ${t.site.address.venueName}. ${s.subtitleSuffix} ${t.meta.siteName} ${s.subtitleSuffixEnd}`}
      />
      <div className="mt-14 rounded-2xl border border-slate-200 bg-[var(--surface)] p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{s.hall}</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">
          {s.whereWeTrain}
        </h2>
        <address className="mt-4 text-sm not-italic leading-relaxed text-slate-700">
          <div className="font-semibold text-slate-900">{t.site.address.venueName}</div>
          <div>
            {site.address.street}, {site.city} {site.address.postalCode}
          </div>
          <div>
            {t.site.address.region}, {t.site.address.country}
          </div>
        </address>
        {t.site.hours ? (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600">
            <span className="font-medium text-slate-800">{s.hoursSummary}</span> {t.site.hours}
          </p>
        ) : null}
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          {s.mapIntro} {t.site.address.venueName}, {site.address.street}, {site.city}. {s.mapIntroEnd}{" "}
          <span className="font-medium text-slate-700">{s.googleMaps}</span> {s.mapIntroEnd2}
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
          {t.common.openInMaps}
        </a>
      </div>
      <div className="mt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{s.weeklySchedule}</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">
          {s.trainingTimes}
        </h2>
      </div>
      <div className="mt-8">
        <div className="space-y-3 md:hidden">
          {t.site.scheduleSlots.map((r) => (
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
        <div className="hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-sm md:block">
          <table className="w-full table-fixed border-collapse text-left text-xs lg:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 lg:text-xs">
              <tr>
                <th className="w-[18%] py-3 pl-3 pr-1 font-semibold lg:py-4 lg:pl-4">{s.tableDay}</th>
                <th className="w-[14%] px-1 py-3 font-semibold lg:px-2 lg:py-4">{s.tableTime}</th>
                <th className="w-[38%] px-1 py-3 font-semibold lg:px-2 lg:py-4">{s.tableProgram}</th>
                <th className="w-[30%] py-3 pl-1 pr-3 font-semibold lg:py-4 lg:pr-4">{s.tablePlace}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {t.site.scheduleSlots.map((r) => (
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
