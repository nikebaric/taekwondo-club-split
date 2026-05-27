import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClubTrainersSection } from "@/components/club-trainers-section";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/config/site";
import { getPageLocale } from "@/i18n/locale";
import { localizedPath } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getPageLocale(params);
  return {
    title: t.nav.find((n) => n.href === "/o-klubu")?.label ?? "O klubu",
    description: `${t.meta.siteName} — ${t.about.metaDescription} ${t.meta.description}`,
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale, t } = await getPageLocale(params);
  const a = t.about;
  const contactLabel = t.nav.find((n) => n.href === "/kontakt")?.label ?? t.common.contact;
  const trainingLabel = t.nav.find((n) => n.href === "/raspored-treninga")?.label ?? t.common.training;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow={a.eyebrow}
          title={a.title}
          subtitle={`${t.meta.siteName} ${a.subtitlePrefix} ${t.site.styleLine} ${locale === "en" ? "Sessions are held at" : "Treningi su u"} ${t.site.address.venueName}, ${site.address.street}.`}
        />
        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 shadow-sm lg:aspect-[3/4]">
            <Image
              src="/images/klub-naslovna.png"
              alt={a.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="prose prose-sm prose-site max-w-none prose-headings:text-slate-900">
            <p>{t.site.taekwondoMeaningShort}</p>
            <p>{a.p2}</p>
            <p>
              {locale === "en" ? "Head coach" : "Glavni trener je"} {site.headCoach.academicTitle} {site.headCoach.name} (
              {site.headCoach.rank}, {site.headCoach.federation}).{" "}
              {locale === "en" ? "Assistant coach" : "U radu u dvorani sudjeluje i trener"}{" "}
              {site.assistantCoaches[0].name}.{" "}
              <Link href="#treneri" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                {a.coachesLink}
              </Link>
            </p>
            <p>
              {a.followFacebook}{" "}
              <a href={site.social.facebook} className="text-[var(--accent)] no-underline hover:underline">
                {a.facebookPage}
              </a>{" "}
              {a.facebookLine}
            </p>
            <h3>{a.firstVisit}</h3>
            <ul>
              <li>
                {locale === "en" ? "Hall and schedule:" : "Dvorana i termini:"}{" "}
                <Link
                  href={localizedPath("/raspored-treninga", locale)}
                  className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  {trainingLabel}
                </Link>
                ; {locale === "en" ? "for messages" : "za poruke"}{" "}
                <Link
                  href={localizedPath("/kontakt", locale)}
                  className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  {contactLabel}
                </Link>
              </li>
              <li>{a.firstVisitGear}</li>
              <li>{a.firstVisitRespect}</li>
            </ul>
          </div>
        </div>
      </div>
      <section id="treneri" className="scroll-mt-24 border-t border-slate-200/80">
        <ClubTrainersSection locale={locale} t={t} />
      </section>
    </>
  );
}
