"use client";

import Link from "next/link";
import { CloseDetailsLink } from "@/components/close-details-link";
import { OutsideClickDetails } from "@/components/outside-click-details";
import { loginPath } from "@/config/site";

type Props = {
  memberName: string | null;
  /** Prikazuje se ispod imena kada postoji (noviji kolačići sesije). */
  memberEmail?: string | null;
  /** Poveznica na /admin — samo za prijavljene klupske admine. */
  adminHubVisible?: boolean;
};

async function signOutAndGoToLogin() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!res.ok) return;
  window.location.assign("/login");
}

/** Inicijali za avatar (nema slike profila u sesiji). */
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

/** Desktop: klik na ime otvara izbornik s podacima i odjavom (uzor: Actions Pack / Elementor logout UX). */
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

/** Mobilni izbornik: ime + odjava u istom padajućem izgledu kao ostatak Izbornika */
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
