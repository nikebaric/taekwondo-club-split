/**
 * Next.js Route Handler — POST /api/news
 *
 * KEY CONCEPTS:
 * - **FormData handling**: Unlike JSON APIs, file uploads use `multipart/form-data`.
 *   The `request.formData()` method parses this encoding, returning a `FormData` object
 *   where text fields are strings and file fields are `File` objects (Web API).
 * - **Filesystem operations in API routes**: Next.js API routes run on Node.js, so they
 *   can use `fs/promises` to read/write files. Here, uploaded images/videos are saved to
 *   `public/uploads/` so they can be served as static assets.
 * - **Slug generation**: A "slug" is a URL-friendly version of a title (e.g., "My Post"
 *   → "my-post"). The `uniqueSlug` helper ensures no two posts share the same URL.
 * - **JSON file as database**: Instead of PostgreSQL/MongoDB, this project stores news
 *   posts in a JSON file on disk — simple for small sites, no DB setup required.
 * - **revalidatePath()**: Next.js caches rendered pages for performance. After creating
 *   a new post, we call `revalidatePath` to tell Next.js "this page's data changed —
 *   regenerate it on the next request" (on-demand Incremental Static Regeneration).
 * - **`export const runtime = "nodejs"`**: Tells Next.js this route must run in the
 *   Node.js runtime (not Edge), which is required for filesystem access.
 */
import { mkdir, writeFile } from "fs/promises";
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
import { appendLocalNewsPost, readLocalNewsPosts, uniqueSlug } from "@/lib/news-store";
import type { LocalNewsPost } from "@/lib/local-news-types";
import { sessionCookieName, verifySessionToken } from "@/lib/session";
import { parsePublishedDateFromForm } from "@/lib/news-published-at";
import { slugify } from "@/lib/slug";
import { parseYoutubeEmbedUrl } from "@/lib/youtube-embed";

// Force the Node.js runtime — Edge Runtime doesn't support `fs` or `crypto.randomUUID`
export const runtime = "nodejs";

// Using Set for O(1) lookup when validating MIME types.
// These constants define the "allow list" of accepted file formats and size limits.
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_IMAGE_COUNT = 24;
const MAX_VIDEO_COUNT = 8;

/**
 * Sanitize a filename by replacing any character that's not alphanumeric, dot, dash,
 * or underscore. This prevents directory traversal attacks (e.g., "../../etc/passwd")
 * and filesystem issues with special characters.
 */
function safeBaseName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return base.length > 0 ? base : "datoteka";
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
        error: `Neispravan YouTube link (provjerite svaki red): ${line.slice(0, 48)}${line.length > 48 ? "…" : ""}`,
      };
    }
    embeds.push(e);
  }
  return { embeds };
}

