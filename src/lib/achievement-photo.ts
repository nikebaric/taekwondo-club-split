import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

const PUBLIC_PREFIX = "/uploads/achievements/";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 2 * 1024 * 1024;

export function isManagedAchievementPhotoPath(src: string | undefined | null): src is string {
  if (!src || typeof src !== "string") return false;
  if (!src.startsWith(PUBLIC_PREFIX)) return false;
  if (src.includes("..")) return false;
  const rest = src.slice(PUBLIC_PREFIX.length);
  return /^[a-zA-Z0-9._-]+$/.test(rest) && rest.length > 0 && rest.length < 180;
}

export async function deleteManagedAchievementPhotoByPath(src: string | undefined | null): Promise<void> {
  if (!isManagedAchievementPhotoPath(src)) return;
  const full = join(process.cwd(), "public", src);
  try {
    await unlink(full);
  } catch {
    /* file missing — ignore */
  }
}

function extForMime(m: string): string {
  if (m === "image/jpeg") return ".jpg";
  if (m === "image/png") return ".png";
  if (m === "image/webp") return ".webp";
  if (m === "image/gif") return ".gif";
  return ".jpg";
}

/** Saves an uploaded image and returns a public URL path (e.g. `/uploads/achievements/…`). */
export async function saveAchievementPhotoForAchievement(id: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("INVALID_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("TOO_LARGE");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = extForMime(file.type);
  const safeName = `${id}-${Date.now()}${ext}`;
  const dir = join(process.cwd(), "public", "uploads", "achievements");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, safeName), buf);
  return `${PUBLIC_PREFIX}${safeName}`;
}
