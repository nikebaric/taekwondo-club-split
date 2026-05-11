/**
 * src/app/login/page.tsx — Login page (route: /login)
 *
 * KEY CONCEPTS:
 * - SERVER-SIDE AUTH CHECK — this async Server Component reads the session
 *   cookie on the server BEFORE rendering. If the user is already logged in,
 *   `redirect()` sends a 307 redirect response — the browser never even
 *   receives the login page HTML. This is more secure and faster than
 *   checking auth on the client with useEffect.
 * - `cookies()` from "next/headers" — a server-only API that reads the
 *   incoming HTTP cookies. It's async in Next.js 15+ (returns a Promise).
 *   It only works in Server Components and Route Handlers, never in
 *   Client Components.
 * - `redirect()` from "next/navigation" — when called in a Server Component,
 *   it throws internally (similar to notFound()) and instructs Next.js to
 *   send an HTTP redirect response. It never returns.
 * - `searchParams` is a Promise in Next.js 15+ (like `params`). The
 *   `?next=/admin/edit` query parameter tells the page where to redirect
 *   after login — a common "return URL" pattern.
 * - Mixing Server and Client: the page is a Server Component that renders
 *   `<LoginForm>` (a Client Component) only when the user is NOT logged in.
 */
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookieName, verifySessionToken } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Prijava korisnika",
  description: "Prijava članova kluba za pristup klupskim novostima.",
};

type Props = {
  // searchParams (query string values like ?next=/admin) is a Promise
  // in Next.js 15+. The value can be a string or string[] when the same
  // key appears multiple times (?next=/a&next=/b).
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: Props) {
  // Await and parse the "next" query parameter for post-login redirect
  const sp = await searchParams;
  const raw = sp.next;
  const nextRaw = Array.isArray(raw) ? raw[0] : raw;
  // Security: only allow relative paths starting with "/" (not "//")
  // to prevent open-redirect attacks to external domains
  const nextPath =
    typeof nextRaw === "string" && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : "/admin";

  // Server-side session check: read the cookie, verify the token.
  // This runs on the server — the token never reaches the browser.
  const c = await cookies();
  if (verifySessionToken(c.get(sessionCookieName())?.value)) {
    // Already logged in — redirect immediately (HTTP 307).
    // redirect() throws internally and never returns.
    redirect(nextPath);
  }

  // User is NOT logged in — render the login form (Client Component)
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:py-28">
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
