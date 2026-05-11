/**
 * CONCEPT: XSS Prevention with HTML Escaping — Security-Critical Utility
 *
 * Cross-Site Scripting (XSS) is an attack where malicious code is injected
 * into a web page. If user input contains `<script>alert('hacked')</script>`
 * and we render it as-is, the browser executes it.
 *
 * HTML escaping converts dangerous characters into harmless "entities":
 *   < → &lt;   > → &gt;   & → &amp;   " → &quot;   ' → &#039;
 *
 * The browser displays these as the literal characters but does NOT interpret
 * them as HTML tags or attributes.
 *
 * IMPORTANT: The order of replacements matters — `&` must be first!
 * Otherwise `&lt;` from a previous replace would become `&amp;lt;`.
 *
 * This is a fundamental security utility — every piece of user-generated
 * content must pass through this (or React's built-in escaping) before
 * being rendered as HTML.
 */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")   // Must be FIRST — otherwise it double-encodes
    .replace(/</g, "&lt;")    // Prevents tag injection
    .replace(/>/g, "&gt;")    // Closes the tag prevention
    .replace(/"/g, "&quot;")  // Prevents attribute injection in double-quoted attrs
    .replace(/'/g, "&#039;"); // Prevents attribute injection in single-quoted attrs
}

// Combines escaping with newline-to-<br> conversion — preserves visual line
// breaks from plain text input when rendering as HTML.
export function nl2brEscaped(text: string): string {
  return escapeHtml(text).replace(/\r\n|\r|\n/g, "<br />\n");
}