export async function POST(request: Request) {
  // Authentication check: read the session cookie and verify its HMAC signature.
  // `cookies()` is a Next.js server function that reads incoming request cookies.
  const store = await cookies();
  if (!verifySessionToken(store.get(sessionCookieName())?.value)) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  // Parse the multipart form data — this is how browsers send file uploads.
  // Unlike `request.json()`, `request.formData()` handles both text fields and files.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
  }

  // `form.get("field")` returns `FormDataEntryValue | null`. For text fields we
  // coerce to string; for files, `form.getAll()` returns an array (used below).
  const title = String(form.get("title") ?? "").trim();
  const descriptionRaw = String(form.get("description") ?? "").trim();
  const description = normalizeNewsDescriptionPlain(descriptionRaw);
  const youtubeRaw = String(form.get("youtube") ?? "").trim();

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

  // `form.getAll("images")` returns ALL entries with that name (HTML forms can send
  // multiple files under the same field name via `<input type="file" multiple>`).
  // The `.filter()` uses a TypeScript type predicate `(x): x is File` to narrow the
  // union type `FormDataEntryValue` (string | File) down to just `File`.
  const imageFields = form.getAll("images");
  const videoFields = form.getAll("videos");
  const imageFiles = imageFields.filter((x): x is File => x instanceof File && x.size > 0);
  const videoFiles = videoFields.filter((x): x is File => x instanceof File && x.size > 0);

  if (imageFiles.length > MAX_IMAGE_COUNT) {
    return Response.json(
      { ok: false, error: `Najviše ${MAX_IMAGE_COUNT} slika odjednom.` },
      { status: 400 },
    );
  }
  if (videoFiles.length > MAX_VIDEO_COUNT) {
    return Response.json(
      { ok: false, error: `Najviše ${MAX_VIDEO_COUNT} video datoteka odjednom.` },
      { status: 400 },
    );
  }

  // Validate each file's MIME type and size before writing to disk.
  // This is a security measure — never trust `Content-Type` blindly, but at minimum
  // check it against an allow list.
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
      return Response.json(
        { ok: false, error: "Video mora biti MP4 ili WebM." },
        { status: 400 },
      );
    }
    if (videoFile.size > MAX_VIDEO_BYTES) {
      return Response.json({ ok: false, error: "Jedan od video zapisa je prevelik (max 100 MB)." }, { status: 400 });
    }
  }

  // `process.cwd()` returns the project root. Files in `public/` are served as static
  // assets by Next.js (e.g., `/uploads/news/abc.jpg` maps to `public/uploads/news/abc.jpg`).
  // `{ recursive: true }` creates parent directories if they don't exist (like `mkdir -p`).
  const uploadDir = join(process.cwd(), "public", "uploads", "news");
  await mkdir(uploadDir, { recursive: true });

  // Save each image to disk with a UUID prefix to prevent filename collisions
  const galleryImageSrcs: string[] = [];
  for (const imageFile of imageFiles) {
    const ext =
      imageFile.type === "image/jpeg"
        ? ".jpg"
        : imageFile.type === "image/png"
          ? ".png"
          : imageFile.type === "image/webp"
            ? ".webp"
            : ".gif";
    // UUID ensures uniqueness even if two users upload "photo.jpg" simultaneously
    const fileName = `${randomUUID()}-${safeBaseName(imageFile.name.replace(/\.[^.]+$/, ""))}${ext}`;
    // File Web API → ArrayBuffer → Node.js Buffer → disk
    const buf = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(join(uploadDir, fileName), buf);
    // Store the public URL path (not the filesystem path) for the frontend to reference
    galleryImageSrcs.push(`/uploads/news/${fileName}`);
  }

  const galleryVideos: Array<{ src: string; mime: string }> = [];
  for (const videoFile of videoFiles) {
    const mime = videoFile.type === "video/webm" ? "video/webm" : "video/mp4";
    const ext = mime === "video/webm" ? ".webm" : ".mp4";
    const fileName = `${randomUUID()}-${safeBaseName(videoFile.name.replace(/\.[^.]+$/, ""))}${ext}`;
    const buf = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(join(uploadDir, fileName), buf);
    galleryVideos.push({ src: `/uploads/news/${fileName}`, mime });
  }

  const bodyHtml = composeNewsDescriptionHtml(description);

  // Generate a unique slug for the URL (e.g., "moj-post" or "moj-post-2" if taken).
  // `readLocalNewsPosts` loads all existing posts from the JSON file to check for duplicates.
  const existing = await readLocalNewsPosts();
  const id = existing.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const slug = uniqueSlug(slugify(title), existing);
  const excerptPlain = description.slice(0, 600);

  const coverIdx = parseCoverImageIndex(form, galleryImageSrcs.length);
  const coverImageSrc = galleryImageSrcs.length > 0 ? galleryImageSrcs[coverIdx]! : null;

  const session = await getMemberSession();
  const createdByLine = session
    ? formatArticleCreditFromAuthor(session.name)
    : resolveArticleCreditLine();

  // Build the post object matching the LocalNewsPost type, then append to the JSON store
  const post: LocalNewsPost = {
    id,
    slug,
    title,
    excerptPlain,
    bodyHtml,
    date: publishedAtIso,
    createdByLine,
    descriptionPlain: description,
    galleryImageSrcs: galleryImageSrcs.length > 0 ? galleryImageSrcs : null,
    galleryYoutubeEmbeds: youtubeEmbeds.length > 0 ? youtubeEmbeds : null,
    galleryVideos: galleryVideos.length > 0 ? galleryVideos : null,
    coverImageSrc,
    imageSrc: coverImageSrc,
    videoSrc: galleryVideos[0]?.src ?? null,
    videoMime: galleryVideos[0]?.mime,
    youtubeEmbedStored: youtubeEmbeds[0] ?? null,
  };

  await appendLocalNewsPost(post);

  // Invalidate the Next.js page cache so the new post appears immediately.
  // Without this, users would see stale cached pages until the cache expires.
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);

  return Response.json({ ok: true, slug });
}
