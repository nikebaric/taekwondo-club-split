import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { placeholders } from "@/config/placeholders";
import { getPageLocale } from "@/i18n/locale";
import { localizedPath } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getPageLocale(params);
  return {
    title: t.nav.find((n) => n.href === "/programi")?.label ?? "Programi",
    description: `${t.programs.metaDescription} — ${t.site.styleLine} ${t.meta.siteName}.`,
  };
}

export default async function ProgramsPage({ params }: Props) {
  const { locale, t } = await getPageLocale(params);
  const p = t.programs;

  const programs = [
    { ...p.cards[0], image: placeholders.programs.djeca },
    { ...p.cards[1], image: placeholders.programs.odrasli },
  ];

  return (
    <div>
      <div className="relative h-[42vh] min-h-[240px] overflow-hidden border-b border-slate-200/90">
        <Image src="/images/klub-naslovna.png" alt={p.heroAlt} fill className="object-cover object-[center_45%]" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-black/50 to-black/30" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-4 pb-10 sm:px-6">
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-[0.06em] text-white sm:text-5xl">
            {p.heroTitle}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow={p.eyebrow}
          title={p.title}
          subtitle={`${t.site.styleLine} ${p.subtitleSuffix} ${t.site.address.venueName}.`}
        />
        <ul className="mx-auto mt-14 max-w-4xl space-y-6">
          {programs.map((prog) => (
            <li key={prog.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-sm sm:flex">
              <div className="relative aspect-[16/10] shrink-0 sm:aspect-auto sm:w-[280px] md:w-[340px]">
                <Image src={prog.image} alt={prog.imageAlt} fill className="object-cover" sizes="(max-width:640px) 100vw, 340px" />
              </div>
              <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10">
                <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">{prog.name}</h2>
                <p className="mt-3 text-[var(--muted)]">{prog.detail}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-slate-200 bg-[var(--surface)] p-8 shadow-sm sm:p-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-[0.06em] text-slate-900 sm:text-2xl">
            {p.curriculumTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{p.curriculumIntro}</p>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            {t.site.trainingCurriculum.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-[var(--muted)]">{p.curriculumOutro}</p>
        </div>
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-[var(--brand-gold)]/30 bg-[var(--brand-gold-soft)] p-8 text-center">
          <p className="text-lg font-medium text-slate-900">{p.ctaTitle}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{p.ctaBody}</p>
          <Link
            href={localizedPath("/kontakt", locale)}
            className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
          >
            {p.ctaButton}
          </Link>
        </div>
      </div>
    </div>
  );
}
