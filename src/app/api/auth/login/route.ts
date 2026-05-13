/**
 * Next.js Route Handler — POST /api/auth/login
 *
 * KEY CONCEPTS:
 * - **Route Handlers** replace the old `pages/api/*` pattern. A file named `route.ts`
 *   inside `app/api/…` automatically becomes an API endpoint. The HTTP method is determined
 *   by the name of the exported function (POST, GET, PUT, DELETE, PATCH, etc.).
 * - **NextResponse** is the framework's extension of the standard Web `Response`, adding
 *   convenience helpers like `.json()` and `.cookies.set()`.
 * - **Cookie-based sessions**: After verifying credentials, the server creates an
 *   HMAC-signed token and stores it in an httpOnly cookie. The browser sends the cookie
 *   on every subsequent request, so the server can identify the user without a separate
 *   Authorization header.
 * - **request.json()** parses the raw HTTP body as JSON — always wrap it in try/catch
 *   because the client might send invalid data.
 */
import { NextResponse } from "next/server";
import { hasClubAdminCredentialsConfigured, matchClubAdmin } from "@/lib/club-admins";
import { sessionCookieName, sessionCookieOptions, signSession } from "@/lib/session";

/**
 * Exporting an `async function POST` tells Next.js this route responds to HTTP POST.
 * The `request` parameter is the standard Web API `Request` object — Next.js passes
 * it automatically. There is no need for Express-style `(req, res)`.
 */
export async function POST(request: Request) {
  // Guard: if no admin credentials are configured in .env, return 503 (Service Unavailable)
  if (!hasClubAdminCredentialsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Postavite barem jedan par ADMIN_EMAIL/ADMIN_PASSWORD_HASH ili ADMIN2_EMAIL/ADMIN2_PASSWORD_HASH u .env. Pogledajte .env.example.",
      },
      { status: 503 },
    );
  }

  // Safely parse the JSON body — `request.json()` returns a Promise that rejects on
  // malformed JSON. Typing as `unknown` forces us to validate before using the data
  // (a TypeScript best practice for untrusted input).
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neispravan JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "Neispravan JSON." }, { status: 400 });
  }
  // TypeScript `as` assertion: we've validated body is an object, now we tell the
  // compiler what shape to expect. The `?` means these keys might be missing.
  const b = body as { email?: unknown; password?: unknown };
  const email = typeof b.email === "string" ? b.email : "";
  const password = typeof b.password === "string" ? b.password : "";

  const match = await matchClubAdmin(email, password);
  if (!match) {
    return NextResponse.json({ ok: false, error: "Neispravan e-mail ili lozinka." }, { status: 401 });
  }

  // Create a signed session token (HMAC-SHA256) and store it in an httpOnly cookie.
  // httpOnly cookies cannot be read by client-side JavaScript (document.cookie),
  // which protects against XSS attacks stealing session tokens.
  const token = signSession(match.displayName, match.emailNormalized);
  const res = NextResponse.json({ ok: true });
  // `res.cookies.set()` is a Next.js convenience that adds a Set-Cookie header.
  // `sessionCookieOptions` configures httpOnly, sameSite, secure, path, and maxAge.
  res.cookies.set(sessionCookieName(), token, sessionCookieOptions(request));
  return res;
}
