import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClubTrainersSection } from "@/components/club-trainers-section";
import { SectionHeading } from "@/components/section-heading";
import { contactPageLabel, site } from "@/config/site";

export const metadata: Metadata = {
  title: "O klubu",
  description: `${site.name} — ITF taekwon-do, trening u Splitu (OS „BRDA“). ${site.description}`,
};

export default function AboutPage() {
  return (
    <>
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Naš klub"
        title="Taekwon-do u Splitu"
        subtitle={`${site.name} neprofitni je sportski klub. ${site.styleLine} Treningi su u školskoj dvorani na adresi ${site.address.venueName}, ${site.address.street}.`}
      />
      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 shadow-sm lg:aspect-[3/4]">
          <Image
            src="/images/klub-naslovna.png"
            alt="Taekwondo klub Split — članovi na treningu"
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="prose prose-site prose-lg max-w-none prose-headings:text-slate-900">
          <p>{site.taekwondoMeaningShort}</p>
          <p>
            Dobrodošli su potpuni početnici i iskusni sportaši. Trening uključuje osnove, forme, partnerske
            vježbe i kontrolirano sparingovanje kako bi napredak bio siguran, ali i izazovan.
          </p>
          <p>
            Glavni trener je {site.headCoach.academicTitle} {site.headCoach.name} ({site.headCoach.rank},{" "}
            {site.headCoach.federation}). U radu u dvorani sudjeluje i trener {site.assistantCoaches[0].name}.{" "}
            <Link href="#treneri" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Više o trenerima
            </Link>
          </p>
          <p>
            Pratite našu{" "}
            <a href={site.social.facebook} className="text-[var(--accent)] no-underline hover:underline">
              Facebook stranicu
            </a>{" "}
            za polaganja pojaseva, izmjene termina i klupske novosti.
          </p>
          <h3>Prvi dolazak</h3>
          <ul>
            <li>
              Dvorana i termini:{" "}
              <Link href="/schedule" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                Treninzi
              </Link>
              ; za poruke{" "}
              <Link href="/contact" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                {contactPageLabel}
              </Link>
            </li>
            <li>Odgovarajuća sportska odjeća i boca za vodu</li>
            <li>Otvoren pristup — poštovanje partnera i trenera na prvom je mjestu</li>
          </ul>
        </div>
      </div>
    </div>

    <section id="treneri" className="scroll-mt-24 border-t border-slate-200/80">
      <ClubTrainersSection />
    </section>
    </>
  );
}
