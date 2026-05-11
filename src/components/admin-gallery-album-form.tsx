/**
 * AdminGalleryAlbumForm — form for creating and editing gallery albums.
 *
 * KEY CONCEPTS:
 * - **Complex form with file uploads:** Like AdminNewsForm, this uses FormData to
 *   handle both text fields and file inputs (images, videos). FormData is the standard
 *   way to send multipart form data with the Fetch API.
 * - **Set state for tracking removals:** Uses `useState<Set<number>>` to track which
 *   album items the user wants to remove. A Set is ideal here because lookups and
 *   toggles are O(1), and duplicates are impossible. The functional update pattern
 *   `setRemoveSet(prev => ...)` ensures we work with the latest state.
 * - **useMemo for derived values:** `removeIndicesCsv` converts the Set to a
 *   comma-separated string, only recomputing when the Set changes. This avoids
 *   recalculating on every render.
 * - **Mode pattern ("create" | "edit"):** Same component handles both creating and
 *   editing. The mode determines which API endpoint, HTTP method, and UI to use.
 * - **router.push() + router.refresh():** Navigates to the album page and forces
 *   Next.js to re-fetch server data so the updated album appears immediately.
 */
"use client";

import { useRouter } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { useMemo, useState } from "react";
import type { GalleryAlbum, GalleryItem } from "@/config/gallery";

function itemKindLabel(item: GalleryItem): string {
  if (item.kind === "image") return "Slika";
  if (item.kind === "youtube") return "YouTube";
  return "Video";
}

function itemPreview(item: GalleryItem): string {
  if (item.kind === "image") return item.src;
  if (item.kind === "youtube") return item.title;
  return item.title;
}

export type AdminGalleryAlbumFormProps = {
  mode: "create" | "edit";
  editSlug?: string;
  initialAlbum?: GalleryAlbum;
};

export function AdminGalleryAlbumForm({ mode, editSlug, initialAlbum }: AdminGalleryAlbumFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Using a Set for O(1) lookups: .has(idx) is instant regardless of how many items.
  // Initialized with `new Set()` (empty) — items are added/removed via toggleRemove.
  const [removeSet, setRemoveSet] = useState<Set<number>>(new Set());

  // Functional update pattern: `prev =>` receives the current state value.
  // This avoids stale closure issues when toggling rapidly.
  const toggleRemove = (idx: number) => {
    setRemoveSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // useMemo: only recomputes the CSV string when removeSet changes.
  const removeIndicesCsv = useMemo(() => [...removeSet].sort((a, b) => a - b).join(","), [removeSet]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    if (mode === "edit") {
      fd.set("remove_indices", removeIndicesCsv);
    }

    setPending(true);
    try {
      const isEdit = mode === "edit" && editSlug;
      const url = isEdit ? `/api/gallery/albums/${encodeURIComponent(editSlug)}` : "/api/gallery/albums";
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
      router.push(`/galerija/${data.slug}`);
      router.refresh();
    } catch {
      setError("Mrežna greška. Pokušajte ponovno.");
    } finally {
      setPending(false);
    }
  }

  async function onDeleteAlbum() {
    if (mode !== "edit" || !editSlug) return;
    if (!window.confirm("Sigurno želite obrisati cijeli album? Ovo se ne može poništiti.")) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/gallery/albums/${encodeURIComponent(editSlug)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Brisanje nije uspjelo.");
        return;
      }
      router.push("/galerija");
      router.refresh();
    } catch {
      setError("Mrežna greška.");
    } finally {
      setPending(false);
    }
  }

  const submitLabel =
    mode === "edit" ? (pending ? "Spremam…" : "Spremi album") : pending ? "Stvaram album…" : "Stvori album";

  const items = initialAlbum?.items ?? [];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-800">
          Naslov albuma
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={initialAlbum?.title ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 focus:border-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-800">
          Opis
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          maxLength={4000}
          defaultValue={initialAlbum?.description ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 focus:border-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-800">
          Slug (dio URL-a)
        </label>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {mode === "create"
            ? "Ostavite prazno za automatski iz naslova. Samo mala slova, brojevi i crtice."
            : "Možete promijeniti URL albuma; ako je zauzet, dodaje se sufiks."}
        </p>
        <input
          id="slug"
          name="slug"
          maxLength={100}
          defaultValue={initialAlbum?.slug ?? ""}
          placeholder={mode === "create" ? "npr. natjecanje-split-2026" : ""}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 focus:border-[var(--accent)] focus:ring-2"
        />
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm font-medium text-slate-800">Naslovnica na popisu (opcionalno)</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Putanja do slike, npr. /galerija/ime.jpg ili /uploads/gallery/…</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="cover_src" className="text-xs font-medium text-slate-600">
              Putanja slike
            </label>
            <input
              id="cover_src"
              name="cover_src"
              type="text"
              defaultValue={initialAlbum?.coverSrc ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900"
            />
          </div>
          <div>
            <label htmlFor="cover_alt" className="text-xs font-medium text-slate-600">
              Alt tekst
            </label>
            <input
              id="cover_alt"
              name="cover_alt"
              type="text"
              defaultValue={initialAlbum?.coverAlt ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
        </div>
        {mode === "edit" && (initialAlbum?.coverSrc || initialAlbum?.coverAlt) ? (
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="clear_cover" className="rounded border-slate-300" />
            Ukloni prilagođenu naslovnicu (koristit će se prva slika u albumu)
          </label>
        ) : null}
      </div>

      {mode === "edit" && items.length > 0 ? (
        <div>
          <p className="text-sm font-medium text-slate-800">Stavke u albumu</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Označite stavke koje želite ukloniti pri spremanju.</p>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 text-sm">
            {items.map((item, idx) => (
              <li
                key={`${item.kind}-${idx}-${itemPreview(item).slice(0, 24)}`}
                className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  id={`rm-${idx}`}
                  checked={removeSet.has(idx)}
                  onChange={() => toggleRemove(idx)}
                  className="mt-1 rounded border-slate-300"
                />
                <label htmlFor={`rm-${idx}`} className="min-w-0 flex-1 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-500">{itemKindLabel(item)}</span>{" "}
                  <span className="break-all text-slate-800">{itemPreview(item)}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <label htmlFor="images" className="block text-sm font-medium text-slate-800">
          {mode === "edit" ? "Dodaj slike" : "Slike (opcionalno)"}
        </label>
        <p className="mt-1 text-xs text-[var(--muted)]">JPEG, PNG, WebP, GIF, do 12 MB po datoteci.</p>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="videos" className="block text-sm font-medium text-slate-800">
          {mode === "edit" ? "Dodaj video (MP4 / WebM)" : "Video datoteke (opcionalno)"}
        </label>
        <p className="mt-1 text-xs text-[var(--muted)]">Do 100 MB po datoteci.</p>
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
          {mode === "edit" ? "Dodaj YouTube (novi retci)" : "YouTube poveznice (opcionalno)"}
        </label>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Jedan zapis po retku: poveznica (watch, youtu.be ili embed). Opcionalno:{" "}
          <code className="rounded bg-slate-100 px-1">URL | Naslov</code>
        </p>
        <textarea
          id="youtube"
          name="youtube"
          rows={4}
          placeholder={"https://www.youtube.com/watch?v=…\nhttps://youtu.be/… | Moj naslov"}
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
            onClick={() => void onDeleteAlbum()}
            className="text-sm font-semibold text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
          >
            Obriši cijeli album
          </button>
        </div>
      ) : null}

        <div className="mt-8 text-center text-sm text-[var(--muted)]">
          <AdminBackNav />
        </div>
    </form>
  );
}
