/** Oblik novosti za prikaz u UI-u (naslov/izvadak/tijelo kao HTML stringovi). */
export type NewsPost = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  /** Samo lokalne objave: MP4/WebM za pregled na kartici kad nema istaknute slike */
  _videoPreviewSrc?: string | null;
  /** Potpis autora na članku */
  articleCreditLine?: string | null;
  _embedded?: {
    author?: Array<{ name?: string; slug?: string }>;
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text?: string;
    }>;
  };
};

const FEATURED = "wp:featuredmedia" as const;

export function getFeaturedImage(post: NewsPost): { src: string; alt: string } | null {
  const media = post._embedded?.[FEATURED]?.[0];
  if (!media?.source_url) return null;
  return { src: media.source_url, alt: media.alt_text ?? "" };
}

/** Kartica novosti: slika ili kratki video ako je samo video bez slike. */
export function getListingCover(
  post: NewsPost,
): { kind: "image"; src: string; alt: string } | { kind: "video"; src: string } | null {
  const img = getFeaturedImage(post);
  if (img) return { kind: "image", ...img };
  const v = post._videoPreviewSrc?.trim();
  if (v) return { kind: "video", src: v };
  return null;
}

export function getPostAuthor(post: NewsPost): string | null {
  const name = post._embedded?.author?.[0]?.name?.trim();
  return name || null;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
