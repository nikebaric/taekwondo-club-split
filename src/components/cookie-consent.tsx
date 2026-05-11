"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent-accepted";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

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
