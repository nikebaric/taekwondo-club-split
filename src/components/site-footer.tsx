import Image from "next/image";
import Link from "next/link";
import { FacebookLogo } from "@/components/facebook-logo";
import { InstagramLogo } from "@/components/instagram-logo";
import { YouTubeLogo } from "@/components/youtube-logo";
import { contactPageLabel, nav, phoneToTelHref, site } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-gradient-to-b from-white from-0% via-[var(--surface-deep)] via-25% to-[var(--surface-deep)]">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:grid-cols-2 sm:px-6 sm:py-20 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Image
              src={site.logo}
              alt=""
              width={48}
              height={48}
              className="mt-0.5 h-12 w-12 shrink-0 object-contain"
            />
            <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-slate-900">
              {site.name.toUpperCase()}
            </p>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--muted)]">{site.description}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Navigacija</p>
          <ul className="mt-4 space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-slate-600 transition-colors duration-200 hover:text-[var(--accent)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Lokacija</p>
          <address className="mt-4 space-y-1 text-sm not-italic leading-relaxed text-slate-600">
            <div>{site.address.venueName}</div>
            <div>{site.address.street}</div>
            <div>
              {site.city}, {site.address.region}, {site.address.country}{" "}
              {site.address.postalCode}
            </div>
          </address>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{contactPageLabel}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {site.phone ? (
              <li>
                <a
                  className="text-slate-600 hover:text-[var(--accent)]"
                  href={`tel:${phoneToTelHref(site.phone)}`}
                >
                  {site.phone}
                </a>
              </li>
            ) : null}
            {site.email ? (
              <li>
                <a className="text-slate-600 hover:text-[var(--accent)]" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </li>
            ) : null}
          </ul>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
            Pratite nas na društvenim mrežama
          </p>
          <ul className="mt-4 flex flex-wrap items-center gap-5">
            <li>
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-slate-700 transition hover:opacity-80"
                
              >
                <FacebookLogo className="h-10 w-10 sm:h-11 sm:w-11" />
              </a>
            </li>
            <li>
              {site.social.instagram ? (
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-slate-700 transition hover:opacity-80"
                  title="Instagram"
                >
                  <InstagramLogo className="h-10 w-10 sm:h-11 sm:w-11" />
                </a>
              ) : (
                <span className="inline-flex opacity-45" title="Instagram — link uskoro">
                  <InstagramLogo className="h-10 w-10 sm:h-11 sm:w-11" />
                </span>
              )}
            </li>
            <li>
              {site.social.youtube ? (
                <a
                  href={site.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-slate-700 transition hover:opacity-80"
                  title="YouTube"
                >
                  <YouTubeLogo className="h-10 w-10 sm:h-11 sm:w-11" />
                </a>
              ) : (
                <span className="inline-flex opacity-45" title="YouTube — link uskoro">
                  <YouTubeLogo className="h-10 w-10 sm:h-11 sm:w-11" />
                </span>
              )}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {site.name}. Sva prava pridržana.
      </div>
    </footer>
  );
}
