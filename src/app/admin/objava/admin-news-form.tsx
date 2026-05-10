"use client";

import { useRouter } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { useEffect, useRef, useState } from "react";
import { AdminGalleryFields } from "@/components/admin-gallery-fields";

export type AdminNewsFormProps = {
  mode?: "create" | "edit";
  editSlug?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialYoutube?: string;
  hasGalleryImages?: boolean;
  hasGalleryVideos?: boolean;
  hasYoutube?: boolean;
  existingImageSrcs?: string[];
  initialCoverSrc?: string | null;
  /** ISO datum (iz JSON-a) za predpunjeno polje datuma; za novu objavu trenutni dan. */
  initialPublishedAtIso: string;
};

function isoToDateInputValue(iso: string): string {
  const head = iso.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function PublishedDatePicker({
  initialIso,
  inputId = "publishedDate",
}: {
  initialIso: string;
  inputId?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.value = isoToDateInputValue(initialIso);
  }, [initialIso]);
  return (
    <input
      ref={ref}
      id={inputId}
      type="date"
      name="publishedDate"
      required
      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 focus:border-[var(--accent)] focus:ring-2"
    />
  );
}

export function AdminNewsForm({
  mode = "create",
  editSlug,
  initialTitle = "",
  initialDescription = "",
  initialYoutube = "",
  hasGalleryImages = false,
  hasGalleryVideos = false,
  hasYoutube = false,
  existingImageSrcs,
  initialCoverSrc,
  initialPublishedAtIso,
}: AdminNewsFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    try {
      const pubEl = form.elements.namedItem("publishedDate") as HTMLInputElement | null;
      if (!pubEl?.value?.trim()) {
        setError("Odaberite datum objave.");
        setPending(false);
        return;
      }

      const isEdit = mode === "edit" && editSlug;
      const url = isEdit ? `/api/news/${encodeURIComponent(editSlug)}` : "/api/news";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        body: fd,
        credentials: "same-origin",
      });
      const data = (await res.json()) as { ok?: boolean; slug?: string; error?: string };
      if (!res.ok || !data.ok || !data.slug) {
        setError(data.error ?? "Spremanje nije uspjelo.");
        return;
      }
      if (!isEdit) {
        form.reset();
      }
      router.push(`/news/${data.slug}`);
      router.refresh();
    } catch {
      setError("Mrežna greška. Pokušajte ponovno.");
    } finally {
      setPending(false);
    }
  }

  const submitLabel =
    mode === "edit" ? (pending ? "Spremam…" : "Spremi izmjene") : pending ? "Objavljujem…" : "Objavi na novostima";

  async function onDeleteArticle() {
    if (mode !== "edit" || !editSlug) return;
    if (!window.confirm("Sigurno želite obrisati cijeli članak? Ovo se ne može poništiti.")) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${encodeURIComponent(editSlug)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Brisanje nije uspjelo.");
        return;
      }
      router.push("/admin/objava");
      router.refresh();
    } catch {
      setError("Mrežna greška.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="publishedDate" className="block text-sm font-medium text-slate-800">
            Datum objave
          </label>
          <PublishedDatePicker initialIso={initialPublishedAtIso} />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-800">
            Naslov
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={200}
            defaultValue={initialTitle}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 focus:border-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-800">
            Opis / tekst
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={8}
            defaultValue={initialDescription}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 focus:border-[var(--accent)] focus:ring-2"
          />
        </div>
        {mode === "edit" && hasGalleryImages ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" name="remove_all_images" className="rounded border-slate-300" />
            Ukloni sve slike iz članka (bez učitavanja novih)
          </label>
        ) : null}
        <AdminGalleryFields
          mode={mode}
          existingImageSrcs={existingImageSrcs}
          initialCoverSrc={initialCoverSrc}
        />
        {mode === "edit" && hasGalleryVideos ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" name="remove_all_videos" className="rounded border-slate-300" />
            Ukloni sve lokalne video zapise (bez učitavanja novih)
          </label>
        ) : null}
        <div>
          <label htmlFor="videos" className="block text-sm font-medium text-slate-800">
            Video datoteke (MP4 ili WebM, do 100 MB svaka)
            {mode === "edit" ? (
              <span className="font-normal text-[var(--muted)]">
                {" "}
                — nove datoteke zamjenjuju sve postojeće lokalne videe
              </span>
            ) : (
              <span className="font-normal text-[var(--muted)]"> — jedan ili više zapisa odjednom</span>
            )}
          </label>
          <input
            id="videos"
            name="videos"
            type="file"
            accept="video/mp4,video/webm"
            multiple
            className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-800"
          />
        </div>
        <div>
          <label htmlFor="youtube" className="block text-sm font-medium text-slate-800">
            YouTube poveznice
          </label>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Jedan link po retku (watch ili embed URL).
            {mode === "edit" && hasYoutube ? (
              <span> Obrišite sve retke da uklonite sve YouTube ugradnje.</span>
            ) : null}
          </p>
          <textarea
            id="youtube"
            name="youtube"
            rows={4}
            placeholder={"https://www.youtube.com/watch?v=…\nhttps://youtu.be/…"}
            defaultValue={initialYoutube}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 focus:border-[var(--accent)] focus:ring-2"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_-6px_var(--accent-glow)] transition hover:brightness-110 disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>

        {mode === "edit" && editSlug ? (
          <div className="border-t border-slate-200 pt-8">
            <button
              type="button"
              disabled={pending}
              onClick={() => void onDeleteArticle()}
              className="text-sm font-semibold text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
            >
              Obriši cijeli članak
            </button>
          </div>
        ) : null}

        <div className="mt-8 text-center text-sm text-[var(--muted)]">
          <AdminBackNav />
        </div>
      </form>
    </div>
  );
}
