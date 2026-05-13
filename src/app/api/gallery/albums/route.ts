/**
 * Next.js Route Handler — POST /api/gallery/albums
 *
 * KEY CONCEPTS:
 * - **Complex file upload handling**: This route accepts images, videos, AND YouTube
 *   URLs all in a single FormData submission. Each media type has its own validation
 *   rules (allowed MIME types, max size, max count).
 * - **Discriminated union items**: Gallery items use a `kind` field ("image",
 *   "videoFile", "youtube") to distinguish between types. This TypeScript pattern
 *   (discriminated unions) lets the compiler know exactly which properties exist on
 *   each variant when you check `item.kind`.
 * - **Slug from user input or title**: The user can optionally provide a custom slug;
 *   if not, one is generated from the title. Either way, `uniqueGallerySlug` ensures
 *   no collision with existing albums.
 * - **Bulk operations**: Multiple files are processed in a loop, each getting a UUID
 *   filename for uniqueness. The entire album (with all its items) is persisted as a
 *   single JSON record in one atomic append operation.
 */
import { join } from "path";
import { revalidatePath } from "next/cache";
import type { GalleryAlbum } from "@/config/gallery";
import { buildOrderedGalleryItemsFromForm } from "@/lib/gallery-ordered-media";
import {
  appendGalleryAlbum,
  readGalleryAlbums,
  uniqueGallerySlug,
} from "@/lib/gallery-store";
import { isGalleryAdminSession } from "@/lib/auth-check";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Gallery has its own permission check — separate from the general admin check,
  // because a gallery-only editor might not have full admin access
  if (!(await isGalleryAdminSession())) {
    return Response.json({ ok: false, error: "Nemate ovlasti za uređivanje galerije." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  let slugInput = String(form.get("slug") ?? "").trim();

  if (title.length < 1 || title.length > 200) {
    return Response.json({ ok: false, error: "Naslov mora imati 1–200 znakova." }, { status: 400 });
  }
  if (description.length < 1 || description.length > 4000) {
    return Response.json({ ok: false, error: "Opis mora imati 1–4000 znakova." }, { status: 400 });
  }

  const uploadDir = join(process.cwd(), "public", "uploads", "gallery");
  const built = await buildOrderedGalleryItemsFromForm(form, uploadDir);
  if (built.error) {
    return Response.json({ ok: false, error: built.error }, { status: 400 });
  }
  const items = built.items;

  // Generate a unique slug — prefer user-provided slug, fall back to title-based
  const existing = await readGalleryAlbums();
  const baseSlug = slugInput.length > 0 ? slugify(slugInput) : slugify(title);
  const slug = uniqueGallerySlug(baseSlug.length > 0 ? baseSlug : "album", existing);

  // An album with zero items is not useful — require at least one media item
  if (items.length === 0) {
    return Response.json(
      { ok: false, error: "Dodajte barem jednu sliku, video datoteku ili YouTube poveznicu." },
      { status: 400 },
    );
  }

  const coverSrcRaw = String(form.get("cover_src") ?? "").trim();
  const coverAltRaw = String(form.get("cover_alt") ?? "").trim();

  const album: GalleryAlbum = {
    slug,
    title,
    description,
    items,
    ...(coverSrcRaw && coverAltRaw ? { coverSrc: coverSrcRaw, coverAlt: coverAltRaw } : {}),
  };

  await appendGalleryAlbum(album);

  revalidatePath("/galerija");
  revalidatePath(`/galerija/${slug}`);

  return Response.json({ ok: true, slug });
}
