import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import type { GalleryImage, GalleryItem, GalleryVideoFile, GalleryYouTube } from "@/config/gallery";
import { parseGalleryYoutubeField } from "@/lib/gallery-youtube-lines";

export const GALLERY_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
export const GALLERY_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
export const GALLERY_MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const GALLERY_MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const GALLERY_MAX_IMAGE_COUNT = 48;
export const GALLERY_MAX_VIDEO_COUNT = 16;
export const GALLERY_MAX_ITEM_CAPTION_LENGTH = 400;

function sanitizeCaptionInput(v: unknown): string {
  const s = typeof v === "string" ? v : String(v ?? "");
  return s.trim().slice(0, GALLERY_MAX_ITEM_CAPTION_LENGTH);
}

/** Optional JSON array of strings, one per item in the same order as `item_order` / `album_item_order`. */
export function parseItemCaptionsField(
  raw: string,
  expectedLength: number,
): { captions: string[] | null; error?: string } {
  const t = raw.trim();
  if (!t) return { captions: null };
  let parsed: unknown;
  try {
    parsed = JSON.parse(t) as unknown;
  } catch {
    return { captions: null, error: "Neispravan JSON za natpise ispod medija." };
  }
  if (!Array.isArray(parsed)) {
    return { captions: null, error: "Natpisi moraju biti JSON polje (niz tekstova)." };
  }
  if (parsed.length !== expectedLength) {
    return { captions: null, error: "Broj natpisa ne odgovara broju stavki." };
  }
  return { captions: parsed.map(sanitizeCaptionInput) };
}

export function applyItemCaptionsParallel(items: GalleryItem[], captions: string[]): GalleryItem[] {
  return items.map((item, i) => withItemCaption(item, captions[i] ?? ""));
}

function withItemCaption(item: GalleryItem, caption: string): GalleryItem {
  const t = caption.trim().slice(0, GALLERY_MAX_ITEM_CAPTION_LENGTH);
  if (t.length === 0) {
    if (!("caption" in item) || item.caption === undefined) return item;
    const { caption: _drop, ...rest } = item as GalleryItem & { caption?: string };
    return rest as GalleryItem;
  }
  return { ...item, caption: t };
}

export function safeGalleryBaseName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return base.length > 0 ? base : "datoteka";
}

export function validateAlbumPatchLayoutOrder(
  tokens: string[],
  existingItemCount: number,
  removeSet: Set<number>,
  nFiles: number,
  nYt: number,
): { ok: true } | { ok: false; error: string } {
  let kept = 0;
  for (let i = 0; i < existingItemCount; i++) {
    if (!removeSet.has(i)) kept += 1;
  }
  if (tokens.length !== kept + nFiles + nYt) {
    return { ok: false, error: "Redoslijed ne odgovara broju stavki." };
  }
  const seenE = new Set<number>();
  const seenF = new Set<number>();
  const seenY = new Set<number>();
  for (const token of tokens) {
    if (/^e(\d+)$/.test(token)) {
      const i = parseInt(token.slice(1), 10);
      if (i < 0 || i >= existingItemCount || removeSet.has(i) || seenE.has(i)) {
        return { ok: false, error: "Neispravan redoslijed (postojeće stavke)." };
      }
      seenE.add(i);
    } else if (/^f(\d+)$/.test(token)) {
      const i = parseInt(token.slice(1), 10);
      if (i < 0 || i >= nFiles || seenF.has(i)) {
        return { ok: false, error: "Neispravan redoslijed (datoteke)." };
      }
      seenF.add(i);
    } else if (/^y(\d+)$/.test(token)) {
      const i = parseInt(token.slice(1), 10);
      if (i < 0 || i >= nYt || seenY.has(i)) {
        return { ok: false, error: "Neispravan redoslijed (YouTube)." };
      }
      seenY.add(i);
    } else {
      return { ok: false, error: "Neispravan token u redoslijedu albuma." };
    }
  }
  if (seenF.size !== nFiles || seenY.size !== nYt) {
    return { ok: false, error: "Redoslijed mora točno jednom pokriti svaku novu stavku." };
  }
  for (let i = 0; i < existingItemCount; i++) {
    if (!removeSet.has(i) && !seenE.has(i)) {
      return { ok: false, error: "Nedostaje postojeća stavka u redoslijedu." };
    }
  }
  return { ok: true };
}

