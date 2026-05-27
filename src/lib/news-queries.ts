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

import type { Locale } from "@/i18n/config";
import { localizeNewsPost } from "@/lib/localize-club-data";
import { localPostToNewsShape } from "@/lib/news-map";
import type { NewsPost } from "@/lib/news-post";
import type { LocalNewsPost } from "@/lib/local-news-types";
import { readLocalNewsPosts } from "@/lib/news-store";

export async function fetchNewsPosts(limit = 24, locale: Locale = "hr"): Promise<NewsPost[]> {
  const raw = await readLocalNewsPosts();
  const mapped = raw.map((p) => localPostToNewsShape(localizeNewsPost(p, locale)));
  mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return mapped.slice(0, limit);
}

export async function fetchNewsPostBySlug(slug: string, locale: Locale = "hr"): Promise<NewsPost | null> {
  const raw = await readLocalNewsPosts();
  const hit = raw.find((p) => p.slug === slug);
  return hit ? localPostToNewsShape(localizeNewsPost(hit, locale)) : null;
}

export async function fetchLocalizedLocalNewsPostBySlug(
  slug: string,
  locale: Locale = "hr",
): Promise<LocalNewsPost | null> {
  const hit = await fetchLocalNewsPostBySlug(slug);
  return hit ? localizeNewsPost(hit, locale) : null;
}

export async function fetchLocalNewsPostBySlug(slug: string): Promise<LocalNewsPost | null> {
  const raw = await readLocalNewsPosts();
  // Nullish coalescing (`?? null`) converts `undefined` (from .find()) to `null`
  // for a consistent "not found" return type.
  return raw.find((p) => p.slug === slug) ?? null;
}
