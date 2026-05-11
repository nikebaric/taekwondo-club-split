/**
 * CONCEPT: JSON File as Database + CRUD Store Pattern
 *
 * This module implements a simple persistence layer using a JSON file on disk.
 * It's a lightweight alternative to a database for small-scale apps:
 * - Read: parse JSON file → array of typed objects
 * - Write: serialize array → write JSON file
 * - CRUD operations built on top of read/write primitives
 *
 * Key concepts demonstrated:
 * - `fs/promises` — Node.js async file I/O (non-blocking, returns Promises)
 * - `process.cwd()` — resolves paths relative to where the server runs
 * - Defensive parsing (`as unknown` then validate) — never trust file contents
 * - Graceful error handling — return empty array if file doesn't exist yet
 * - `{ recursive: true }` on mkdir — creates parent directories if needed
 *
 * Trade-offs vs a real database:
 * + Zero setup, no external dependencies, easy to inspect/edit
 * - No concurrent write safety, doesn't scale, full rewrite on every save
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { LocalNewsPost } from "@/lib/local-news-types";

// Path resolved at module load time — `process.cwd()` is the project root in Next.js
const FILE = join(process.cwd(), "data", "news-posts.json");

// Ensures the `data/` directory exists before writing.
// `recursive: true` means it won't throw if the directory already exists.
async function ensureDataDir(): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true });
}

export async function readLocalNewsPosts(): Promise<LocalNewsPost[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    // Parse as `unknown` first, then validate — defensive against malformed JSON
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalNewsPost[];
  } catch {
    // File doesn't exist on first run — return empty array (no crash)
    return [];
  }
}

export async function writeLocalNewsPosts(posts: LocalNewsPost[]): Promise<void> {
  await ensureDataDir();
  await writeFile(FILE, JSON.stringify(posts, null, 2), "utf8");
}

// CRUD: Create — prepend new post to the front (newest first).
// `unshift` adds to array start, keeping chronological order without sorting.
export async function appendLocalNewsPost(post: LocalNewsPost): Promise<void> {
  const posts = await readLocalNewsPosts();
  posts.unshift(post);
  await writeLocalNewsPosts(posts);
}

export async function findLocalPostBySlug(slug: string): Promise<LocalNewsPost | null> {
  const posts = await readLocalNewsPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

/** Replace the post matching the given slug (old slug when the title changes). */
export async function replaceLocalPostBySlug(oldSlug: string, next: LocalNewsPost): Promise<boolean> {
  const posts = await readLocalNewsPosts();
  const idx = posts.findIndex((p) => p.slug === oldSlug);
  if (idx === -1) return false;
  posts[idx] = next;
  await writeLocalNewsPosts(posts);
  return true;
}

/** Remove a post; returns the removed record if it exists. */
export async function deleteLocalPostBySlug(slug: string): Promise<LocalNewsPost | null> {
  const posts = await readLocalNewsPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  const [removed] = posts.splice(idx, 1);
  await writeLocalNewsPosts(posts);
  return removed ?? null;
}

// CONCEPT: Unique slug generation — ensures no URL collisions.
// Uses a Set for O(1) lookups and appends a counter suffix if needed.
export function uniqueSlug(base: string, existing: LocalNewsPost[]): string {
  const slugs = new Set(existing.map((p) => p.slug));
  if (!slugs.has(base)) return base;
  let i = 2;
  while (slugs.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
