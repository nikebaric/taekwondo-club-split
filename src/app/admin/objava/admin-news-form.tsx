"use client";

import { useRouter } from "next/navigation";
import { AdminBackNav } from "@/components/admin-back-nav";
import { useEffect, useRef, useState } from "react";
import { AdminGalleryFields } from "@/components/admin-gallery-fields";
import type { AdminPanel } from "@/i18n/dictionaries/admin-panel";

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
  initialPublishedAtIso: string;
  a: AdminPanel;
  listPath: string;
  newsPath: string;
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
  a,
  listPath,
  newsPath,
}: AdminNewsFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const f = a.newsForm;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    try {
      const pubEl = form.elements.namedItem("publishedDate") as HTMLInputElement | null;
      if (!pubEl?.value?.trim()) {
        setError(f.pickDate);
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
        setError(data.error ?? a.saveFailed);
        return;
      }
      if (!isEdit) {
        form.reset();
      }
      router.push(`${newsPath}/${data.slug}`);
      router.refresh();
    } catch {
      setError(a.networkErrorRetry);
    } finally {
      setPending(false);
    }
  }

  const submitLabel =
    mode === "edit"
      ? pending
        ? a.saving
        : a.saveChanges
      : pending
        ? f.publishing
        : f.publish;

  async function onDeleteArticle() {
    if (mode !== "edit" || !editSlug) return;
    if (!window.confirm(f.deleteConfirm)) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${encodeURIComponent(editSlug)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? a.deleteFailed);
        return;
      }
      router.push(listPath);
      router.refresh();
    } catch {
      setError(a.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="publishedDate" className="block text-sm font-medium text-slate-800">
            {f.publishedDate}
          </label>
          <PublishedDatePicker initialIso={initialPublishedAtIso} />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-800">
            {f.title}
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
            {f.body}
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
            {f.removeAllImages}
          </label>
        ) : null}
        <AdminGalleryFields
          mode={mode}
          existingImageSrcs={existingImageSrcs}
          initialCoverSrc={initialCoverSrc}
          labels={a.galleryFields}
        />
        {mode === "edit" && hasGalleryVideos ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" name="remove_all_videos" className="rounded border-slate-300" />
            {f.removeAllVideos}
          </label>
        ) : null}
        <div>
          <label htmlFor="videos" className="block text-sm font-medium text-slate-800">
            {f.videos}
            {mode === "edit" ? (
              <span className="font-normal text-[var(--muted)]">{f.videosEditNote}</span>
            ) : (
              <span className="font-normal text-[var(--muted)]">{f.videosCreateNote}</span>
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
            {f.youtube}
          </label>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {f.youtubeHint}
            {mode === "edit" && hasYoutube ? <span>{f.youtubeClearHint}</span> : null}
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
              {f.deleteArticle}
            </button>
          </div>
        ) : null}

        <div className="mt-8 text-center text-sm text-[var(--muted)]">
          <AdminBackNav label={a.back} />
        </div>
      </form>
    </div>
  );
}
