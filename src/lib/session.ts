/**
 * Session management — HMAC-SHA256 token signing and cookie configuration.
 *
 * KEY CONCEPTS:
 * - **HMAC-SHA256 for session tokens**: Instead of using a JWT library (like `jsonwebtoken`),
 *   this module implements a minimal token format: `base64url(payload).hmac_signature`.
 *   HMAC (Hash-based Message Authentication Code) ensures the payload hasn't been tampered
 *   with — only the server (which knows the secret) can produce a valid signature.
 * - **Why not just a random token?** Random tokens require a database lookup on every
 *   request to check validity. HMAC tokens are self-contained — the server can verify
 *   them by recalculating the signature, no database needed.
 * - **Node.js `crypto` module**: Built-in cryptographic functions — `createHmac` for
 *   signing, `timingSafeEqual` for constant-time comparison (prevents timing attacks).
 * - **Cookie security options**: httpOnly prevents XSS (JavaScript can't read the cookie),
 *   sameSite="lax" prevents CSRF, secure ensures the cookie is only sent over HTTPS.
 * - **Token structure**: `base64url(JSON payload) . base64url(HMAC signature)` — similar
 *   to JWT but without the header segment, since we always use the same algorithm.
 */
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "tkd_admin_session";

/**
 * Get the signing secret from environment variables.
 * Falls back to a development-only default — in production, ADMIN_SESSION_SECRET
 * should always be set to a long random string (e.g., 64+ hex characters).
 */
function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "development-only-change-me";
}

export type SessionPayload = {
  exp: number;
  /** Member display name shown in navigation */
  name: string;
  /** Normalized email (lowercase); empty for old cookies created before this field was added */
  email: string;
};

/**
 * Create a signed session token.
 *
 * Process:
 * 1. Build a JSON payload with expiration, name, and email
 * 2. Base64url-encode the payload (URL-safe base64, no padding)
 * 3. Compute HMAC-SHA256 of the encoded payload using the secret
 * 4. Return `encodedPayload.signature`
 *
 * The `satisfies SessionPayload` operator (TypeScript 4.9+) checks that the object
 * literal matches the type without widening it — a compile-time safety check.
 */
export function signSession(displayName: string, emailNormalized: string): string {
  // Token expires in 7 days (in milliseconds from epoch)
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const name = displayName.trim() || "Član";
  const email = emailNormalized.trim().toLowerCase();
  // Step 1 & 2: JSON → Buffer → base64url string
  const payload = Buffer.from(JSON.stringify({ exp, name, email } satisfies SessionPayload), "utf8").toString(
    "base64url",
  );
  // Step 3: HMAC-SHA256 signature of the payload
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  // Step 4: Combine into a dot-separated token (like JWT but simpler)
  return `${payload}.${sig}`;
}

/**
 * Verify a token's signature and expiration; returns the decoded payload or null.
 *
 * Security measures:
 * - `timingSafeEqual`: Compares buffers in constant time to prevent timing attacks.
 *   A naive `===` comparison leaks information about how many bytes matched, which
 *   an attacker could use to forge a valid signature byte-by-byte.
 * - Expiration check: Tokens older than 7 days are rejected.
 */
export function parseSessionToken(token: string | undefined): SessionPayload | null {
  if (!token?.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  // Recompute the expected signature from the payload
  const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  try {
    // Convert to Buffers for constant-time comparison
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    // timingSafeEqual requires same-length buffers — different lengths = definitely invalid
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    // Signature is valid — decode and validate the payload contents
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as unknown;
    if (typeof data !== "object" || data === null) return null;
    const rec = data as { exp?: unknown; name?: unknown; email?: unknown };
    // Check expiration — reject expired tokens
    if (typeof rec.exp !== "number" || rec.exp <= Date.now()) return null;
    if (typeof rec.name !== "string" || !rec.name.trim()) return null;
    const email = typeof rec.email === "string" ? rec.email.trim().toLowerCase() : "";
    return { exp: rec.exp, name: rec.name.trim(), email };
  } catch {
    return null;
  }
}

/** Convenience wrapper — returns true if the token is valid and not expired */
export function verifySessionToken(token: string | undefined): boolean {
  return parseSessionToken(token) !== null;
}

export function sessionCookieName(): string {
  return COOKIE;
}

/**
 * Determine the full URL from the request — handles edge cases where `request.url`
 * is a relative path (e.g., on LAN without a proxy setting the Host header).
 */
function absoluteUrlFromRequest(request: Request): URL | null {
  const raw = request.url;
  try {
    const u = new URL(raw);
    if (u.hostname) return u;
  } catch {
    /* relative path, e.g. /api/auth/login */
  }
  const host = request.headers.get("host");
  if (!host) return null;
  // x-forwarded-proto is set by reverse proxies (Nginx, Vercel, etc.) to indicate
  // whether the original request was HTTP or HTTPS
  const xf = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const scheme = xf === "https" ? "https" : xf === "http" ? "http" : "http";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  try {
    return new URL(`${scheme}://${host}${path}`);
  } catch {
    return null;
  }
}

/**
 * Whether Set-Cookie should include Secure. On HTTP (LAN IP without TLS) the browser rejects the cookie if Secure=true.
 * Precedence: SESSION_COOKIE_SECURE → X-Forwarded-Proto → absolute URL of the request.
 * If HTTPS cannot be reliably determined, defaults to false (so login works on http://192.168…).
 */
export function sessionCookieSecure(request?: Request): boolean {
  // Allow explicit override via environment variable for unusual deployments
  const explicit = process.env.SESSION_COOKIE_SECURE?.trim().toLowerCase();
  if (explicit === "false") return false;
  if (explicit === "true") return true;

  if (request) {
    // Check the X-Forwarded-Proto header (set by reverse proxies)
    const forwarded = request.headers.get("x-forwarded-proto");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim().toLowerCase();
      if (first === "https") return true;
      if (first === "http") return false;
    }
    // Fall back to inspecting the request URL's protocol
    const abs = absoluteUrlFromRequest(request);
    if (abs) {
      if (abs.protocol === "https:") return true;
      if (abs.protocol === "http:") return false;
    }
  }

  return false;
}

/**
 * Cookie options for the session — applied to both Set and Delete operations.
 *
 * - **httpOnly**: The cookie is invisible to `document.cookie` in the browser.
 *   This is the #1 defense against XSS attacks stealing session tokens.
 * - **sameSite: "lax"**: The cookie is sent with same-site requests and top-level
 *   navigations (clicking a link), but NOT with cross-site POST requests. This
 *   prevents most CSRF attacks while keeping the UX smooth.
 * - **secure**: When true, the cookie is only sent over HTTPS connections.
 * - **path: "/"**: The cookie is available on all routes (not just /api/).
 * - **maxAge**: Cookie lifetime in seconds (7 days here). After this, the browser
 *   automatically deletes it.
 */
export function sessionCookieOptions(request?: Request) {
  return {
    httpOnly: true as const,
    secure: sessionCookieSecure(request),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
