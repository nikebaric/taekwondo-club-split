/**
 * Next.js Route Handler — PATCH & DELETE /api/news/[slug]
 *
 * KEY CONCEPTS:
 * - **Dynamic route segments**: The `[slug]` folder name creates a dynamic parameter.
 *   When a request hits `/api/news/my-post`, Next.js passes `{ slug: "my-post" }` as
 *   `ctx.params`. In Next.js 15+, `params` is a Promise that must be awaited.
 * - **Multiple HTTP methods in one file**: Exporting both `PATCH` and `DELETE` functions
 *   from a single `route.ts` file lets you handle different operations on the same
 *   resource (RESTful pattern: PATCH to update, DELETE to remove).
 * - **File cleanup on delete**: When removing a post, associated uploaded files should
 *   be deleted from disk too — otherwise "orphan" files accumulate. The `unlink()` call
 *   is wrapped in try/catch because the file might already be gone.
 * - **`export const runtime = "nodejs"`**: Required here for filesystem operations
 *   (writing/deleting files) which aren't available in the Edge Runtime.
 */
import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { formatArticleCreditFromAuthor, resolveArticleCreditLine } from "@/lib/article-credit";
import { getMemberSession } from "@/lib/auth-check";
import { parseCoverImageIndex } from "@/lib/news-cover";
import {
  composeNewsDescriptionHtml,
  inferVideoMime,
  normalizeNewsDescriptionPlain,
} from "@/lib/news-compose-body";
import {
  deleteLocalPostBySlug,
  findLocalPostBySlug,
  readLocalNewsPosts,
  replaceLocalPostBySlug,
  uniqueSlug,
} from "@/lib/news-store";
import type { LocalNewsPost } from "@/lib/local-news-types";
import { sessionCookieName, verifySessionToken } from "@/lib/session";
import { parsePublishedDateFromForm } from "@/lib/news-published-at";
import { slugify } from "@/lib/slug";
import { parseYoutubeEmbedUrl } from "@/lib/youtube-embed";

export const runtime = "nodejs";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_IMAGE_COUNT = 24;
const MAX_VIDEO_COUNT = 8;

function safeBaseName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return base.length > 0 ? base : "datoteka";
}

/**
 * Delete an uploaded file from the `public/` directory.
 * Only processes paths starting with "/uploads/" to prevent accidental deletion of
 * other files (a basic safety check against path traversal).
 */
