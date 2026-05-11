/**
 * ContactForm — an interactive contact form with async submission.
 *
 * KEY CONCEPTS:
 * - **"use client" directive**: marks this as a Client Component. It runs in the
 *   browser (and is pre-rendered on the server for the initial HTML). Required
 *   because this component uses React hooks (useState) and event handlers.
 * - **useState for form state**: tracks submission status (idle/loading/success/error)
 *   and error messages. When state changes, React re-renders only this component.
 * - **Uncontrolled inputs with FormData**: inputs use `name` attributes instead of
 *   `value`+`onChange` (controlled). The FormData API reads values on submit —
 *   simpler when you don't need real-time validation.
 * - **Async event handler**: `onSubmit` is async so we can `await fetch()`.
 *   `e.preventDefault()` stops the browser's default form submission (full page reload).
 * - **fetch() to API route**: sends JSON to `/api/contact` — a Next.js Route Handler
 *   that processes the email on the server. This keeps secrets (SMTP credentials) safe.
 */
"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

export function ContactForm() {
  // Union type "idle" | "loading" | "success" | "error" restricts state to
  // exactly four values — TypeScript will error if you set an invalid status.
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Async event handler — React supports async handlers, but you must
  // call `e.preventDefault()` synchronously (before any `await`).
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    // `e.currentTarget` refers to the <form> element. We grab it before `await`
    // because React may nullify the event after the handler yields.
    const form = e.currentTarget;
    // FormData extracts values from named inputs — no need for controlled state on each field.
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      message: String(data.get("message") ?? ""),
    };
    try {
      // fetch() calls the Next.js API route — same origin, no CORS needed.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setStatus("error");
        setMessage(body.error ?? "Dogodila se greška.");
        return;
      }
      setStatus("success");
      // form.reset() clears all inputs back to their initial values.
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Mrežna greška. Pokušajte ponovno.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Ime i prezime</span>
          <input name="name" required autoComplete="name" className={inputClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">E-mail</span>
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Telefon (opcionalno)</span>
        <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
      </label>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Poruka</span>
        <textarea name="message" required rows={5} className={`${inputClass} resize-y`} />
      </label>
      {/* `disabled` prevents double-submission while the request is in flight.
          The button text changes to provide loading feedback. */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-4px_var(--accent-glow)] transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Šaljem…" : "Pošalji poruku"}
      </button>
      {/* `role="status"` and `role="alert"` are ARIA roles — they announce the
          message to screen readers without requiring focus. */}
      {status === "success" ? (
        <p className="text-sm text-emerald-700" role="status">
          Hvala — javit ćemo vam se uskoro.
        </p>
      ) : null}
      {status === "error" && message ? (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
