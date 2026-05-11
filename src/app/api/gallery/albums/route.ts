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
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { GalleryAlbum, GalleryImage, GalleryItem, GalleryVideoFile, GalleryYouTube } from "@/config/gallery";
import {
  appendGalleryAlbum,
  readGalleryAlbums,
  uniqueGallerySlug,
} from "@/lib/gallery-store";
import { isGalleryAdminSession } from "@/lib/auth-check";
import { slugify } from "@/lib/slug";
import { parseYoutubeEmbedUrl } from "@/lib/youtube-embed";

export const runtime = "nodejs";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_IMAGE_COUNT = 48;
const MAX_VIDEO_COUNT = 16;

function safeBaseName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return base.length > 0 ? base : "datoteka";
}

/**
 * Parse YouTube URLs from a multi-line text field. Each line can optionally include
 * a title after a pipe character: "https://youtu.be/xyz|My Video Title".
 * Returns a typed array of `GalleryYouTube` items (discriminated union with kind: "youtube").
 */
function parseYoutubeLines(raw: string): { items: GalleryYouTube[]; error?: string } {
  const lines = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const items: GalleryYouTube[] = [];
  for (const line of lines) {
    const pipe = line.indexOf("|");
    const urlPart = pipe >= 0 ? line.slice(0, pipe).trim() : line;
    const titlePart = pipe >= 0 ? line.slice(pipe + 1).trim() : "";
    const embedUrl = parseYoutubeEmbedUrl(urlPart);
    if (!embedUrl) {
      return {
        items: [],
        error: `Neispravan YouTube link: ${urlPart.slice(0, 56)}${urlPart.length > 56 ? "…" : ""}`,
      };
    }
    items.push({
      kind: "youtube",
      embedUrl,
      title: titlePart.length > 0 ? titlePart : "YouTube video",
    });
  }
  return { items };
}

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
  const youtubeRaw = String(form.get("youtube") ?? "").trim();

  if (title.length < 1 || title.length > 200) {
    return Response.json({ ok: false, error: "Naslov mora imati 1–200 znakova." }, { status: 400 });
  }
  if (description.length < 1 || description.length > 4000) {
    return Response.json({ ok: false, error: "Opis mora imati 1–4000 znakova." }, { status: 400 });
  }

  const ytParsed = parseYoutubeLines(youtubeRaw);
  if (ytParsed.error) {
    return Response.json({ ok: false, error: ytParsed.error }, { status: 400 });
  }

  // `form.getAll("images")` returns all files submitted under the "images" field name.
  // The type predicate filter `(x): x is File` narrows `FormDataEntryValue` to `File`.
  const imageFields = form.getAll("images");
  const videoFields = form.getAll("videos");
  const imageFiles = imageFields.filter((x): x is File => x instanceof File && x.size > 0);
  const videoFiles = videoFields.filter((x): x is File => x instanceof File && x.size > 0);

  if (imageFiles.length > MAX_IMAGE_COUNT) {
    return Response.json({ ok: false, error: `Najviše ${MAX_IMAGE_COUNT} slika odjednom.` }, { status: 400 });
  }
  if (videoFiles.length > MAX_VIDEO_COUNT) {
    return Response.json({ ok: false, error: `Najviše ${MAX_VIDEO_COUNT} video zapisa odjednom.` }, { status: 400 });
  }

  for (const imageFile of imageFiles) {
    if (!IMAGE_TYPES.has(imageFile.type)) {
      return Response.json(
        { ok: false, error: "Svaka slika mora biti JPEG, PNG, WebP ili GIF." },
        { status: 400 },
      );
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return Response.json({ ok: false, error: "Jedna od slika je prevelika (max 12 MB)." }, { status: 400 });
    }
  }

  for (const videoFile of videoFiles) {
    if (!VIDEO_TYPES.has(videoFile.type)) {
      return Response.json({ ok: false, error: "Video mora biti MP4 ili WebM." }, { status: 400 });
    }
    if (videoFile.size > MAX_VIDEO_BYTES) {
      return Response.json({ ok: false, error: "Jedan od video zapisa je prevelik (max 100 MB)." }, { status: 400 });
    }
  }

  // Generate a unique slug — prefer user-provided slug, fall back to title-based
  const existing = await readGalleryAlbums();
  const baseSlug = slugInput.length > 0 ? slugify(slugInput) : slugify(title);
  const slug = uniqueGallerySlug(baseSlug.length > 0 ? baseSlug : "album", existing);

  const uploadDir = join(process.cwd(), "public", "uploads", "gallery");
  await mkdir(uploadDir, { recursive: true });

  // Build a heterogeneous array of gallery items (images, videos, YouTube embeds).
  // TypeScript's `GalleryItem[]` is a union type — each element can be any of the
  // three kinds, distinguished by the `kind` property.
  const items: GalleryItem[] = [];

  let imgIdx = 0;
  for (const imageFile of imageFiles) {
    imgIdx += 1;
    const ext =
      imageFile.type === "image/jpeg"
        ? ".jpg"
        : imageFile.type === "image/png"
          ? ".png"
          : imageFile.type === "image/webp"
            ? ".webp"
            : ".gif";
    const fileName = `${randomUUID()}-${safeBaseName(imageFile.name.replace(/\.[^.]+$/, ""))}${ext}`;
    const buf = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(join(uploadDir, fileName), buf);
    const src = `/uploads/gallery/${fileName}`;
    const altBase = safeBaseName(imageFile.name.replace(/\.[^.]+$/, ""));
    // Each item is typed with `kind: "image"` — this is the discriminant field
    const img: GalleryImage = {
      kind: "image",
      src,
      alt: altBase.length > 0 ? altBase.replace(/_/g, " ") : `Fotografija ${imgIdx}`,
    };
    items.push(img);
  }

  for (const videoFile of videoFiles) {
    const ext = videoFile.type === "video/webm" ? ".webm" : ".mp4";
    const fileName = `${randomUUID()}-${safeBaseName(videoFile.name.replace(/\.[^.]+$/, ""))}${ext}`;
    const buf = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(join(uploadDir, fileName), buf);
    const src = `/uploads/gallery/${fileName}`;
    const titleBase = safeBaseName(videoFile.name.replace(/\.[^.]+$/, ""));
    const vf: GalleryVideoFile = {
      kind: "videoFile",
      src,
      title: titleBase.length > 0 ? titleBase.replace(/_/g, " ") : "Video",
    };
    items.push(vf);
  }

  // YouTube items (kind: "youtube") are added after local files
  items.push(...ytParsed.items);

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
