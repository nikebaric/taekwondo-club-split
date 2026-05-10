import Image from "next/image";
import Link from "next/link";
import { HomeClubPhotoStrip } from "@/components/home-club-photo-strip";
import { SectionHeading } from "@/components/section-heading";
import { newsPortalCopy } from "@/config/news-portal";
import { placeholders } from "@/config/placeholders";
import { contactPageLabel, phoneToTelHref, site } from "@/config/site";
import { fetchNewsPosts } from "@/lib/news-queries";
import { getListingCover, stripHtml } from "@/lib/news-post";

export default async function Home() {
  const latestPosts = await fetchNewsPosts(6);

  const programCards = [
    {
      title: "Djeca i juniori",
      body: "Fokus, koordinacija i poštovanje — temelji koji ostaju i izvan prostorije za trening.",
      href: "/programs",
      src: placeholders.programs.djeca,
      alt: "Djeca na treningu u dvorani Osnovne škole BRDA",
    },
    {
      title: "Odrasli",
      body: "Kondicija, tehnička izvedba i po želji natjecateljski put — termini prilagođeni odraslima.",
      href: "/programs",
      src: placeholders.programs.odrasli,
      alt: "Treneri i majstori kluba u doboku na tatamiju",
    },
  ];

  return (
    <>
      <section className="relative min-h-[min(92vh,840px)] overflow-hidden border-b border-slate-200/80">
        <Image
          src={placeholders.hero}
          alt="Članovi kluba u doboku nakon polaganja pojaseva"
          fill
          priority
          className="object-cover object-[center_45%]"
          sizes="100vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/78 via-black/[0.48] to-[var(--background)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(29,78,216,0.15),transparent_55%)]" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-14 px-4 pb-28 pt-28 sm:gap-16 sm:px-6 sm:pb-36 sm:pt-36 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--brand-gold)]">
              {site.tagline}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[0.94] tracking-[0.06em] text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-7xl">
              SAMOPOUZDANJE KROZ TRADICIJSKI TAEKWONDO
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-zinc-200/95">
              Trening je namijenjen djeci i odraslima — od početnika do viših pojaseva. Tehnika, poomsae
              i kontrolirano sparingovanje u sigurnom i poštovanjem ispunjenom okruženju.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex max-w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3.5 text-center text-xs font-semibold leading-snug text-white shadow-[0_0_28px_-6px_var(--accent-glow)] transition hover:brightness-110 active:scale-[0.98] sm:px-6 sm:text-sm"
              >
                {contactPageLabel}
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/[0.09] px-6 py-3.5 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white/[0.16] active:scale-[0.98]"
              >
                Pregled programa
              </Link>
            </div>
          </div>
          <Link
            href="/uspjesi"
            aria-label="Rezultati — medalje i pojedinačni plasmani"
            className="group block w-full max-w-md rounded-2xl border border-white/70 bg-white/[0.97] p-7 shadow-[var(--shadow-card-hover)] ring-1 ring-slate-900/[0.06] backdrop-blur-md transition hover:ring-2 hover:ring-[var(--accent)]/35 lg:w-auto"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
              Rezultati kluba
            </p>
            <dl className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center sm:text-left">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                  Zlatne
                </dt>
                <dd className="mt-1 font-[family-name:var(--font-display)] text-3xl tabular-nums tracking-wide text-slate-900">
                  {site.medalStats.gold}
                </dd>
              </div>
              <div className="text-center sm:text-left">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Srebrne
                </dt>
                <dd className="mt-1 font-[family-name:var(--font-display)] text-3xl tabular-nums tracking-wide text-slate-900">
                  {site.medalStats.silver}
                </dd>
              </div>
              <div className="text-center sm:text-left">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                  Brončane
                </dt>
                <dd className="mt-1 font-[family-name:var(--font-display)] text-3xl tabular-nums tracking-wide text-slate-900">
                  {site.medalStats.bronze}
                </dd>
              </div>
            </dl>
            {site.medalStats.footnote ? (
              <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
                {site.medalStats.footnote}
              </p>
            ) : null}
            <p className="mt-4 text-sm font-semibold text-[var(--accent)] group-hover:underline">
              Rezultati →
            </p>
          </Link>
        </div>
      </section>

      <section className="border-b border-slate-200/70 bg-[var(--surface-muted)] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="U klubu" title="Trening, disciplina, zajednica" />
          <div className="mt-12">
            <HomeClubPhotoStrip />
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/galerija"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--accent)] shadow-[var(--shadow-sm)] transition hover:border-[var(--accent)]/30 hover:bg-slate-50 hover:shadow-[var(--shadow-card)]"
            >
              Pogledaj galeriju treninga i videozapise
              <span aria-hidden className="text-base leading-none">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28">
        <SectionHeading
          eyebrow="Programi"
          title="Djeca i odrasli"
          subtitle="Dva glavna programa — kondicija, tehnika i odgojne vrijednosti, prilagođeno dobnim skupinama."
        />
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {programCards.map((card) => (
            <article
              key={card.title}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="relative aspect-[16/11] overflow-hidden bg-slate-200">
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width:768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent opacity-90" />
              </div>
              <div className="p-8 pt-6">
                <h3 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{card.body}</p>
                <Link
                  href={card.href}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition hover:gap-2"
                >
                  Saznaj više <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-[var(--surface-muted)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 shadow-sm lg:order-2">
            <Image
              src="/galerija/trening-os-brda-dvorana.png"
              alt={`Dvorana za trening — ${site.address.venueName}, ${site.city}`}
              fill
              className="object-cover object-center"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
          </div>
          <div className="max-w-xl lg:order-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-gold)]">
              Upisi
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-950 sm:text-4xl">
              Novi članovi — djeca i odrasli
            </h2>
            <div className="mt-4 h-px w-14 bg-gradient-to-r from-transparent via-[var(--brand-gold)]/45 to-transparent lg:mx-0" aria-hidden />
            <p className="mt-6 leading-relaxed text-[var(--muted)]">
              Svakodnevno vršimo upise djece i odraslih. Trening se odvija u dvorani u Osnovnoj školi „BRDA“.               Za više informacija pogledajte{" "}
              <Link href="/contact" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                {contactPageLabel}
              </Link>
              , a adresu dvorane i raspored na{" "}
              <Link href="/schedule" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                Treninzi
              </Link>
              .
            </p>
            <div className="mt-6 rounded-2xl border border-[var(--brand-gold)]/30 bg-[var(--brand-gold-soft)] px-5 py-5 shadow-[var(--shadow-sm)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
                Nazovite za upise
              </p>
              <a
                href={`tel:${phoneToTelHref(site.phone)}`}
                className="mt-3 block font-[family-name:var(--font-display)] text-2xl tracking-wide text-slate-900 hover:text-[var(--accent)] sm:text-3xl"
              >
                {site.phone}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-center text-xs font-semibold leading-snug text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110 sm:px-8 sm:text-sm"
              >
                {contactPageLabel}
              </Link>
              <Link
                href="/schedule"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Treninzi
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28">
        <SectionHeading
          eyebrow={newsPortalCopy.homeEyebrow}
          title={newsPortalCopy.homeTitle}
          subtitle={newsPortalCopy.homeSubtitle}
        />
        {latestPosts.length === 0 ? (
          <p className="mx-auto mt-10 max-w-2xl text-center text-[var(--muted)]">
            {newsPortalCopy.emptyPosts}
          </p>
        ) : (
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => {
              const cover = getListingCover(post);
              return (
                <li key={post.id}>
                  <Link
                    href={`/news/${post.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/35 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="relative aspect-[16/10] bg-slate-200">
                      {cover?.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover.src}
                          alt={cover.alt || ""}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : cover?.kind === "video" ? (
                        <video
                          src={cover.src}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          aria-label="Video novost"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
                          Bez slike
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        {new Date(post.date).toLocaleDateString("hr-HR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <h3
                        className="mt-2 font-semibold text-slate-900 group-hover:text-[var(--accent)]"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                        {stripHtml(post.excerpt.rendered)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
