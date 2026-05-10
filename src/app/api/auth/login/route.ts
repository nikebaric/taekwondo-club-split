import { NextResponse } from "next/server";
import { hasClubAdminCredentialsConfigured, matchClubAdmin } from "@/lib/club-admins";
import { sessionCookieName, sessionCookieOptions, signSession } from "@/lib/session";

export async function POST(request: Request) {
  if (!hasClubAdminCredentialsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Postavite barem jedan par ADMIN_EMAIL/ADMIN_PASSWORD ili ADMIN2_EMAIL/ADMIN2_PASSWORD u .env. Pogledajte .env.example.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neispravan JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "Neispravan JSON." }, { status: 400 });
  }
  const b = body as { email?: unknown; password?: unknown };
  const email = typeof b.email === "string" ? b.email : "";
  const password = typeof b.password === "string" ? b.password : "";

  const match = matchClubAdmin(email, password);
  if (!match) {
    return NextResponse.json({ ok: false, error: "Neispravan e-mail ili lozinka." }, { status: 401 });
  }

  const token = signSession(match.displayName, match.emailNormalized);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName(), token, sessionCookieOptions(request));
  return res;
}
