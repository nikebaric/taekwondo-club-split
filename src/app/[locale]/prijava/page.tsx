import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getPageLocale } from "@/i18n/locale";
import { sessionCookieName, verifySessionToken } from "@/lib/session";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getPageLocale(params);
  return {
    title: t.login.metaTitle,
    description: t.login.metaDescription,
  };
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { t } = await getPageLocale(params);
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
    <div className="mx-auto w-full max-w-sm px-4 py-20 text-center sm:py-28">
      <LoginForm nextPath={nextPath} labels={t.login} />
    </div>
  );
}
