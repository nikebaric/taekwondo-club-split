export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function nl2brEscaped(text: string): string {
  return escapeHtml(text).replace(/\r\n|\r|\n/g, "<br />\n");
}