function validateItemOrder(order: string[], nFiles: number, nYt: number): { ok: true } | { ok: false; error: string } {
  const expected = nFiles + nYt;
  if (order.length !== expected) {
    return { ok: false, error: "Redoslijed mora uključivati sve dodane datoteke i sve YouTube stavke." };
  }
  const seenF = new Set<number>();
  const seenY = new Set<number>();
  for (const token of order) {
    if (/^f\d+$/.test(token)) {
      const i = parseInt(token.slice(1), 10);
      if (i < 0 || i >= nFiles || seenF.has(i)) {
        return { ok: false, error: "Neispravan redoslijed (datoteke)." };
      }
      seenF.add(i);
    } else if (/^y\d+$/.test(token)) {
      const i = parseInt(token.slice(1), 10);
      if (i < 0 || i >= nYt || seenY.has(i)) {
        return { ok: false, error: "Neispravan redoslijed (YouTube)." };
      }
      seenY.add(i);
    } else {
      return { ok: false, error: "Neispravan token u redoslijedu." };
    }
  }
  if (seenF.size !== nFiles || seenY.size !== nYt) {
    return { ok: false, error: "Redoslijed mora točno jednom pokriti svaku stavku." };
  }
  return { ok: true };
}

async function fileToGalleryItem(
  file: File,
  uploadDir: string,
  imageOrdinal: number,
): Promise<GalleryImage | GalleryVideoFile | { error: string }> {
  if (GALLERY_IMAGE_TYPES.has(file.type)) {
    if (file.size > GALLERY_MAX_IMAGE_BYTES) {
      return { error: "Jedna od slika je prevelika (max 12 MB)." };
    }
    const ext =
      file.type === "image/jpeg"
        ? ".jpg"
        : file.type === "image/png"
          ? ".png"
          : file.type === "image/webp"
            ? ".webp"
            : ".gif";
    const fileName = `${randomUUID()}-${safeGalleryBaseName(file.name.replace(/\.[^.]+$/, ""))}${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), buf);
    const src = `/uploads/gallery/${fileName}`;
    const altBase = safeGalleryBaseName(file.name.replace(/\.[^.]+$/, ""));
    const img: GalleryImage = {
      kind: "image",
      src,
      alt: altBase.length > 0 ? altBase.replace(/_/g, " ") : `Fotografija ${imageOrdinal}`,
    };
    return img;
  }
  if (GALLERY_VIDEO_TYPES.has(file.type)) {
    if (file.size > GALLERY_MAX_VIDEO_BYTES) {
      return { error: "Jedan od video zapisa je prevelik (max 100 MB)." };
    }
    const ext = file.type === "video/webm" ? ".webm" : ".mp4";
    const fileName = `${randomUUID()}-${safeGalleryBaseName(file.name.replace(/\.[^.]+$/, ""))}${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), buf);
    const src = `/uploads/gallery/${fileName}`;
    const titleBase = safeGalleryBaseName(file.name.replace(/\.[^.]+$/, ""));
    const vf: GalleryVideoFile = {
      kind: "videoFile",
      src,
      title: titleBase.length > 0 ? titleBase.replace(/_/g, " ") : "Video",
    };
    return vf;
  }
  return { error: "Datoteka mora biti slika (JPEG, PNG, WebP, GIF) ili video (MP4, WebM)." };
}

/** Upload + parse `media` and `youtube` without applying `item_order` (used by PATCH layout merge). */
export async function buildIndexedNewGalleryMediaFromForm(
  form: FormData,
  uploadDir: string,
): Promise<{ fileItems: GalleryItem[]; youtubeItems: GalleryYouTube[]; error?: string }> {
  const youtubeRaw = String(form.get("youtube") ?? "").trim();
  const ytParsed = parseGalleryYoutubeField(youtubeRaw);
  if (ytParsed.error) {
    return { fileItems: [], youtubeItems: [], error: ytParsed.error };
  }

  const mediaFields = form.getAll("media");
  const mediaFiles = mediaFields.filter((x): x is File => x instanceof File && x.size > 0);

  let imageCount = 0;
  for (const file of mediaFiles) {
    if (GALLERY_IMAGE_TYPES.has(file.type)) imageCount += 1;
  }
  if (imageCount > GALLERY_MAX_IMAGE_COUNT) {
    return { fileItems: [], youtubeItems: [], error: `Najviše ${GALLERY_MAX_IMAGE_COUNT} slika odjednom.` };
  }
  const videoCount = mediaFiles.filter((f) => GALLERY_VIDEO_TYPES.has(f.type)).length;
  if (videoCount > GALLERY_MAX_VIDEO_COUNT) {
    return { fileItems: [], youtubeItems: [], error: `Najviše ${GALLERY_MAX_VIDEO_COUNT} video zapisa odjednom.` };
  }

  const fileItems: GalleryItem[] = [];
  let imgOrdinal = 0;
  for (const file of mediaFiles) {
    const item = await fileToGalleryItem(file, uploadDir, imgOrdinal + 1);
    if ("error" in item) {
      return { fileItems: [], youtubeItems: [], error: item.error };
    }
    if (item.kind === "image") imgOrdinal += 1;
    fileItems.push(item);
  }

  return { fileItems, youtubeItems: ytParsed.items };
}

