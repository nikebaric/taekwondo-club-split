/**
 * SiteHeader — the main navigation bar for the site.
 *
 * KEY CONCEPTS:
 * - **Server Component** (default in Next.js App Router): no "use client" directive,
 *   so this component runs on the server. It can directly `await` async functions
 *   like `getMemberSession()` — something Client Components cannot do.
 * - **Composition pattern**: this component assembles smaller, specialized components
 *   (HeaderAccount, OutsideClickDetails, CloseDetailsLink) rather than implementing
 *   everything itself. This keeps each piece focused and testable.
 * - **Server-to-Client data flow**: the server fetches auth data, then passes it as
 *   props to Client Components (HeaderAccount). This is the recommended pattern —
 *   fetch on the server, render interactivity on the client.
 * - **Responsive design**: Tailwind's `hidden lg:flex` / `lg:hidden` breakpoints
 *   swap between a desktop nav and a mobile hamburger menu without JavaScript.
 */
import Image from "next/image";
import Link from "next/link";
import { CloseDetailsLink } from "@/components/close-details-link";
import { HeaderAccount, HeaderAccountMobile } from "@/components/header-account";
import { OutsideClickDetails } from "@/components/outside-click-details";
import { getMemberSession, isAdminSession } from "@/lib/auth-check";
import { nav, site } from "@/config/site";

// This is an async Server Component — it can use `await` at the top level.
// Next.js will wait for the data before sending the HTML to the browser.
export async function SiteHeader() {
  // Server-side data fetching: session data is read from cookies on the server.
  // The result is never exposed to the client bundle — only the rendered HTML is sent.
  const session = await getMemberSession();
  const memberName = session?.name ?? null;
  const memberEmail = session?.email ?? null;
  const adminHubVisible = await isAdminSession();

  return (
    // `sticky top-0 z-50` pins the header to the viewport top on scroll.
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="mx-auto flex w-full max-w-[min(100%,90rem)] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:gap-5">
        {/* Next.js <Link> enables client-side navigation — clicking this won't do
            a full page reload. It prefetches the target route for instant transitions. */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-lg outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35 sm:gap-3.5"
        >
          {/* next/image automatically optimizes images: resizes, converts to modern
              formats (WebP/AVIF), and lazy-loads by default. `priority` disables
              lazy-loading for above-the-fold images like the logo. */}
          <Image
            src={site.logo}
            alt=""
            width={56}
            height={56}
            className="h-11 w-11 shrink-0 object-contain sm:h-14 sm:w-14"
            priority
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-slate-900 sm:text-2xl">
              {site.brand.line1.toUpperCase()}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--muted)] sm:text-[11px] sm:tracking-[0.35em]">
              {site.brand.line2}
            </span>
          </div>
        </Link>
        {/* Desktop navigation — hidden on mobile (`hidden lg:flex`).
            .map() renders a list from an array — each item needs a unique `key` prop
            so React can efficiently track which items changed during re-renders. */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative whitespace-nowrap rounded-md px-2 py-2 text-[13px] font-medium text-slate-600 transition-colors duration-200 after:pointer-events-none after:absolute after:inset-x-2 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--accent)] after:transition-transform hover:bg-slate-100/80 hover:text-slate-900 hover:after:scale-x-100 xl:px-2.5 xl:text-sm xl:after:inset-x-2.5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Server-fetched data (memberName, adminHubVisible) is passed as props
              to the Client Component. This is the "server-fetches, client-renders" pattern. */}
          <HeaderAccount
            memberName={memberName}
            memberEmail={memberEmail}
            adminHubVisible={adminHubVisible}
          />
          <MobileNav
            memberEmail={memberEmail}
            memberName={memberName}
            adminHubVisible={adminHubVisible}
          />
        </div>
      </div>
    </header>
  );
}

/**
 * MobileNav — mobile hamburger menu, rendered only on small screens.
 *
 * Uses the native HTML `<details>/<summary>` element (via OutsideClickDetails)
 * for toggle behavior without extra state management. This is a progressive
 * enhancement pattern — the menu works even if JavaScript fails to load.
 *
 * The inline type annotation `{ memberName: string | null; ... }` is a TypeScript
 * pattern for defining props directly without a separate `type` or `interface`.
 * Useful when the props shape is only needed in one place.
 */
function MobileNav({
  memberName,
  memberEmail,
  adminHubVisible,
}: {
  memberName: string | null;
  memberEmail: string | null;
  adminHubVisible: boolean;
}) {
  // lg:hidden hides this on desktop; OutsideClickDetails is a Client Component
  // that wraps a <details> element and closes it on outside clicks.
  return (
    <OutsideClickDetails className="relative lg:hidden">
      <summary className="list-none cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
        Izbornik
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-2 shadow-xl">
        {nav.map((item) => (
          <CloseDetailsLink
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            {item.label}
          </CloseDetailsLink>
        ))}
        {/* Conditional rendering: the admin link only appears if the user has admin privileges.
            Using `? ... : null` is a common React pattern for "render or nothing". */}
        {adminHubVisible ? (
          <CloseDetailsLink
            href="/admin"
            className="block rounded-md px-3 py-2 text-sm font-semibold text-[var(--accent)] hover:bg-slate-100"
          >
            Administracija
          </CloseDetailsLink>
        ) : null}
        <HeaderAccountMobile memberName={memberName} memberEmail={memberEmail} />
      </div>
    </OutsideClickDetails>
  );
}
