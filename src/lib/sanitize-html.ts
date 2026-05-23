/**
 * HTML sanitization utility using DOMPurify.
 *
 * KEY CONCEPTS:
 * - **XSS Prevention**: DOMPurify removes malicious scripts, event handlers,
 *   and other dangerous HTML while preserving safe formatting tags.
 * - **WordPress content**: News posts come from WordPress and may contain
 *   user-generated content. Sanitizing before rendering prevents XSS attacks.
 * - **Configurable allowlist**: The DOMPurify config allows specific tags and
 *   attributes needed for rich content (links, images, basic formatting).
 * - **Isomorphic**: Using isomorphic-dompurify to work in both Node.js and browser.
 */
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML string to prevent XSS attacks.
 * Preserves safe tags for rich text content (links, images, formatting).
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "a",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "img",
      "span",
      "div",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
  });
}
