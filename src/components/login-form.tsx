"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/hr";

type Props = {
  nextPath: string;
  labels: Dictionary["login"];
};

export function LoginForm({ nextPath, labels }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        setError(data.error ?? labels.failed);
        return;
      }
      window.location.assign(nextPath);
    } catch {
      setError(labels.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        {labels.title}
      </h1>
      <form onSubmit={onSubmit} className="mx-auto mt-10 w-full max-w-xs space-y-4 text-left sm:max-w-sm">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-800">
            {labels.emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 transition focus:border-[var(--accent)] focus:ring-2"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-800">
            {labels.passwordLabel}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 transition focus:border-[var(--accent)] focus:ring-2"
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex justify-center pt-1">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[var(--accent)] px-8 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? labels.submitting : labels.submit}
          </button>
        </div>
      </form>
    </>
  );
}
