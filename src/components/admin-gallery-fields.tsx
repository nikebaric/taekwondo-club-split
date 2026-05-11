/**
 * AdminGalleryFields — a sub-component for image upload and cover selection.
 *
 * KEY CONCEPTS:
 * - **Sub-component for form composition:** This component is used inside both
 *   AdminNewsForm and other form components. Breaking forms into sub-components
 *   keeps each file manageable and allows reuse of the image upload UI.
 * - **File input handling:** The `<input type="file">` element fires an `onChange`
 *   event with `e.target.files` (a FileList). The component tracks how many files
 *   were selected to update the cover picker options dynamically.
 * - **Derived state with useMemo:** `initialCoverIdx` is computed from props and
 *   cached. When props change (e.g., loading a different article), the memo updates.
 * - **useEffect for syncing state to props:** Two useEffect calls keep `coverIdx`
 *   in sync with changes to `initialCoverIdx` and `effectiveCount`. This is the
 *   "derived state" pattern — state that depends on props needs explicit syncing.
 * - **Conditional rendering of form controls:** The cover picker only shows when
 *   there are 2+ images. With exactly 1 image, a hidden input sends the default.
 */
"use client";

import { useEffect, useMemo, useState } from "react";

export type AdminGalleryFieldsProps = {
  mode: "create" | "edit";
  existingImageSrcs?: string[];
  initialCoverSrc?: string | null;
};

export function AdminGalleryFields({
  mode,
  existingImageSrcs = [],  // Default parameter: empty array if not provided
  initialCoverSrc,
}: AdminGalleryFieldsProps) {
  // Tracks how many files the user selected in the file input.
  const [uploadCount, setUploadCount] = useState(0);

  // useMemo: finds the index of the current cover image in the existing images array.
  const initialCoverIdx = useMemo(() => {
    if (existingImageSrcs.length === 0) return 0;
    if (!initialCoverSrc) return 0;
    const i = existingImageSrcs.indexOf(initialCoverSrc);
    return i >= 0 ? i : 0;
  }, [existingImageSrcs, initialCoverSrc]);

  const [coverIdx, setCoverIdx] = useState(initialCoverIdx);

  // Sync state to prop changes: when the article being edited changes,
  // reset the cover index. This useEffect is necessary because useState's
  // initial value only applies on first mount, not when props update.
  useEffect(() => {
    setCoverIdx(initialCoverIdx);
  }, [initialCoverIdx]);

  const effectiveCount = uploadCount > 0 ? uploadCount : existingImageSrcs.length;

  useEffect(() => {
    setCoverIdx((prev) => {
      const max = Math.max(0, effectiveCount - 1);
      return Math.min(prev, max);
    });
  }, [effectiveCount]);

  const showCoverPicker = effectiveCount > 1;
  const showSingleHidden = effectiveCount === 1;

  return (
    <>
      <div>
        <label htmlFor="gallery-images" className="block text-sm font-medium text-slate-800">
          Slike (JPEG, PNG, WebP, GIF, do 12 MB svaka)
          {mode === "edit" ? (
            <span className="font-normal text-[var(--muted)]">
              {" "}
              — odaberite jednu ili više; ako odaberete nove, zamjenjuju sve postojeće (osim ako označite uklanjanje
              iznad)
            </span>
          ) : (
            <span className="font-normal text-[var(--muted)]"> — možete odabrati više odjednom</span>
          )}
        </label>
        <input
          id="gallery-images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-800"
          // e.target.files is a FileList (array-like). We track .length to know
          // how many images the user selected, which updates the cover picker options.
          onChange={(e) => setUploadCount(e.target.files?.length ?? 0)}
        />
      </div>
      {showCoverPicker ? (
        <div>
          <label htmlFor="cover_image_index" className="block text-sm font-medium text-slate-800">
            Naslovna slika ispod naslova članka
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
                Slika {i + 1}
                {mode === "edit" && uploadCount === 0 && existingImageSrcs[i]
                  ? ` — …/${existingImageSrcs[i].split("/").pop()}`
                  : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Ista slika ostaje u galeriji ispod teksta; odabirete koja je istaknuta ispod naslova.
          </p>
        </div>
      ) : showSingleHidden ? (
        <input type="hidden" name="cover_image_index" value={0} />
      ) : null}
    </>
  );
}
