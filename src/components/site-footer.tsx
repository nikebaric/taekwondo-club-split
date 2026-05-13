/**
 * SiteFooter — the page footer with navigation, address, contact, and social links.
 *
 * KEY CONCEPTS:
 * - **Server Component**: no "use client" directive, so this runs entirely on the
 *   server. All the HTML is pre-rendered — zero JavaScript is shipped for this component.
 * - **Static UI from config**: all content (address, phone, social links) comes from
 *   a centralized `site` config object. Changing the config updates the footer everywhere.
 * - **Conditional rendering**: social links gracefully degrade — if a URL isn't
 *   configured, a faded/disabled icon is shown instead of a broken link.
 * - **Responsive grid**: Tailwind's `sm:grid-cols-2 lg:grid-cols-4` creates a layout
 *   that adapts from 1 column (mobile) to 4 columns (desktop) without media queries in CSS.
 */
/**
 * SiteFooter — the global footer rendered on every page.
 *
 * KEY CONCEPTS:
 * - **Server Component:** No "use client" — this runs on the server. Since the
 *   footer has no interactivity (no clicks, no state), it doesn't need client JS.
 *   This reduces the JavaScript bundle sent to the browser.
 * - **Static UI with dynamic data:** The footer content comes from a config object
 *   (`site`), making it easy to update contact info, social links, etc. in one place.
 * - **Conditional rendering:** Social links use the `condition ? <element> : <fallback>`
 *   ternary pattern to show a clickable link when available or a greyed-out placeholder
 *   when the URL isn't configured yet.
 */
import Image from "next/image";
import Link from "next/link";
import { FacebookLogo } from "@/components/facebook-logo";
import { InstagramLogo } from "@/components/instagram-logo";
import { YouTubeLogo } from "@/components/youtube-logo";
import { contactPageLabel, nav, phoneToTelHref, site } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-gradient-to-b from-white from-0% via-[var(--surface-deep)] via-25% to-[var(--surface-deep)]">
      {/* CSS Grid with responsive breakpoints — stacks on mobile, 4-column on desktop */}
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
          {/* Rendering from an array keeps the footer in sync with the header nav.
              Single source of truth — add a nav item in config, it appears everywhere. */}
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
          {/* The <address> element is semantic HTML — it tells search engines and
              screen readers that this block contains contact/location information. */}
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
            {/* Conditional rendering pattern: only render the phone/email link if
                the value is configured. `? ... : null` means "show or skip". */}
            {/* Conditional rendering with ternary: only render the phone link if
                site.phone is truthy. `? ... : null` means "render nothing" when false. */}
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
                title="Facebook"
              >
                <FacebookLogo className="h-10 w-10 sm:h-11 sm:w-11" />
              </a>
            </li>
            <li>
              {/* Ternary conditional rendering: if instagram URL exists, render a
                  clickable link; otherwise, render a faded/disabled placeholder. */}
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
      {/* Dynamic year via `new Date().getFullYear()` — since this is a Server Component,
          the year is computed at render time on the server (not in the browser). */}
      {/* new Date().getFullYear() runs on the server at render time, keeping
          the copyright year always current without any client-side JavaScript. */}
      <div className="border-t border-slate-200/80 px-4 py-6 text-center text-xs text-slate-500 sm:px-6">
        <p>© {new Date().getFullYear()} {site.name}. Sva prava pridržana.</p>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-800">Stranicu izradio:</span>{" "}
          Niko Barić, član Taekwondo kluba Split.
        </p>
        <p className="mx-auto mt-1.5 max-w-lg text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Kontakt email:</span>{" "}
          <a
            href="mailto:nikebaric@gmail.com"
            className="font-medium text-[var(--accent)] underline decoration-[var(--accent)]/35 underline-offset-[3px] transition hover:decoration-[var(--accent)]"
          >
            nikebaric@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
}
