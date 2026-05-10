import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNewsForm } from "@/app/admin/objava/admin-news-form";
import { isAdminSession } from "@/lib/auth-check";

export const metadata: Metadata = {
  title: "Nova novost",
  description: "Objava klupske novosti — naslov, tekst, slika ili video.",
};

export default async function AdminNovaNovostPage() {
  if (!(await isAdminSession())) {
    redirect("/login?next=/admin/objava/novi");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Administracija</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Nova novost
      </h1>
      <div className="mt-10">
        <AdminNewsForm initialPublishedAtIso={new Date().toISOString()} />
      </div>
    </div>
  );
}
