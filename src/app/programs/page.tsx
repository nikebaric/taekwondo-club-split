import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { placeholders } from "@/config/placeholders";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Programi",
  description: `Programi za djecu i odrasle — ${site.styleLine} ${site.name}.`,
};

const programs = [
  {
    name: "Djeca i juniori",
    detail:
      "Tempo i sadržaj prilagođeni dobi — koordinacija, disciplina i napredovanje pojasevima. Na treningima u dvorani OS „BRDA“ klub okuplja i najmlađe polaznike uz siguran pristup.",
    image: placeholders.programs.djeca,
    imageAlt: "Djeca na treningu u dvorani Osnovne škole BRDA",
  },
  {
    name: "Odrasli",
    detail:
      "Isti termini u sklopu rasporeda kluba — kondicija, tehnička izvedba, forme i po napretku kontrolirani sparing u ITF programu.",
    image: placeholders.programs.odrasli,
    imageAlt: "Treneri i majstori kluba u doboku na tatamiju",
  },
];

export default function ProgramsPage() {
  return (
    <div>
      <div className="relative h-[42vh] min-h-[240px] overflow-hidden border-b border-slate-200/90">
        <Image
          src="/images/klub-naslovna.png"
          alt="Taekwondo klub Split — trening"
          fill
          className="object-cover object-[center_45%]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-black/50 to-black/30" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-4 pb-10 sm:px-6">
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-[0.06em] text-white sm:text-5xl">
            PROGRAMI
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Trening"
          title="Djeca i odrasli"
          subtitle={`${site.styleLine} Treningi prema rasporedu u dvorani ${site.address.venueName}.`}
        />
        <ul className="mx-auto mt-14 max-w-4xl space-y-6">
          {programs.map((p) => (
            <li
              key={p.name}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-sm sm:flex"
            >
              <div className="relative aspect-[16/10] shrink-0 sm:aspect-auto sm:w-[280px] md:w-[340px]">
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 100vw, 340px"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10">
                <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">
                  {p.name}
                </h2>
                <p className="mt-3 text-[var(--muted)]">{p.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-slate-200 bg-[var(--surface)] p-8 shadow-sm sm:p-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-[0.06em] text-slate-900 sm:text-2xl">
            Što sve uključuje trening
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Sažetak prema klupskom programu — redoslijed i naglasak prilagođava trener prema skupini.
          </p>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            {site.trainingCurriculum.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-[var(--muted)]">
            U radu s mladima naglasak je i na odgojnim aspektima — samopouzdanje, koncentracija i poštovanje
            pravila u skupini, uz siguran tehnički napredak.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-[var(--brand-gold)]/30 bg-[var(--brand-gold-soft)] p-8 text-center">
          <p className="text-lg font-medium text-slate-900">Niste sigurni koja skupina vama odgovara?</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Javite nam dob i ciljeve — preporučit ćemo termin prije ikakve obveze.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
          >
            Kontaktirajte nas
          </Link>
        </div>
      </div>
    </div>
  );
}
