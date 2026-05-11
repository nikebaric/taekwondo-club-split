/**
 * Next.js Route Handler — POST /api/contact
 *
 * KEY CONCEPTS:
 * - **Server-side form validation**: Never trust client input. Even though the frontend
 *   may validate fields, the API route must re-validate everything because anyone can
 *   call the endpoint directly (e.g., via curl or Postman).
 * - **Environment variables for secrets**: API keys and email addresses are stored in
 *   `.env.local` (never committed to git). In Next.js, server-side code accesses them
 *   via `process.env.VAR_NAME`. Variables without a `NEXT_PUBLIC_` prefix are only
 *   available on the server, which keeps them secret from the browser.
 * - **Third-party service integration**: The Resend SDK sends transactional emails.
 *   External API calls should always be wrapped in error handling since network requests
 *   can fail.
 * - **HTTP status codes**: 400 = bad request (client error), 502 = bad gateway
 *   (upstream service failed), 503 = service unavailable (not configured).
 */
import { NextResponse } from "next/server";
import { Resend } from "resend";

// TypeScript type alias for the expected JSON body shape.
// Using a named type helps document the API contract.
type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

const CONTACT_TO_DEFAULT = "nikebaric@gmail.com";
const MESSAGE_MAX_LEN = 15_000;

/**
 * TypeScript type guard (user-defined type predicate).
 * The `s is string` return type tells TypeScript that when this returns true,
 * the argument is guaranteed to be a non-empty string. This enables type narrowing
 * in the calling code — no extra casts needed.
 */
function isNonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

export async function POST(req: Request) {
  // Parse JSON body — wrapped in try/catch for malformed input
  let json: Body;
  try {
    json = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
  }

  // Validate required fields using the type guard above
  if (!isNonEmpty(json.name) || !isNonEmpty(json.email) || !isNonEmpty(json.message)) {
    return NextResponse.json(
      { ok: false, error: "Ime, e-mail i poruka su obavezni." },
      { status: 400 },
    );
  }

  // Basic regex email validation — this catches obvious typos. For production use,
  // a library like `zod` or `validator` would be more robust.
  const email = json.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Unesite ispravnu e-mail adresu." }, { status: 400 });
  }

  // Length limits protect against abuse (very large payloads can consume memory/bandwidth)
  const message = json.message.trim();
  if (message.length > MESSAGE_MAX_LEN) {
    return NextResponse.json(
      { ok: false, error: "Poruka je preduga. Skratite tekst i pokušajte ponovno." },
      { status: 400 },
    );
  }

  const name = json.name.trim();
  // Optional chaining (?.) with nullish coalescing (??) — if phone is undefined,
  // `?.trim()` returns undefined, then `?? ""` provides the fallback empty string.
  const phone = json.phone?.trim() ?? "";

  // Read secrets from environment variables — these are only available server-side.
  // The `?.trim()` chain handles potential whitespace from copy-paste in .env files.
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  // Fallback with `||`: if CONTACT_EMAIL_TO is empty string (falsy), use the default.
  // Note: `||` treats "" as falsy, unlike `??` which only treats null/undefined as falsy.
  const to = process.env.CONTACT_EMAIL_TO?.trim() || CONTACT_TO_DEFAULT;

  // 503 = Service Unavailable — the server is not configured for this feature yet
  if (!apiKey || !from) {
    console.error("[contact] Nedostaje RESEND_API_KEY ili RESEND_FROM_EMAIL u okolini.");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Slanje poruke e-poštom trenutačno nije omogućeno. Javite se telefonom ili kasnije ponovno pokušajte.",
      },
      { status: 503 },
    );
  }

  // Build a plain-text email body. `.filter(line => line !== null)` removes the
  // phone line when it's not provided (the ternary returns null instead of a string).
  const text = [
    `Ime: ${name}`,
    `E-mail: ${email}`,
    phone ? `Telefon: ${phone}` : null,
    "",
    "Poruka:",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  // Instantiate the Resend client and send the email
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    // replyTo lets the recipient hit "Reply" and reach the person who filled out the form
    replyTo: email,
    subject: `Kontakt s weba: ${name}`,
    text,
  });

  // 502 = Bad Gateway — our upstream email provider returned an error
  if (error) {
    console.error("[contact] Resend:", error);
    return NextResponse.json(
      { ok: false, error: "Poruka nije poslana. Pokušajte ponovno ili nas nazovite." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
