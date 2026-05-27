import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { PORTAL_BRAND_NAME } from "@/config/news-portal";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/hr";
import { localizedPath } from "@/i18n/routing";

const coachDisplayName = `${site.headCoach.academicTitle} ${site.headCoach.name}`;

export function ClubTrainersSection({ locale, t }: { locale: Locale; t: Dictionary }) {
  const coach = site.headCoach;
  const cs = t.site.coachesSection;

  return (
    <>
      <div className="relative h-[42vh] min-h-[260px] overflow-hidden border-b border-slate-200/90">
        <Image
          src={coach.photo}
          alt={`${coachDisplayName}, ${coach.rank}`}
          fill
          className="object-cover object-[center_15%]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-black/65 to-black/35" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-10 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-gold)]">
            {cs.heroEyebrow}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-white sm:text-5xl">
            {coachDisplayName.toUpperCase()}
          </h2>
          <p className="mt-2 text-sm font-medium text-zinc-300">
            {t.site.headCoach.role} · {coach.rank} · {coach.federation}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading eyebrow={cs.eyebrow} title={cs.title} subtitle={cs.subtitle} />

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-14 lg:items-start">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-lg lg:col-span-5">
            <Image
              src={coach.photo}
              alt={`${coachDisplayName}, ${coach.rank}`}
              fill
              className="object-cover object-[center_10%]"
              sizes="(max-width:1024px) 100vw, 40vw"
            />
          </div>
          <div className="prose prose-sm prose-site max-w-none prose-headings:text-slate-900 lg:col-span-7">
            <p className="text-base font-semibold text-slate-900">
              {coachDisplayName} — {coach.rank}, {coach.federation}
            </p>
            {t.site.headCoach.bio.map((paragraph, index) => (
              <p key={index} className="text-[var(--muted)] leading-relaxed">
                {paragraph}
              </p>
            ))}
            <div className="not-prose mt-10 flex flex-wrap gap-4">
              <Link
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
              >
                {cs.clubFacebook}
              </Link>
              <Link
                href={localizedPath("/portal-novosti", locale)}
                className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                {PORTAL_BRAND_NAME}
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-3xl rounded-2xl border border-slate-200 bg-[var(--surface)] p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
            {cs.collaborators}
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">
            {cs.otherCoaches}
          </h3>
          <ul className="mt-6 space-y-4 text-sm text-[var(--muted)]">
            {site.assistantCoaches.map((c) => (
              <li key={c.name}>
                <span className="font-semibold text-slate-800">{c.name}</span> — {cs.assistantRole}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-slate-500">{cs.collaboratorsNote}</p>
        </div>
      </div>
    </>
  );
}
