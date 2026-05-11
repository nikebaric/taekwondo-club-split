/**
 * HeaderAccount — user account menu for the site header.
 *
 * KEY CONCEPTS:
 * - **Client Component ("use client"):** Needed for click handlers, dropdown
 *   interactivity, and DOM manipulation (closing <details> elements).
 * - **Conditional rendering based on auth state:** The component renders completely
 *   different UIs depending on whether `memberName` is set (logged in) or null
 *   (logged out). This is a common React pattern for auth-aware components.
 * - **Dropdown menu pattern:** Uses native `<details>/<summary>` for the toggle,
 *   enhanced with OutsideClickDetails to close on outside clicks. No state needed
 *   for open/close — the browser handles it natively.
 * - **Two exports for responsive design:** HeaderAccount (desktop) and
 *   HeaderAccountMobile share the same Props type but render different layouts.
 * - **`void` keyword with async:** `void signOutAndGoToLogin()` explicitly discards
 *   the Promise return value, signaling to ESLint that unhandled rejection is intentional.
 */
"use client";

import Link from "next/link";
import { CloseDetailsLink } from "@/components/close-details-link";
import { OutsideClickDetails } from "@/components/outside-click-details";
import { loginPath } from "@/config/site";

// TypeScript type for props shared between HeaderAccount and HeaderAccountMobile.
// `string | null` is a union type — memberName is either a string or null.
type Props = {
  memberName: string | null;
  /** Displayed below the name when available (newer session cookies). */
  memberEmail?: string | null;
  /** Link to /admin — only visible to logged-in club admins. */
  adminHubVisible?: boolean;
};

// Standalone async function (not a hook) — can be called from event handlers.
// Uses fetch() to call the logout API, then does a full page navigation.
async function signOutAndGoToLogin() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!res.ok) return;
  // window.location.assign() triggers a full page navigation (not client-side).
  // This ensures the browser re-reads cookies and the server sees the new auth state.
  window.location.assign("/prijava");
}

/** Initials for the avatar (no profile picture in the session). */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? "";
    const b = parts[parts.length - 1]?.[0] ?? "";
    return (a + b).toUpperCase();
  }
  const w = parts[0] ?? "";
  return (w.length >= 2 ? w.slice(0, 2) : w.slice(0, 1)).toUpperCase();
}

function MemberAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = initialsFromName(name);
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-[10px]"
      : size === "lg"
        ? "h-12 w-12 text-base"
        : "h-9 w-9 text-xs";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-slate-700 font-bold tabular-nums text-white shadow-inner ring-2 ring-white/25 ${sizeClass}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

function ChevronDown() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * Desktop account menu: shows user info + sign-out when logged in, or a login button.
 *
 * The if/else pattern here is a **conditional rendering** approach — the component
 * returns entirely different JSX trees based on the auth state. This is cleaner
 * than hiding elements with CSS when the two states have very different markup.
 */
export function HeaderAccount({ memberName, memberEmail, adminHubVisible }: Props) {
  if (memberName) {
    const email = memberEmail?.trim() || null;

    return (
      <div className="hidden lg:block">
        <OutsideClickDetails className="group relative">
          <summary
            className="flex cursor-pointer list-none items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100/90 [&::-webkit-details-marker]:hidden"
            aria-label={`${memberName} — korisnički izbornik`}
          >
            <MemberAvatar name={memberName} />
            <span
              className="min-w-0 max-w-[min(100%,18rem)] truncate xl:max-w-[min(100%,22rem)]"
              title={memberName}
            >
              {memberName}
            </span>
            <ChevronDown />
          </summary>
          <div className="absolute right-0 z-[60] mt-2 w-64 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] py-2 shadow-xl">
            <div className="border-b border-slate-100 px-3 pb-3">
              <div className="flex items-start gap-3">
                <MemberAvatar name={memberName} size="lg" />
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prijavljeni član</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900" title={memberName}>
                    {memberName}
                  </p>
                </div>
              </div>
              {email ? (
                <p className="mt-0.5 truncate text-xs text-[var(--muted)]" title={email}>
                  {email}
                </p>
              ) : null}
            </div>
            {adminHubVisible ? (
              <CloseDetailsLink
                href="/admin"
                className="block px-3 py-2.5 text-left text-sm font-semibold text-[var(--accent)] transition hover:bg-slate-100"
              >
                Administracija
              </CloseDetailsLink>
            ) : null}
            {/* DOM manipulation in React: `.closest("details")` walks up the DOM tree
                to find the parent <details> and closes it before signing out.
                `as HTMLElement` is a TypeScript type assertion — React's event target
                type is more generic, so we narrow it to access DOM methods. */}
            <button
              type="button"
              onClick={(e) => {
                const details = (e.currentTarget as HTMLElement).closest("details");
                if (details) details.open = false;
                void signOutAndGoToLogin();
              }}
              className="mt-1 w-full px-3 py-2.5 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Odjavi se
            </button>
          </div>
        </OutsideClickDetails>
      </div>
    );
  }

  return (
    <Link
      href={loginPath}
      className="hidden max-w-[13rem] rounded-full border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold leading-snug text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 lg:inline-flex lg:max-w-none lg:px-4 lg:text-sm"
    >
      Prijava korisnika
    </Link>
  );
}

/** Mobile menu: name + sign-out in the same dropdown layout as the rest of the menu. */
export function HeaderAccountMobile({ memberName, memberEmail }: Props) {
  if (memberName) {
    const email = memberEmail?.trim() || null;

    return (
      <div className="mt-2 border-t border-slate-200 pt-2">
        <div className="flex items-center gap-3 px-3 pb-2">
          <MemberAvatar name={memberName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Prijavljeni član</p>
            <p className="truncate text-sm font-semibold text-slate-900" title={memberName}>
              {memberName}
            </p>
          </div>
        </div>
        {email ? (
          <p className="truncate px-3 pb-2 text-xs text-[var(--muted)]" title={email}>
            {email}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void signOutAndGoToLogin()}
          className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          Odjavi se
        </button>
      </div>
    );
  }

  return (
    <Link
      href={loginPath}
      className="mt-2 block rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
    >
      Prijava korisnika
    </Link>
  );
}
