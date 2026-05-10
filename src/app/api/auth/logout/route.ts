import { NextResponse } from "next/server";
import { sessionCookieName, sessionCookieOptions } from "@/lib/session";

export async function POST(request: Request) {
  const res = NextResponse.json({ ok: true });
  const name = sessionCookieName();
  res.cookies.set(name, "", { ...sessionCookieOptions(request), maxAge: 0 });
  return res;
}
