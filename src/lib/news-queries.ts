import { localPostToNewsShape } from "@/lib/news-map";
import type { NewsPost } from "@/lib/news-post";
import type { LocalNewsPost } from "@/lib/local-news-types";
import { readLocalNewsPosts } from "@/lib/news-store";

export async function fetchNewsPosts(limit = 24): Promise<NewsPost[]> {
  const raw = await readLocalNewsPosts();
  const mapped = raw.map(localPostToNewsShape);
  mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return mapped.slice(0, limit);
}

export async function fetchNewsPostBySlug(slug: string): Promise<NewsPost | null> {
  const raw = await readLocalNewsPosts();
  const hit = raw.find((p) => p.slug === slug);
  return hit ? localPostToNewsShape(hit) : null;
}

export async function fetchLocalNewsPostBySlug(slug: string): Promise<LocalNewsPost | null> {
  const raw = await readLocalNewsPosts();
  return raw.find((p) => p.slug === slug) ?? null;
}
