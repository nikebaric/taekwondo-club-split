/**
 * src/app/instructors/page.tsx — Client-side redirect (route: /instructors)
 *
 * KEY CONCEPTS:
 * - "use client" DIRECTIVE — this is a CLIENT COMPONENT. The directive
 *   must be the very first line (before imports). It tells the React/Next.js
 *   bundler that this component needs a browser runtime (hooks, events, etc.).
 *   Without it, the component is a Server Component that cannot use
 *   useState, useEffect, useRouter, or any browser API.
 * - CLIENT-SIDE REDIRECT — useEffect + router.replace() performs the
 *   redirect after the component mounts in the browser. `replace` (not
 *   `push`) means the old URL won't appear in the browser history.
 * - WHY not a server redirect? A server-side `redirect()` from next/navigation
 *   could also work here and would be faster (the browser never even loads
 *   this page). This client approach is shown as a learning example, and
 *   also allows a hash fragment (#treneri) which server redirects support
 *   less reliably.
 * - `useRouter` from "next/navigation" (App Router) is different from
 *   the old `useRouter` from "next/router" (Pages Router). Always import
 *   from "next/navigation" in App Router projects.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Stara ruta /instructors — preusmjerava na odjeljak trenera na stranici O klubu. */
export default function InstructorsRedirectPage() {
  // useRouter gives access to the App Router's navigation methods.
  // It only works in Client Components (requires "use client").
  const router = useRouter();

  // useEffect runs AFTER the component mounts in the browser.
  // The empty-ish dependency array [router] means this runs once on mount.
  // router.replace navigates without adding an entry to the history stack.
  useEffect(() => {
    router.replace("/o-klubu#treneri");
  }, [router]);

  // Brief fallback UI shown for the instant before the redirect fires
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center text-sm text-[var(--muted)]">
      Preusmjeravanje na O klubu…
    </div>
  );
}
