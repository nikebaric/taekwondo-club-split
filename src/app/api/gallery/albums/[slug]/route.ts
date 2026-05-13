/**
 * Next.js Route Handler — PATCH & DELETE /api/gallery/albums/[slug]
 *
 * KEY CONCEPTS:
 * - **Complex update with mixed operations**: The PATCH handler simultaneously handles
 *   removing specific items by index, uploading new files, and adding YouTube links —
 *   all in a single request. This is more complex than simple JSON PATCH because it
 *   combines FormData (for files) with structured metadata.
 * - **Index-based item removal**: The client sends `remove_indices` (e.g., "0,3,5") to
 *   indicate which items to delete. The server filters them out and also deletes the
 *   associated files from disk — only if they're managed uploads (not external URLs).
 * - **Slug collision avoidance on update**: When the user changes the album slug, we
 *   must check against other albums (excluding the current one) to avoid duplicates.
 * - **Cleanup on DELETE**: When deleting an entire album, all associated uploaded files
 *   (images and videos) are removed from disk to prevent orphaned files.
 */
import { unlink } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";
import type { GalleryAlbum, GalleryItem } from "@/config/gallery";
import { isGalleryManagedUpload } from "@/lib/gallery-upload-path";
import { buildAlbumItemsFromPatchLayout, buildOrderedGalleryItemsFromForm } from "@/lib/gallery-ordered-media";
import {
  deleteGalleryAlbumBySlug,
  findGalleryAlbumBySlug,
  readGalleryAlbums,
  replaceGalleryAlbumBySlug,
  uniqueGallerySlug,
} from "@/lib/gallery-store";
import { isGalleryAdminSession } from "@/lib/auth-check";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

