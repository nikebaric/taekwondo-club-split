import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { SectionHeading } from "@/components/section-heading";
import { contactPageLabel, formatClubAddressSingleLine, phoneToTelHref, site } from "@/config/site";

export const metadata: Metadata = {
  title: contactPageLabel,
  description: `${contactPageLabel} — ${site.name}: telefon i obrazac za upit. Adresa i raspored treninga na stranici Treninzi.`,
};

function contactJsonLd() {
  const streetAddress = formatClubAddressSingleLine();
  const sameAs = [site.social.facebook, site.social.instagram, site.social.youtube].filter(
    (u) => String(u).length > 0,
  );
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: site.name,
    description: site.description,
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/contact` : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      addressLocality: site.city,
      postalCode: site.address.postalCode,
      addressRegion: site.address.region,
      addressCountry: "HR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.5195,
      longitude: 16.468,
    },
    sameAs,
  };
  return JSON.stringify(schema);
}

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: contactJsonLd() }} />

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <SectionHeading eyebrow={contactPageLabel} title="Javite nam se" />

        {(site.phone || site.email) ? (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-[var(--surface)] p-8 shadow-sm">
            {site.phone ? (
              <div className={site.email ? "border-b border-slate-200 pb-8" : ""}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Telefon</p>
                <a
                  className="mt-2 block text-lg text-slate-900 hover:text-[var(--accent)]"
                  href={`tel:${phoneToTelHref(site.phone)}`}
                >
                  {site.phone}
                </a>
              </div>
            ) : null}
            {site.email ? (
              <div className={site.phone ? "pt-8" : ""}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">E-mail</p>
                <a className="mt-2 block text-lg text-slate-900 hover:text-[var(--accent)]" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-12 rounded-2xl border border-slate-200 bg-[var(--surface)] p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Upit e-mailom</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900">
            Pišite nam
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Ispunite obrazac za slanje poruke — odgovor stiže na adresu koju navedete.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
