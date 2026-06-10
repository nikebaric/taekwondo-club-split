"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminPanel } from "@/i18n/dictionaries/admin-panel";

export type AdminGalleryFieldsProps = {
  mode: "create" | "edit";
  existingImageSrcs?: string[];
  initialCoverSrc?: string | null;
  labels: AdminPanel["galleryFields"];
};

export function AdminGalleryFields({
  mode,
  existingImageSrcs = [],
  initialCoverSrc,
  labels: g,
}: AdminGalleryFieldsProps) {
  const [uploadCount, setUploadCount] = useState(0);

  const initialCoverIdx = useMemo(() => {
    if (existingImageSrcs.length === 0) return 0;
    if (!initialCoverSrc) return 0;
    const i = existingImageSrcs.indexOf(initialCoverSrc);
    return i >= 0 ? i : 0;
  }, [existingImageSrcs, initialCoverSrc]);

  const [coverIdx, setCoverIdx] = useState(initialCoverIdx);

  const effectiveCount = uploadCount > 0 ? uploadCount : existingImageSrcs.length;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCoverIdx(initialCoverIdx);
  }, [initialCoverIdx]);

  useEffect(() => {
    setCoverIdx((prev) => {
      const max = Math.max(0, effectiveCount - 1);
      return Math.min(prev, max);
    });
  }, [effectiveCount]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const showCoverPicker = effectiveCount > 1;
  const showSingleHidden = effectiveCount === 1;

  return (
    <>
      <div>
        <label htmlFor="gallery-images" className="block text-sm font-medium text-slate-800">
          {g.images}
          {mode === "edit" ? (
            <span className="font-normal text-[var(--muted)]">{g.imagesEditNote}</span>
          ) : (
            <span className="font-normal text-[var(--muted)]">{g.imagesCreateNote}</span>
          )}
        </label>
        <input
          id="gallery-images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-800"
          onChange={(e) => setUploadCount(e.target.files?.length ?? 0)}
        />
      </div>
      {showCoverPicker ? (
        <div>
          <label htmlFor="cover_image_index" className="block text-sm font-medium text-slate-800">
            {g.cover}
          </label>
          <select
            id="cover_image_index"
            name="cover_image_index"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-[var(--accent)]/30 focus:border-[var(--accent)] focus:ring-2"
            value={coverIdx}
            onChange={(e) => setCoverIdx(Number(e.target.value))}
          >
            {Array.from({ length: effectiveCount }, (_, i) => (
              <option key={i} value={i}>
                {g.coverOption(i + 1)}
                {mode === "edit" && uploadCount === 0 && existingImageSrcs[i]
                  ? ` — …/${existingImageSrcs[i].split("/").pop()}`
                  : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted)]">{g.coverHint}</p>
        </div>
      ) : showSingleHidden ? (
        <input type="hidden" name="cover_image_index" value={0} />
      ) : null}
    </>
  );
}
