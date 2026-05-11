/**
 * src/app/about/page.tsx — About page (route: /about)
 *
 * KEY CONCEPTS:
 * - This is a STATIC page — it has no async data fetching, so Next.js can
 *   pre-render it at build time (Static Site Generation / SSG).
 * - The `metadata` export provides page-specific SEO tags. Because the
 *   root layout defines `title.template: "%s | Club Name"`, exporting
 *   `title: "O klubu"` here results in the final <title> being
 *   "O klubu | Club Name" — the framework handles merging automatically.
 * - Server Components can import and render other components (both Server
 *   and Client). The `ClubTrainersSection` below may be a Client Component
 *   internally, but this page itself stays a Server Component.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClubTrainersSection } from "@/components/club-trainers-section";
import { SectionHeading } from "@/components/section-heading";
import { contactPageLabel, site } from "@/config/site";

// Exporting a `metadata` object is how you set page-level <head> tags in
// the App Router. This replaces the old `<Head>` component from pages/.
// Next.js deep-merges this with the parent layout's metadata.
export const metadata: Metadata = {
  title: "O klubu",
  description: `${site.name} — ITF taekwon-do, trening u Splitu (OS „BRDA"). ${site.description}`,
};

// A synchronous (non-async) Server Component — no data to fetch, so
// Next.js statically generates this page at build time by default.
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
        {/* The `prose` class comes from @tailwindcss/typography and styles
            raw HTML / rich text content with sensible typographic defaults.
            `prose-site` layers on project-specific colour overrides. */}
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
              <Link href="/raspored-treninga" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                Treninzi
              </Link>
              ; za poruke{" "}
              <Link href="/kontakt" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                {contactPageLabel}
              </Link>
            </li>
            <li>Odgovarajuća sportska odjeća i boca za vodu</li>
            <li>Otvoren pristup — poštovanje partnera i trenera na prvom je mjestu</li>
          </ul>
        </div>
      </div>
    </div>

    {/* id="treneri" creates an anchor target for in-page hash links (#treneri).
        scroll-mt-24 adds scroll-margin so the section isn't hidden behind
        a sticky header when the browser scrolls to this anchor. */}
    <section id="treneri" className="scroll-mt-24 border-t border-slate-200/80">
      <ClubTrainersSection />
    </section>
    </>
  );
}
