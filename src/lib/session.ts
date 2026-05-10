import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "tkd_admin_session";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "development-only-change-me";
}

export type SessionPayload = {
  exp: number;
  /** Prikazano ime člana u navigaciji */
  name: string;
  /** Normalizirani e-mail (lowercase); prazan za stare kolačiće prije proširenja */
  email: string;
};

/** JWT-like payload: base64url(json) . hmac */
export function signSession(displayName: string, emailNormalized: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const name = displayName.trim() || "Član";
  const email = emailNormalized.trim().toLowerCase();
  const payload = Buffer.from(JSON.stringify({ exp, name, email } satisfies SessionPayload), "utf8").toString(
    "base64url",
  );
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** Provjerava potpis i istek; vraća podatke ili null. */
export function parseSessionToken(token: string | undefined): SessionPayload | null {
  if (!token?.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as unknown;
    if (typeof data !== "object" || data === null) return null;
    const rec = data as { exp?: unknown; name?: unknown; email?: unknown };
    if (typeof rec.exp !== "number" || rec.exp <= Date.now()) return null;
    if (typeof rec.name !== "string" || !rec.name.trim()) return null;
    const email = typeof rec.email === "string" ? rec.email.trim().toLowerCase() : "";
    return { exp: rec.exp, name: rec.name.trim(), email };
  } catch {
    return null;
  }
}

export function verifySessionToken(token: string | undefined): boolean {
  return parseSessionToken(token) !== null;
}

export function sessionCookieName(): string {
  return COOKIE;
}

/** Puni URL zahtjeva (LAN http://IP:port često dolazi kao relativna putanja ili bez sheme). */
function absoluteUrlFromRequest(request: Request): URL | null {
  const raw = request.url;
  try {
    const u = new URL(raw);
    if (u.hostname) return u;
  } catch {
    /* relativna putanja npr. /api/auth/login */
  }
  const host = request.headers.get("host");
  if (!host) return null;
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
 * Treba li Set-Cookie imati Secure. Na HTTP (LAN IP bez TLS) preglednik inače odbaci kolačić ako je Secure=true.
 * Redoslijed: SESSION_COOKIE_SECURE → X-Forwarded-Proto → apsolutni URL zahtjeva.
 * Ako se HTTPS ne može pouzdano zaključiti, default je false (radi prijava na http://192.168…).
 */
export function sessionCookieSecure(request?: Request): boolean {
  const explicit = process.env.SESSION_COOKIE_SECURE?.trim().toLowerCase();
  if (explicit === "false") return false;
  if (explicit === "true") return true;

  if (request) {
    const forwarded = request.headers.get("x-forwarded-proto");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim().toLowerCase();
      if (first === "https") return true;
      if (first === "http") return false;
    }
    const abs = absoluteUrlFromRequest(request);
    if (abs) {
      if (abs.protocol === "https:") return true;
      if (abs.protocol === "http:") return false;
    }
  }

  return false;
}

export function sessionCookieOptions(request?: Request) {
  return {
    httpOnly: true as const,
    secure: sessionCookieSecure(request),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
