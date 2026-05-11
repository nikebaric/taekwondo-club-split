/**
 * CookieConsent — a dismissable banner for cookie/privacy consent.
 *
 * KEY CONCEPTS:
 * - **Client Component ("use client"):** Required because this component uses
 *   browser-only APIs (localStorage) and React hooks (useState, useEffect).
 * - **useEffect for side effects:** The effect runs once after the first render
 *   (empty dependency array `[]`) to check localStorage. This avoids a hydration
 *   mismatch — the server can't access localStorage, so we start with `visible=false`
 *   and only show the banner after the client-side check.
 * - **Conditional rendering with early return:** `if (!visible) return null;`
 *   short-circuits the component — React renders nothing. This is cleaner than
 *   wrapping the entire JSX in a conditional.
 * - **localStorage for persistence:** A simple key-value store in the browser.
 *   Once the user accepts, we store a flag so the banner never reappears.
 */
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent-accepted";

export function CookieConsent() {
  // Start hidden to match server-rendered HTML (server doesn't know localStorage).
  const [visible, setVisible] = useState(false);

  // useEffect runs AFTER the component mounts in the browser.
  // The empty dependency array [] means "run once on mount, never re-run."
  // This is the right place for browser-only APIs like localStorage.
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  // Early return pattern: if not visible, render nothing (null).
  // React treats null as "don't render any DOM element."
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white/95 px-6 py-5 shadow-lg backdrop-blur-sm sm:flex-row sm:gap-6">
        <p className="text-center text-sm leading-relaxed text-slate-600 sm:text-left">
          Ova stranica koristi isključivo tehničke kolačiće nužne za rad
          sustava. Ne prikupljamo osobne podatke niti koristimo kolačiće za
          praćenje ili oglašavanje.
        </p>
        <button
          onClick={accept}
          className="shrink-0 cursor-pointer rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-800 hover:shadow-md active:scale-[0.97]"
        >
          Prihvaćam
        </button>
      </div>
    </div>
  );
}
