"use client";

import { useState } from "react";
type Props = { nextPath: string };

export function LoginForm({ nextPath }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Prijava nije uspjela.");
        return;
      }
      /* Puna navigacija: na mobitelu (npr. Safari) sljedeći RSC zahtjev nakon fetch-a ponekad ne vidi novi kolačić. */
      window.location.assign(nextPath);
    } catch {
      setError("Mrežna greška. Pokušajte ponovno.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Prijava korisnika
      </h1>
      <form onSubmit={onSubmit} className="mt-10 space-y-5 text-left">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-800">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 transition focus:border-[var(--accent)] focus:ring-2"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-800">
            Lozinka
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 transition focus:border-[var(--accent)] focus:ring-2"
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Prijava korisnika…" : "Prijava korisnika"}
        </button>
      </form>
    </>
  );
}