async function unlinkPublicUpload(rel: string | null | undefined) {
  if (!rel?.startsWith("/uploads/")) return;
  // Convert the URL path back to a filesystem path
  const full = join(process.cwd(), "public", rel.replace(/^\//, ""));
  try {
    await unlink(full);
  } catch {
    /* ignore — file may already be deleted or never existed */
  }
}

async function unlinkMany(paths: Iterable<string>) {
  for (const p of paths) {
    await unlinkPublicUpload(p);
  }
}

function parseYoutubeLines(raw: string): { embeds: string[]; error?: string } {
  const lines = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const embeds: string[] = [];
  for (const line of lines) {
    const e = parseYoutubeEmbedUrl(line);
    if (!e) {
      return {
        embeds: [],
        error: `Neispravan YouTube link: ${line.slice(0, 48)}${line.length > 48 ? "…" : ""}`,
      };
    }
    embeds.push(e);
  }
  return { embeds };
}

/** Extract existing image sources from a post, handling both gallery and legacy single-image formats */
function existingGalleryImages(e: LocalNewsPost): string[] {
  if (e.galleryImageSrcs && e.galleryImageSrcs.length > 0) return [...e.galleryImageSrcs];
  if (e.imageSrc) return [e.imageSrc];
  return [];
}

function existingGalleryVideos(e: LocalNewsPost): Array<{ src: string; mime: string }> {
  if (e.galleryVideos && e.galleryVideos.length > 0) return [...e.galleryVideos];
  if (e.videoSrc) {
    const mime = e.videoMime ?? inferVideoMime(e.videoSrc) ?? "video/mp4";
    return [{ src: e.videoSrc, mime }];
  }
  return [];
}

/**
 * Route context type for dynamic segments. In Next.js 15+, `params` is a Promise
 * (not a plain object) — you must `await ctx.params` to read the values.
 * This is a breaking change from earlier Next.js versions.
 */
type RouteCtx = { params: Promise<{ slug: string }> };

/**
 * PATCH handler — update an existing news post.
 * The second parameter `ctx` provides route context including dynamic segment values.
 */
export async function PATCH(request: Request, ctx: RouteCtx) {
  const store = await cookies();
  if (!verifySessionToken(store.get(sessionCookieName())?.value)) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  // Destructure the slug from the awaited params Promise
  const { slug: oldSlug } = await ctx.params;
  const existing = await findLocalPostBySlug(oldSlug);
  if (!existing) {
    return Response.json({ ok: false, error: "Članak nije pronađen." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim();
  const descriptionRaw = String(form.get("description") ?? "").trim();
  const description = normalizeNewsDescriptionPlain(descriptionRaw);
  const youtubeRaw = String(form.get("youtube") ?? "").trim();
  // FormData checkboxes send "on" when checked and are absent when unchecked
  const removeAllImages = form.get("remove_all_images") === "on";
  const removeAllVideos = form.get("remove_all_videos") === "on";

  if (title.length < 1 || title.length > 200) {
    return Response.json({ ok: false, error: "Naslov mora imati 1–200 znakova." }, { status: 400 });
  }
  if (description.length < 1 || description.length > 80000) {
    return Response.json({ ok: false, error: "Opis mora imati 1–80000 znakova." }, { status: 400 });
  }

  const ytParsed = parseYoutubeLines(youtubeRaw);
  if (ytParsed.error) {
    return Response.json({ ok: false, error: ytParsed.error }, { status: 400 });
  }
  const youtubeEmbeds = ytParsed.embeds;

  const publishedParsed = parsePublishedDateFromForm(form);
  if (!publishedParsed.ok) {
    return Response.json({ ok: false, error: publishedParsed.error }, { status: 400 });
  }
  const publishedAtIso = publishedParsed.iso;

  const imageFields = form.getAll("images");
  const videoFields = form.getAll("videos");
  const imageFiles = imageFields.filter((x): x is File => x instanceof File && x.size > 0);
  const videoFiles = videoFields.filter((x): x is File => x instanceof File && x.size > 0);

  if (imageFiles.length > MAX_IMAGE_COUNT) {
    return Response.json({ ok: false, error: `Najviše ${MAX_IMAGE_COUNT} slika.` }, { status: 400 });
  }
  if (videoFiles.length > MAX_VIDEO_COUNT) {
    return Response.json({ ok: false, error: `Najviše ${MAX_VIDEO_COUNT} video zapisa.` }, { status: 400 });
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

  const uploadDir = join(process.cwd(), "public", "uploads", "news");
  await mkdir(uploadDir, { recursive: true });

  // Start with existing media, then handle removal and replacement.
  // This "merge" approach lets users keep old images while adding new ones.
  let galleryImageSrcs = existingGalleryImages(existing);
  let galleryVideos = existingGalleryVideos(existing);

  // If the user explicitly requested removal, delete files from disk and clear the list
  if (removeAllImages) {
    await unlinkMany(galleryImageSrcs);
    galleryImageSrcs = [];
  }

  if (removeAllVideos) {
    await unlinkMany(galleryVideos.map((v) => v.src));
    galleryVideos = [];
  }

  // If new images are uploaded, they replace all existing images (old files are deleted)
  if (imageFiles.length > 0) {
    await unlinkMany(galleryImageSrcs);
    galleryImageSrcs = [];
    for (const imageFile of imageFiles) {
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
      galleryImageSrcs.push(`/uploads/news/${fileName}`);
    }
  }

  if (videoFiles.length > 0) {
    await unlinkMany(galleryVideos.map((v) => v.src));
    galleryVideos = [];
    for (const videoFile of videoFiles) {
      const mime = videoFile.type === "video/webm" ? "video/webm" : "video/mp4";
      const ext = mime === "video/webm" ? ".webm" : ".mp4";
      const fileName = `${randomUUID()}-${safeBaseName(videoFile.name.replace(/\.[^.]+$/, ""))}${ext}`;
      const buf = Buffer.from(await videoFile.arrayBuffer());
      await writeFile(join(uploadDir, fileName), buf);
      galleryVideos.push({ src: `/uploads/news/${fileName}`, mime });
    }
  }

  const bodyHtml = composeNewsDescriptionHtml(description);

  // When the title changes, the slug changes too. Exclude the current post from
  // uniqueness checks so renaming "My Post" back to "My Post" doesn't append "-2".
  const allPosts = await readLocalNewsPosts();
  const others = allPosts.filter((p) => p.slug !== oldSlug);
  const newSlug = uniqueSlug(slugify(title), others);

  const excerptPlain = description.slice(0, 600);

  const coverIdx = parseCoverImageIndex(form, galleryImageSrcs.length);
  const coverImageSrc = galleryImageSrcs.length > 0 ? galleryImageSrcs[coverIdx]! : null;

  const session = await getMemberSession();
  const createdByLineFallback =
    session ? formatArticleCreditFromAuthor(session.name) : resolveArticleCreditLine();

  // Spread `...existing` preserves fields not explicitly listed (like `id`),
  // then the following properties override only what changed.
  const updated: LocalNewsPost = {
    ...existing,
    slug: newSlug,
    title,
    excerptPlain,
    bodyHtml,
    date: publishedAtIso,
    descriptionPlain: description,
    galleryImageSrcs: galleryImageSrcs.length > 0 ? galleryImageSrcs : null,
    galleryYoutubeEmbeds: youtubeEmbeds.length > 0 ? youtubeEmbeds : null,
    galleryVideos: galleryVideos.length > 0 ? galleryVideos : null,
    coverImageSrc,
    imageSrc: coverImageSrc,
    videoSrc: galleryVideos[0]?.src ?? null,
    videoMime: galleryVideos[0]?.mime,
    youtubeEmbedStored: youtubeEmbeds[0] ?? null,
    createdByLine: existing.createdByLine?.trim() || createdByLineFallback,
  };

  const ok = await replaceLocalPostBySlug(oldSlug, updated);
  if (!ok) {
    return Response.json({ ok: false, error: "Ažuriranje nije uspjelo." }, { status: 500 });
  }

  // Revalidate the old slug page, the new slug page (if changed), and listing pages
  revalidatePath("/");
  revalidatePath("/portal-novosti");
  revalidatePath(`/portal-novosti/${oldSlug}`);
  if (newSlug !== oldSlug) {
    revalidatePath(`/portal-novosti/${newSlug}`);
  }

  return Response.json({ ok: true, slug: newSlug });
}

/**
 * DELETE handler — remove a news post and clean up its files.
 * The `_request` prefix (underscore) is a convention meaning "unused parameter" —
 * TypeScript requires us to declare it because `ctx` is the second parameter.
 */
export async function DELETE(_request: Request, ctx: RouteCtx) {
  const store = await cookies();
  if (!verifySessionToken(store.get(sessionCookieName())?.value)) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  const { slug } = await ctx.params;
  // `deleteLocalPostBySlug` returns the deleted post (or null if not found),
  // which we need to know which files to clean up
  const removed = await deleteLocalPostBySlug(slug);
  if (!removed) {
    return Response.json({ ok: false, error: "Članak nije pronađen." }, { status: 404 });
  }

  // Collect all file paths that need cleanup — handles both gallery arrays and
  // legacy single-file fields for backwards compatibility
  const imgs = removed.galleryImageSrcs?.length ? removed.galleryImageSrcs : removed.imageSrc ? [removed.imageSrc] : [];
  const vids =
    removed.galleryVideos?.length ?
      removed.galleryVideos.map((v) => v.src)
    : removed.videoSrc ? [removed.videoSrc]
    : [];

  // Delete the actual files from disk
  await unlinkMany(imgs);
  await unlinkMany(vids);

  revalidatePath("/");
  revalidatePath("/portal-novosti");
  revalidatePath(`/portal-novosti/${slug}`);

  return Response.json({ ok: true });
}
