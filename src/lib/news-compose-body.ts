import { nl2brEscaped } from "@/lib/html-escape";

/**
 * Uklanja višestruke prazne retke (npr. zalijepljeni tekst s \n\n\n\n) tako da ostane
 * najviše jedan razmak između odlomaka (dva uzastopna \n).
 */
export function normalizeNewsDescriptionPlain(text: string): string {
  return text
    .replace(/\r\n|\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Samo tekstualni dio članka (mediji su zasebna polja u JSON-u). */
export function composeNewsDescriptionHtml(descriptionPlain: string): string {
  const normalized = normalizeNewsDescriptionPlain(descriptionPlain);
  return `<div class="news-body">${nl2brEscaped(normalized)}</div>`;
}

export function inferVideoMime(videoSrc: string | null | undefined): string | null {
  if (!videoSrc) return null;
  return videoSrc.endsWith(".webm") ? "video/webm" : "video/mp4";
}
