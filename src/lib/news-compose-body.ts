/**
 * CONCEPT: Data Transformation Utility + Pure Functions
 *
 * This module converts plain text (user input) into safe HTML for storage.
 * These are "pure functions" — given the same input, they always return
 * the same output with no side effects (no file I/O, no network, no mutations).
 *
 * Pure functions are:
 * - Easy to test (no mocking needed)
 * - Safe to call anywhere (no hidden state changes)
 * - Composable (chain them together like a pipeline)
 */

import { nl2brEscaped } from "@/lib/html-escape";

/**
 * Removes excessive blank lines (e.g. pasted text with \n\n\n\n) so that at most
 * one blank line remains between paragraphs (two consecutive \n).
 */
export function normalizeNewsDescriptionPlain(text: string): string {
  return text
    .replace(/\r\n|\r/g, "\n") // Normalize Windows/Mac line endings to Unix \n
    .replace(/\n{3,}/g, "\n\n") // Collapse 3+ newlines into exactly 2 (one blank line)
    .trim();
}

// CONCEPT: Composition — this function chains normalize → escape → wrap,
// building complex output from simple, reusable steps.
/** Text-only portion of the article (media are separate fields in JSON). */
export function composeNewsDescriptionHtml(descriptionPlain: string): string {
  const normalized = normalizeNewsDescriptionPlain(descriptionPlain);
  return `<div class="news-body">${nl2brEscaped(normalized)}</div>`;
}

// Simple heuristic — infer MIME type from file extension.
// Returns null for falsy input (null, undefined, empty string all handled by `!videoSrc`).
export function inferVideoMime(videoSrc: string | null | undefined): string | null {
  if (!videoSrc) return null;
  return videoSrc.endsWith(".webm") ? "video/webm" : "video/mp4";
}
