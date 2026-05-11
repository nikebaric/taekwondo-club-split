/**
 * CONCEPT: Query/Repository Layer — Separation of Data Access from API Routes
 *
 * This file provides high-level "query" functions that API routes and pages call.
 * It sits between:
 *   [API route / page] → [queries (this file)] → [store (raw file I/O)]
 *
 * Benefits of this layered architecture:
 * - API routes stay thin — they handle HTTP concerns (request/response)
 * - Query functions handle business logic (sorting, mapping, limiting)
 * - Store handles persistence (read/write JSON)
 * - Easy to swap the store (e.g., move to a real DB) without changing queries
 *
 * This is a simplified version of the "Repository pattern" from backend architecture.
 */

import { localPostToNewsShape } from "@/lib/news-map";
import type { NewsPost } from "@/lib/news-post";
import type { LocalNewsPost } from "@/lib/local-news-types";
import { readLocalNewsPosts } from "@/lib/news-store";

// Default parameter (`limit = 24`) — caller can override or use the default.
export async function fetchNewsPosts(limit = 24): Promise<NewsPost[]> {
  const raw = await readLocalNewsPosts();
  // Map raw data to UI shape, then sort by date descending (newest first).
  // `.getTime()` converts to milliseconds for numeric comparison.
  const mapped = raw.map(localPostToNewsShape);
  mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return mapped.slice(0, limit);
}

export async function fetchNewsPostBySlug(slug: string): Promise<NewsPost | null> {
  const raw = await readLocalNewsPosts();
  const hit = raw.find((p) => p.slug === slug);
  // Conditional mapping — only transform if found, otherwise return null
  return hit ? localPostToNewsShape(hit) : null;
}

export async function fetchLocalNewsPostBySlug(slug: string): Promise<LocalNewsPost | null> {
  const raw = await readLocalNewsPosts();
  // Nullish coalescing (`?? null`) converts `undefined` (from .find()) to `null`
  // for a consistent "not found" return type.
  return raw.find((p) => p.slug === slug) ?? null;
}
