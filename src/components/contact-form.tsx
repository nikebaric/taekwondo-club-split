"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      message: String(data.get("message") ?? ""),
    };
    try {
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
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-4px_var(--accent-glow)] transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Šaljem…" : "Pošalji poruku"}
      </button>
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
