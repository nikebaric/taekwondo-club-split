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

async function unlinkPublicUpload(rel: string | null | undefined) {
  if (!rel?.startsWith("/uploads/")) return;
  const full = join(process.cwd(), "public", rel.replace(/^\//, ""));
  try {
    await unlink(full);
  } catch {
    /* ignore */
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

type RouteCtx = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  const store = await cookies();
  if (!verifySessionToken(store.get(sessionCookieName())?.value)) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

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

  let galleryImageSrcs = existingGalleryImages(existing);
  let galleryVideos = existingGalleryVideos(existing);

  if (removeAllImages) {
    await unlinkMany(galleryImageSrcs);
    galleryImageSrcs = [];
  }

  if (removeAllVideos) {
    await unlinkMany(galleryVideos.map((v) => v.src));
    galleryVideos = [];
  }

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

  const allPosts = await readLocalNewsPosts();
  const others = allPosts.filter((p) => p.slug !== oldSlug);
  const newSlug = uniqueSlug(slugify(title), others);

  const excerptPlain = description.slice(0, 600);

  const coverIdx = parseCoverImageIndex(form, galleryImageSrcs.length);
  const coverImageSrc = galleryImageSrcs.length > 0 ? galleryImageSrcs[coverIdx]! : null;

  const session = await getMemberSession();
  const createdByLineFallback =
    session ? formatArticleCreditFromAuthor(session.name) : resolveArticleCreditLine();

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

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${oldSlug}`);
  if (newSlug !== oldSlug) {
    revalidatePath(`/news/${newSlug}`);
  }

  return Response.json({ ok: true, slug: newSlug });
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  const store = await cookies();
  if (!verifySessionToken(store.get(sessionCookieName())?.value)) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const removed = await deleteLocalPostBySlug(slug);
  if (!removed) {
    return Response.json({ ok: false, error: "Članak nije pronađen." }, { status: 404 });
  }

  const imgs = removed.galleryImageSrcs?.length ? removed.galleryImageSrcs : removed.imageSrc ? [removed.imageSrc] : [];
  const vids =
    removed.galleryVideos?.length ?
      removed.galleryVideos.map((v) => v.src)
    : removed.videoSrc ? [removed.videoSrc]
    : [];

  await unlinkMany(imgs);
  await unlinkMany(vids);

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);

  return Response.json({ ok: true });
}
