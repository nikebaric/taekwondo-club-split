/**
 * LoginForm — handles user authentication via email and password.
 *
 * KEY CONCEPTS:
 * - **Controlled inputs:** Each input's `value` is tied to state (`email`, `password`),
 *   and `onChange` updates that state. React controls the input value at all times.
 *   This pattern gives you full control over input data (for validation, formatting, etc.).
 * - **Error state management:** A nullable error string (`string | null`) holds the
 *   current error message. Setting it to `null` clears any previous error.
 * - **window.location.assign vs router.push:** After login, a full page navigation is
 *   used instead of Next.js router.push. This forces the browser to re-read cookies
 *   and make a fresh server request — important because the session cookie was just set
 *   and client-side navigation might not pick it up (especially on mobile Safari).
 * - **try/catch/finally pattern:** `finally` runs whether the request succeeded or
 *   failed, ensuring `setPending(false)` always executes (no stuck loading state).
 * - **`credentials: "same-origin"`:** Tells fetch to include cookies in the request,
 *   ensuring the server can set a session cookie in the response.
 */
"use client";

import { useState } from "react";
type Props = { nextPath: string };

export function LoginForm({ nextPath }: Props) {
  // Controlled inputs: React state is the "source of truth" for each field.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // `string | null` union: null = no error, string = error message to display.
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);  // clear previous errors on new submission
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `credentials: "same-origin"` ensures cookies are sent/received with this request.
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Prijava nije uspjela.");
        return;
      }
      // window.location.assign() triggers a full page reload (not client-side navigation).
      // This ensures the server sees the newly-set session cookie on the next request.
      // router.push() would do a client-side transition that might miss the new cookie.
      window.location.assign(nextPath);
    } catch {
      setError("Mrežna greška. Pokušajte ponovno.");
    } finally {
      // `finally` always runs — prevents the button from getting stuck in loading state.
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
