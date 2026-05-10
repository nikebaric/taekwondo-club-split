import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { LocalNewsPost } from "@/lib/local-news-types";

const FILE = join(process.cwd(), "data", "news-posts.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true });
}

export async function readLocalNewsPosts(): Promise<LocalNewsPost[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalNewsPost[];
  } catch {
    return [];
  }
}

export async function writeLocalNewsPosts(posts: LocalNewsPost[]): Promise<void> {
  await ensureDataDir();
  await writeFile(FILE, JSON.stringify(posts, null, 2), "utf8");
}

export async function appendLocalNewsPost(post: LocalNewsPost): Promise<void> {
  const posts = await readLocalNewsPosts();
  posts.unshift(post);
  await writeLocalNewsPosts(posts);
}

export async function findLocalPostBySlug(slug: string): Promise<LocalNewsPost | null> {
  const posts = await readLocalNewsPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

/** Zamijeni članak koji ima zadani slug (stari slug pri promjeni naslova). */
export async function replaceLocalPostBySlug(oldSlug: string, next: LocalNewsPost): Promise<boolean> {
  const posts = await readLocalNewsPosts();
  const idx = posts.findIndex((p) => p.slug === oldSlug);
  if (idx === -1) return false;
  posts[idx] = next;
  await writeLocalNewsPosts(posts);
  return true;
}

/** Ukloni članak; vraća uklonjeni zapis ako postoji. */
export async function deleteLocalPostBySlug(slug: string): Promise<LocalNewsPost | null> {
  const posts = await readLocalNewsPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  const [removed] = posts.splice(idx, 1);
  await writeLocalNewsPosts(posts);
  return removed ?? null;
}

export function uniqueSlug(base: string, existing: LocalNewsPost[]): string {
  const slugs = new Set(existing.map((p) => p.slug));
  if (!slugs.has(base)) return base;
  let i = 2;
  while (slugs.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
