import { NextResponse } from "next/server";
import { Resend } from "resend";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

const CONTACT_TO_DEFAULT = "nenad.bulovic@inet.hr";
const MESSAGE_MAX_LEN = 15_000;

function isNonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

export async function POST(req: Request) {
  let json: Body;
  try {
    json = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
  }

  if (!isNonEmpty(json.name) || !isNonEmpty(json.email) || !isNonEmpty(json.message)) {
    return NextResponse.json(
      { ok: false, error: "Ime, e-mail i poruka su obavezni." },
      { status: 400 },
    );
  }

  const email = json.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Unesite ispravnu e-mail adresu." }, { status: 400 });
  }

  const message = json.message.trim();
  if (message.length > MESSAGE_MAX_LEN) {
    return NextResponse.json(
      { ok: false, error: "Poruka je preduga. Skratite tekst i pokušajte ponovno." },
      { status: 400 },
    );
  }

  const name = json.name.trim();
  const phone = json.phone?.trim() ?? "";

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const to = process.env.CONTACT_EMAIL_TO?.trim() || CONTACT_TO_DEFAULT;

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

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `Kontakt s weba: ${name}`,
    text,
  });

  if (error) {
    console.error("[contact] Resend:", error);
    return NextResponse.json(
      { ok: false, error: "Poruka nije poslana. Pokušajte ponovno ili nas nazovite." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
