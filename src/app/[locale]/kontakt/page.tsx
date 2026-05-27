import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { SectionHeading } from "@/components/section-heading";
import { site, formatClubAddressSingleLine, phoneToTelHref } from "@/config/site";
import { getPageLocale } from "@/i18n/locale";
import { resolveSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getPageLocale(params);
  return {
    title: t.contact.title,
    description: `${t.contact.title} — ${t.meta.siteName}: ${t.contact.metaDescription}. ${t.contact.metaDescriptionSuffix}`,
  };
}

function contactJsonLd(siteName: string, description: string) {
  const streetAddress = formatClubAddressSingleLine();
  const sameAs = [site.social.facebook, site.social.instagram, site.social.youtube].filter(
    (u) => String(u).length > 0,
  );
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: siteName,
    description,
    url: `${resolveSiteUrl()}/kontakt`,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      addressLocality: site.city,
      postalCode: site.address.postalCode,
      addressRegion: site.address.region,
      addressCountry: "HR",
    },
    geo: { "@type": "GeoCoordinates", latitude: 43.5195, longitude: 16.468 },
    sameAs,
  });
}

export default async function ContactPage({ params }: Props) {
  const { t } = await getPageLocale(params);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: contactJsonLd(t.meta.siteName, t.meta.description) }} />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <SectionHeading eyebrow={t.contact.title} title={t.contact.heading} />
        {(site.phone || site.email) ? (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-[var(--surface)] p-8 shadow-sm">
            {site.phone ? (
              <div className={site.email ? "border-b border-slate-200 pb-8" : ""}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{t.contact.phone}</p>
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{t.contact.email}</p>
                <a className="mt-2 block text-lg text-slate-900 hover:text-[var(--accent)]" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-[var(--surface)] p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{t.contact.formEyebrow}</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900">
            {t.contact.formTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{t.contact.formIntro}</p>
          <div className="mt-8">
            <ContactForm labels={t.contact.form} />
          </div>
        </div>
      </div>
    </>
  );
}
