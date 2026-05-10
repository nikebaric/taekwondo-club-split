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
  const store = await cookies();
  if (!verifySessionToken(store.get(sessionCookieName())?.value)) {
    return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
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

  const uploadDir = join(process.cwd(), "public", "uploads", "news");
  await mkdir(uploadDir, { recursive: true });

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
    const fileName = `${randomUUID()}-${safeBaseName(imageFile.name.replace(/\.[^.]+$/, ""))}${ext}`;
    const buf = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(join(uploadDir, fileName), buf);
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

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);

  return Response.json({ ok: true, slug });
}
