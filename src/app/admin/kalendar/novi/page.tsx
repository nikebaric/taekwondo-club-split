import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { AdminCalendarEventForm } from "@/components/admin-calendar-event-form";
import { isAdminSession } from "@/lib/auth-check";

export const metadata: Metadata = {
  title: "Novi zapis — kalendar",
};

export default async function AdminKalendarNoviPage() {
  if (!(await isAdminSession())) {
    redirect("/prijava?next=/admin/kalendar/novi");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Administracija</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-900 sm:text-4xl">
        Novi događaj
      </h1>
      <div className="mt-10">
        <AdminCalendarEventForm mode="create" />
      </div>
      <div className="mt-12 text-center text-sm text-[var(--muted)]">
        <AdminBackNav />
      </div>
    </div>
  );
}
