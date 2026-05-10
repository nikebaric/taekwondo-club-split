import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { GalleryAlbum, GalleryImage, GalleryItem, GalleryVideoFile, GalleryYouTube } from "@/config/gallery";
import { isGalleryManagedUpload } from "@/lib/gallery-upload-path";
import {
  deleteGalleryAlbumBySlug,
  findGalleryAlbumBySlug,
  readGalleryAlbums,
  replaceGalleryAlbumBySlug,
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

async function unlinkPublicUpload(rel: string | null | undefined) {
  if (!rel?.startsWith("/uploads/")) return;
  const full = join(process.cwd(), "public", rel.replace(/^\//, ""));
  try {
    await unlink(full);
  } catch {
    /* ignore */
  }
}

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
  const youtubeRaw = String(form.get("youtube") ?? "").trim();
  const removeRaw = String(form.get("remove_indices") ?? "").trim();
  const clearCover = form.get("clear_cover") === "on";

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

  const removeSet = parseRemoveIndices(removeRaw);

  let items: GalleryItem[] = [...existing.items];
  const removedForUnlink: GalleryItem[] = [];

  if (removeSet.size > 0) {
    const next: GalleryItem[] = [];
    items.forEach((item, idx) => {
      if (removeSet.has(idx)) {
        removedForUnlink.push(item);
      } else {
        next.push(item);
      }
    });
    items = next;
  }

  for (const item of removedForUnlink) {
    if (item.kind === "image" || item.kind === "videoFile") {
      if (isGalleryManagedUpload(item.src)) await unlinkPublicUpload(item.src);
    }
  }

  const uploadDir = join(process.cwd(), "public", "uploads", "gallery");
  await mkdir(uploadDir, { recursive: true });

  let imgIdx = items.filter((i) => i.kind === "image").length;
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

  items.push(...ytParsed.items);

  if (items.length === 0) {
    return Response.json(
      { ok: false, error: "Album mora imati barem jednu stavku (ili uklonite manje stavki i dodajte nove medije)." },
      { status: 400 },
    );
  }

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

  for (const item of removed.items) {
    if (item.kind === "image" || item.kind === "videoFile") {
      if (isGalleryManagedUpload(item.src)) await unlinkPublicUpload(item.src);
    }
  }

  revalidatePath("/galerija");
  revalidatePath(`/galerija/${slug}`);

  return Response.json({ ok: true });
}
