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
import { useEffect, useMemo, useRef, useState } from "react";
import type { GalleryAlbum, GalleryItem } from "@/config/gallery";
import { parseGalleryYoutubeField } from "@/lib/gallery-youtube-lines";

const MAX_GALLERY_ITEM_CAPTION = 400;

type LayoutSlot =
  | { kind: "existing"; index: number }
  | { kind: "newFile"; fileIndex: number }
  | { kind: "newYoutube"; ytIndex: number };

function slotToToken(s: LayoutSlot): string {
  if (s.kind === "existing") return `e${s.index}`;
  if (s.kind === "newFile") return `f${s.fileIndex}`;
  return `y${s.ytIndex}`;
}

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
  const [removeSet, setRemoveSet] = useState<Set<number>>(new Set());
  const removeSetRef = useRef(removeSet);

  // Update ref when removeSet changes
  useEffect(() => {
    removeSetRef.current = removeSet;
  }, [removeSet]);

  const initialItemCount = initialAlbum?.items?.length ?? 0;
  const hasExistingLayoutMode = mode === "edit" && initialItemCount > 0;

  const [layoutSlots, setLayoutSlots] = useState<LayoutSlot[]>(() =>
    initialAlbum?.items?.length
      ? initialAlbum.items.map((_, i) => ({ kind: "existing" as const, index: i }))
      : [],
  );

  const [mediaQueue, setMediaQueue] = useState<File[]>([]);
  const [youtubeText, setYoutubeText] = useState("");
  const [orderTokens, setOrderTokens] = useState<string[]>([]);
  const lastMediaYoutubeDims = useRef({ n: -1, m: -1 });
  const [captionByToken, setCaptionByToken] = useState<Record<string, string>>({});

  const ytParsed = useMemo(() => parseGalleryYoutubeField(youtubeText), [youtubeText]);
  const nNewFiles = mediaQueue.length;
  const nNewYoutube = ytParsed.error ? 0 : ytParsed.items.length;

  // Initialize state when editSlug or mode changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (mode !== "edit" || !editSlug) return;
    const caps: Record<string, string> = {};
    if (initialAlbum?.items?.length) {
      initialAlbum.items.forEach((it, i) => {
        caps[`e${i}`] = it.caption ?? "";
      });
    }
    setCaptionByToken(caps);
    if (initialAlbum?.items?.length) {
      setLayoutSlots(initialAlbum.items.map((_, i) => ({ kind: "existing" as const, index: i })));
    } else {
      setLayoutSlots([]);
    }
    setRemoveSet(new Set());
    setMediaQueue([]);
    setYoutubeText("");
    setOrderTokens([]);
  }, [editSlug, mode, initialAlbum?.items]);

  // Update layout slots when media queue or youtube changes
  useEffect(() => {
    if (!hasExistingLayoutMode) return;
    setLayoutSlots((prev) => {
      const existingSlots = prev.filter((s) => s.kind === "existing");
      const fileSlots = mediaQueue.map((_, fi) => ({ kind: "newFile" as const, fileIndex: fi }));
      const ytSlots = Array.from({ length: nNewYoutube }, (_, j) => ({ kind: "newYoutube" as const, ytIndex: j }));
      return [...existingSlots, ...fileSlots, ...ytSlots];
    });
  }, [hasExistingLayoutMode, mediaQueue, nNewYoutube]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Update order tokens when media/youtube counts change
  useEffect(() => {
    if (hasExistingLayoutMode) return;
    if (lastMediaYoutubeDims.current.n === nNewFiles && lastMediaYoutubeDims.current.m === nNewYoutube) return;
    lastMediaYoutubeDims.current = { n: nNewFiles, m: nNewYoutube };
    setOrderTokens([
      ...Array.from({ length: nNewFiles }, (_, i) => `f${i}`),
      ...Array.from({ length: nNewYoutube }, (_, i) => `y${i}`),
    ]);
  }, [hasExistingLayoutMode, nNewFiles, nNewYoutube]);

  const toggleRemove = (idx: number) => {
    const willMark = !removeSetRef.current.has(idx);
    setRemoveSet((prev) => {
      const next = new Set(prev);
      if (willMark) next.add(idx);
      else next.delete(idx);
      return next;
    });
    if (!hasExistingLayoutMode) return;
    setLayoutSlots((slots) =>
      willMark
        ? slots.filter((s) => !(s.kind === "existing" && s.index === idx))
        : slots.some((s) => s.kind === "existing" && s.index === idx)
          ? slots
          : [...slots, { kind: "existing" as const, index: idx }],
    );
  };

  const removeIndicesCsv = useMemo(() => [...removeSet].sort((a, b) => a - b).join(","), [removeSet]);

  function slotLabel(slot: LayoutSlot): string {
    if (slot.kind === "existing" && initialAlbum?.items[slot.index]) {
      return itemPreview(initialAlbum.items[slot.index]!);
    }
    if (slot.kind === "newFile") {
      const f = mediaQueue[slot.fileIndex];
      return f ? f.name : `Datoteka ${slot.fileIndex + 1}`;
    }
    if (slot.kind === "newYoutube") {
      const y = ytParsed.items[slot.ytIndex];
      return y ? y.title : `YouTube ${slot.ytIndex + 1}`;
    }
    return "";
  }

  function slotKindShort(slot: LayoutSlot): string {
    if (slot.kind === "existing" && initialAlbum?.items[slot.index]) {
      return itemKindLabel(initialAlbum.items[slot.index]!);
    }
    if (slot.kind === "newFile") return "Nova datoteka";
    if (slot.kind === "newYoutube") return "Novi YouTube";
    return "";
  }

  function moveLayoutSlot(listIndex: number, dir: -1 | 1) {
    setLayoutSlots((prev) => {
      const j = listIndex + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const t = next[listIndex]!;
      next[listIndex] = next[j]!;
      next[j] = t;
      return next;
    });
  }

  function tokenLabel(token: string): string {
    if (/^f\d+$/.test(token)) {
      const i = parseInt(token.slice(1), 10);
      const f = mediaQueue[i];
      return f ? f.name : token;
    }
    if (/^y\d+$/.test(token)) {
      const i = parseInt(token.slice(1), 10);
      const y = ytParsed.items[i];
      return y ? y.title : token;
    }
    return token;
  }

  function setCaptionToken(token: string, value: string) {
    const v = value.slice(0, MAX_GALLERY_ITEM_CAPTION);
    setCaptionByToken((prev) => ({ ...prev, [token]: v }));
  }

  function moveOrderToken(index: number, dir: -1 | 1) {
    setOrderTokens((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const t = next[index]!;
      next[index] = next[j]!;
      next[j] = t;
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    if (youtubeText.trim().length > 0 && ytParsed.error) {
      setError(ytParsed.error);
      return;
    }
    if (hasExistingLayoutMode && layoutSlots.length === 0) {
      setError("Album mora imati barem jednu stavku.");
      return;
    }

    const fd = new FormData(form);
    fd.set("youtube", youtubeText);
    for (const file of mediaQueue) {
      fd.append("media", file);
    }
    if (hasExistingLayoutMode) {
      fd.set("album_item_order", JSON.stringify(layoutSlots.map(slotToToken)));
      fd.set(
        "album_item_captions",
        JSON.stringify(layoutSlots.map((s) => (captionByToken[slotToToken(s)] ?? "").trim())),
      );
    } else if (orderTokens.length > 0) {
      fd.set("item_order", JSON.stringify(orderTokens));
      fd.set("new_item_captions", JSON.stringify(orderTokens.map((t) => (captionByToken[t] ?? "").trim())));
    }

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
        <label htmlFor="gallery-media" className="block text-sm font-medium text-slate-800">
          {mode === "edit" ? "Dodaj slike i/ili video datoteke" : "Slike i video (opcionalno)"}
        </label>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Slike: JPEG, PNG, WebP, GIF (do 12 MB). Video: MP4 ili WebM (do 100 MB). Možete odabrati više odjednom.
          {hasExistingLayoutMode
            ? " Redoslijed podesite u odjeljku „Stavke u albumu“ ispod (nakon što dodate datoteke ili YouTube)."
            : " Redoslijed ispod određuje kako će se miješati s YouTube stavkama."}
        </p>
        <input
          id="gallery-media"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          multiple
          className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-800"
          onChange={(e) => setMediaQueue(Array.from(e.target.files ?? []))}
        />
        {mediaQueue.length > 0 ? (
          <p className="mt-2 text-xs text-slate-600">
            Odabrano datoteka: {mediaQueue.length}. Ponovnim odabirom zamjenjujete cijeli skup.
          </p>
        ) : null}
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
          value={youtubeText}
          onChange={(e) => setYoutubeText(e.target.value)}
          placeholder={"https://www.youtube.com/watch?v=…\nhttps://youtu.be/… | Moj naslov"}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 focus:border-[var(--accent)] focus:ring-2"
        />
      </div>

      {mode === "edit" && hasExistingLayoutMode ? (
        <div>
          <p className="text-sm font-medium text-slate-800">Stavke u albumu</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Označite postojeće stavke za uklanjanje. Strelicama poredajte sve stavke. Natpis ispod slike/videa prikazuje
            se na stranici albuma.
          </p>
          <ol className="mt-3 max-h-[32rem] space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 text-sm">
            {layoutSlots.map((slot, li) => {
              const capToken = slotToToken(slot);
              const capId = `caption-${capToken}-${li}`;
              return (
                <li
                  key={`${slot.kind}-${slot.kind === "existing" ? slot.index : slot.kind === "newFile" ? `f${slot.fileIndex}` : `y${slot.ytIndex}`}-${li}`}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 px-2 py-2"
                >
                  <div className="flex items-start gap-2">
                    {slot.kind === "existing" ? (
                      <>
                        <input
                          type="checkbox"
                          id={`rm-${slot.index}`}
                          checked={removeSet.has(slot.index)}
                          onChange={() => toggleRemove(slot.index)}
                          className="mt-0.5 shrink-0 rounded border-slate-300"
                        />
                        <label htmlFor={`rm-${slot.index}`} className="min-w-0 flex-1 cursor-pointer">
                          <span className="text-xs font-semibold text-slate-500">{slotKindShort(slot)}</span>{" "}
                          <span className="break-all text-slate-800">{slotLabel(slot)}</span>
                        </label>
                      </>
                    ) : (
                      <div className="min-w-0 flex-1 pl-7">
                        <span className="text-xs font-semibold text-slate-500">{slotKindShort(slot)}</span>{" "}
                        <span className="break-all text-slate-800">{slotLabel(slot)}</span>
                      </div>
                    )}
                    {layoutSlots.length > 1 ? (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          disabled={li === 0}
                          onClick={() => moveLayoutSlot(li, -1)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          aria-label="Gore"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={li === layoutSlots.length - 1}
                          onClick={() => moveLayoutSlot(li, 1)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          aria-label="Dolje"
                        >
                          ↓
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-2 border-t border-slate-200/80 pt-2">
                    <label htmlFor={capId} className="block text-xs font-medium text-slate-600">
                      Natpis ispod medija
                    </label>
                    <input
                      id={capId}
                      type="text"
                      maxLength={MAX_GALLERY_ITEM_CAPTION}
                      value={captionByToken[capToken] ?? ""}
                      onChange={(e) => setCaptionToken(capToken, e.target.value)}
                      placeholder="npr. Frane, Gringo i Neno — majstori kluba"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {!hasExistingLayoutMode && orderTokens.length >= 1 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-medium text-slate-800">Redoslijed i natpisi novih stavki</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {orderTokens.length > 1
              ? "Pomaknite gore/dolje za redoslijed. Natpis ispod medija prikazuje se na stranici albuma."
              : "Natpis ispod medija (opcionalno) prikazuje se na stranici albuma."}
          </p>
          <ol className="mt-3 space-y-3">
            {orderTokens.map((token, idx) => {
              const capId = `caption-new-${token}-${idx}`;
              return (
                <li
                  key={`${token}-${idx}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-slate-800" title={tokenLabel(token)}>
                      <span className="text-xs font-semibold text-slate-500">
                        {token.startsWith("f") ? "Datoteka" : "YouTube"}
                      </span>{" "}
                      {tokenLabel(token)}
                    </span>
                    {orderTokens.length > 1 ? (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveOrderToken(idx, -1)}
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          aria-label="Gore"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={idx === orderTokens.length - 1}
                          onClick={() => moveOrderToken(idx, 1)}
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          aria-label="Dolje"
                        >
                          ↓
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <label htmlFor={capId} className="block text-xs font-medium text-slate-600">
                      Natpis ispod medija
                    </label>
                    <input
                      id={capId}
                      type="text"
                      maxLength={MAX_GALLERY_ITEM_CAPTION}
                      value={captionByToken[token] ?? ""}
                      onChange={(e) => setCaptionToken(token, e.target.value)}
                      placeholder="npr. Treneri na treningu"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

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
