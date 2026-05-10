import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/config/site";

const coachDisplayName = `${site.headCoach.academicTitle} ${site.headCoach.name}`;

/** Sadržaj bivše stranice /instructors — ugrađen u O klubu (#treneri). */
export function ClubTrainersSection() {
  const coach = site.headCoach;

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
            Glavni trener
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-white sm:text-5xl">
            {coachDisplayName.toUpperCase()}
          </h2>
          <p className="mt-2 text-sm font-medium text-zinc-300">
            {coach.role} · {coach.rank} · {coach.federation}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Stručni kadar"
          title="Vodstvo kluba"
          subtitle="Glavni trener vodi treninge u dvorani OS „BRDA“ i klupske objave na portalu."
        />

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
          <div className="prose prose-site prose-lg max-w-none prose-headings:text-slate-900 lg:col-span-7">
            <p className="text-lg font-semibold text-slate-900">
              {coachDisplayName} — {coach.rank}, {coach.federation}
            </p>
            {coach.bio.map((paragraph, index) => (
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
                Facebook kluba
              </Link>
              <Link
                href="/news"
                className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-3xl rounded-2xl border border-slate-200 bg-[var(--surface)] p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
            Suradnici
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">
            Ostali treneri
          </h3>
          <ul className="mt-6 space-y-4 text-sm text-[var(--muted)]">
            {site.assistantCoaches.map((c) => (
              <li key={c.name}>
                <span className="font-semibold text-slate-800">{c.name}</span> — {c.role}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-slate-500">
            Imena i uloge prema klupskim materijalima; galerija prikazuje i zajedničke fotografije trenera.
          </p>
        </div>
      </div>
    </>
  );
}