/**
 * Builds ordered `GalleryItem[]` from FormData:
 * - `media`: repeated file fields (images + videos), browser order = pick order
 * - `youtube`: multi-line YouTube field
 * - `item_order`: optional JSON string array, e.g. `["f0","y0","f1"]` — f* indexes `media` files, y* indexes parsed YouTube lines
 */
export async function buildOrderedGalleryItemsFromForm(
  form: FormData,
  uploadDir: string,
): Promise<{ items: GalleryItem[]; error?: string }> {
  const indexed = await buildIndexedNewGalleryMediaFromForm(form, uploadDir);
  if (indexed.error) {
    return { items: [], error: indexed.error };
  }
  const { fileItems, youtubeItems } = indexed;
  const n = fileItems.length;
  const m = youtubeItems.length;
  const orderRaw = String(form.get("item_order") ?? "").trim();
  let order: string[];
  if (!orderRaw) {
    order = [...Array(n).keys()].map((i) => `f${i}`).concat([...Array(m).keys()].map((i) => `y${i}`));
  } else {
    let parsed: unknown;
    try {
      parsed = JSON.parse(orderRaw) as unknown;
    } catch {
      return { items: [], error: "Neispravan JSON za redoslijed." };
    }
    if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === "string")) {
      return { items: [], error: "Neispravan redoslijed." };
    }
    order = parsed as string[];
  }

  const v = validateItemOrder(order, n, m);
  if (!v.ok) {
    return { items: [], error: v.error };
  }

  const items: GalleryItem[] = [];
  for (const token of order) {
    if (token.startsWith("f")) {
      const i = parseInt(token.slice(1), 10);
      items.push(fileItems[i]!);
    } else {
      const i = parseInt(token.slice(1), 10);
      items.push(youtubeItems[i]!);
    }
  }
  const capRaw = String(form.get("new_item_captions") ?? "");
  const capParsed = parseItemCaptionsField(capRaw, items.length);
  if (capParsed.error) {
    return { items: [], error: capParsed.error };
  }
  const out = capParsed.captions ? applyItemCaptionsParallel(items, capParsed.captions) : items;
  return { items: out };
}

/** Merge kept existing items (by original index) with new uploads per `album_item_order` tokens (`e0`,`f0`,`y0`,…). */
export async function buildAlbumItemsFromPatchLayout(
  existingItems: GalleryItem[],
  removeSet: Set<number>,
  form: FormData,
  uploadDir: string,
  tokens: string[],
): Promise<{ items: GalleryItem[]; error?: string }> {
  const indexed = await buildIndexedNewGalleryMediaFromForm(form, uploadDir);
  if (indexed.error) {
    return { items: [], error: indexed.error };
  }
  const v = validateAlbumPatchLayoutOrder(
    tokens,
    existingItems.length,
    removeSet,
    indexed.fileItems.length,
    indexed.youtubeItems.length,
  );
  if (!v.ok) {
    return { items: [], error: v.error };
  }
  const items: GalleryItem[] = [];
  for (const t of tokens) {
    if (t.startsWith("e")) {
      const i = parseInt(t.slice(1), 10);
      items.push(existingItems[i]!);
    } else if (t.startsWith("f")) {
      const i = parseInt(t.slice(1), 10);
      items.push(indexed.fileItems[i]!);
    } else {
      const i = parseInt(t.slice(1), 10);
      items.push(indexed.youtubeItems[i]!);
    }
  }
  const capRaw = String(form.get("album_item_captions") ?? "");
  const capParsed = parseItemCaptionsField(capRaw, items.length);
  if (capParsed.error) {
    return { items: [], error: capParsed.error };
  }
  const out = capParsed.captions ? applyItemCaptionsParallel(items, capParsed.captions) : items;
  return { items: out };
}
