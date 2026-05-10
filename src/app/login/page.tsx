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
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.next;
  const nextRaw = Array.isArray(raw) ? raw[0] : raw;
  const nextPath =
    typeof nextRaw === "string" && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : "/admin";

  const c = await cookies();
  if (verifySessionToken(c.get(sessionCookieName())?.value)) {
    redirect(nextPath);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:py-28">
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