async function unlinkPublicUpload(rel: string | null | undefined) {
  if (!rel?.startsWith("/uploads/")) return;
  const full = join(process.cwd(), "public", rel.replace(/^\//, ""));
  try {
    await unlink(full);
  } catch {
    /* ignore */
  }
}

/**
 * Parse a comma/semicolon/whitespace-separated string of indices into a Set<number>.
 * Used for the `remove_indices` field — e.g., "0,3,5" → Set{0, 3, 5}.
 * Using a Set gives O(1) lookup when filtering items.
 */
function parseRemoveIndices(raw: string): Set<number> {
  const set = new Set<number>();
  for (const part of raw.split(/[,;\s]+/).filter(Boolean)) {
    const n = parseInt(part, 10);
    if (!Number.isNaN(n) && n >= 0) set.add(n);
  }
  return set;
}

type RouteCtx = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  if (!(await isGalleryAdminSession())) {
    return Response.json({ ok: false, error: "Nemate ovlasti za uređivanje galerije." }, { status: 403 });
  }

  const { slug: oldSlug } = await ctx.params;
  const existing = await findGalleryAlbumBySlug(oldSlug);
  if (!existing) {
    return Response.json({ ok: false, error: "Album nije pronađen." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const slugOverride = String(form.get("slug") ?? "").trim();
  const removeRaw = String(form.get("remove_indices") ?? "").trim();
  const clearCover = form.get("clear_cover") === "on";

  if (title.length < 1 || title.length > 200) {
    return Response.json({ ok: false, error: "Naslov mora imati 1–200 znakova." }, { status: 400 });
  }
  if (description.length < 1 || description.length > 4000) {
    return Response.json({ ok: false, error: "Opis mora imati 1–4000 znakova." }, { status: 400 });
  }

  const removeSet = parseRemoveIndices(removeRaw);

  const removedForUnlink: GalleryItem[] = [];
  if (removeSet.size > 0) {
    existing.items.forEach((item, idx) => {
      if (removeSet.has(idx)) removedForUnlink.push(item);
    });
  }

  for (const item of removedForUnlink) {
    if (item.kind === "image" || item.kind === "videoFile") {
      if (isGalleryManagedUpload(item.src)) await unlinkPublicUpload(item.src);
    }
  }

  const uploadDir = join(process.cwd(), "public", "uploads", "gallery");
  const rawAlbumOrder = String(form.get("album_item_order") ?? "").trim();

  let items: GalleryItem[];

  if (rawAlbumOrder.length > 0) {
    let parsedOrder: unknown;
    try {
      parsedOrder = JSON.parse(rawAlbumOrder) as unknown;
    } catch {
      return Response.json({ ok: false, error: "Neispravan JSON za redoslijed albuma." }, { status: 400 });
    }
    if (!Array.isArray(parsedOrder) || !parsedOrder.every((x) => typeof x === "string")) {
      return Response.json({ ok: false, error: "Neispravan redoslijed albuma." }, { status: 400 });
    }
    const merged = await buildAlbumItemsFromPatchLayout(
      existing.items,
      removeSet,
      form,
      uploadDir,
      parsedOrder as string[],
    );
    if (merged.error) {
      return Response.json({ ok: false, error: merged.error }, { status: 400 });
    }
    items = merged.items;
  } else {
    let kept: GalleryItem[] = [...existing.items];
    if (removeSet.size > 0) {
      kept = existing.items.filter((_, idx) => !removeSet.has(idx));
    }
    const appended = await buildOrderedGalleryItemsFromForm(form, uploadDir);
    if (appended.error) {
      return Response.json({ ok: false, error: appended.error }, { status: 400 });
    }
    items = [...kept, ...appended.items];
  }

  if (items.length === 0) {
    return Response.json(
      { ok: false, error: "Album mora imati barem jednu stavku (ili uklonite manje stavki i dodajte nove medije)." },
      { status: 400 },
    );
  }

  // Handle slug changes — check for collisions against all other albums
  const allAlbums = await readGalleryAlbums();
  const others = allAlbums.filter((a) => a.slug !== oldSlug);

  let newSlug = existing.slug;
  if (slugOverride.length > 0) {
    const candidate = slugify(slugOverride);
    if (candidate.length > 0) {
      const taken = new Set(others.map((a) => a.slug));
      if (!taken.has(candidate)) {
        newSlug = candidate;
      } else if (candidate !== oldSlug) {
        newSlug = uniqueGallerySlug(candidate, others);
      }
    }
  }

  const coverSrcRaw = String(form.get("cover_src") ?? "").trim();
  const coverAltRaw = String(form.get("cover_alt") ?? "").trim();

  let coverSrc = existing.coverSrc;
  let coverAlt = existing.coverAlt;
  if (clearCover) {
    coverSrc = undefined;
    coverAlt = undefined;
  } else if (coverSrcRaw && coverAltRaw) {
    coverSrc = coverSrcRaw;
    coverAlt = coverAltRaw;
  }

  // Spread `...existing` preserves any fields not explicitly listed
  const updated: GalleryAlbum = {
    ...existing,
    slug: newSlug,
    title,
    description,
    items,
    coverSrc,
    coverAlt,
  };

  const okReplace = await replaceGalleryAlbumBySlug(oldSlug, updated);
  if (!okReplace) {
    return Response.json({ ok: false, error: "Ažuriranje nije uspjelo." }, { status: 500 });
  }

  revalidatePath("/galerija");
  revalidatePath(`/galerija/${oldSlug}`);
  if (newSlug !== oldSlug) {
    revalidatePath(`/galerija/${newSlug}`);
  }

  return Response.json({ ok: true, slug: newSlug });
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  if (!(await isGalleryAdminSession())) {
    return Response.json({ ok: false, error: "Nemate ovlasti za uređivanje galerije." }, { status: 403 });
  }

  const { slug } = await ctx.params;
  const removed = await deleteGalleryAlbumBySlug(slug);
  if (!removed) {
    return Response.json({ ok: false, error: "Album nije pronađen." }, { status: 404 });
  }

  // Clean up all uploaded files associated with the deleted album.
  // YouTube items (kind: "youtube") have no local files, so they're skipped.
  for (const item of removed.items) {
    if (item.kind === "image" || item.kind === "videoFile") {
      if (isGalleryManagedUpload(item.src)) await unlinkPublicUpload(item.src);
    }
  }

  revalidatePath("/galerija");
  revalidatePath(`/galerija/${slug}`);

  return Response.json({ ok: true });
}
