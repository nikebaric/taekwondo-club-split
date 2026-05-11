/**
 * Next.js Route Handler — POST /api/auth/logout
 *
 * KEY CONCEPTS:
 * - This is a minimal Route Handler that demonstrates how to **clear a cookie**.
 * - To "delete" a cookie the server sets it again with the same name but with
 *   `maxAge: 0` (or a past `expires` date). The browser then removes it immediately.
 * - We reuse `sessionCookieOptions` to make sure the path, domain, httpOnly, etc.
 *   match the original cookie — browsers only delete a cookie if all attributes match.
 */
import { NextResponse } from "next/server";
import { sessionCookieName, sessionCookieOptions } from "@/lib/session";

export async function POST(request: Request) {
  const res = NextResponse.json({ ok: true });
  const name = sessionCookieName();
  // Spread the original cookie options, then override `maxAge` to 0.
  // maxAge=0 tells the browser "this cookie has expired — remove it now".
  res.cookies.set(name, "", { ...sessionCookieOptions(request), maxAge: 0 });
  return res;
}
