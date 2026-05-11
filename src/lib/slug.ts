/**
 * CONCEPT: Text Normalization + URL-Safe String Generation
 *
 * A "slug" is a URL-friendly version of a title (e.g., "Natjecanje u Zagrebu"
 * becomes "natjecanje-u-zagrebu"). This function handles:
 *
 * 1. Unicode normalization (NFD) — decomposes accented characters into base
 *    character + combining mark (e.g., "č" → "c" + combining caron)
 * 2. Diacritics removal — `\p{M}` matches all Unicode "Mark" characters
 *    (the combining marks from step 1), effectively stripping accents
 * 3. Lowercase — URLs should be case-insensitive
 * 4. Replace non-alphanumeric with hyphens — spaces, punctuation → "-"
 * 5. Trim leading/trailing hyphens
 * 6. Length limit — URLs shouldn't be excessively long
 *
 * The `u` flag on the regex enables Unicode-aware matching (`\p{M}` syntax).
 */
export function slugify(text: string): string {
  const base = text
    .normalize("NFD")           // Step 1: Decompose "č" → "c" + combining mark
    .replace(/\p{M}/gu, "")    // Step 2: Remove combining marks (diacritics)
    .toLowerCase()              // Step 3: "Trening" → "trening"
    .replace(/[^a-z0-9]+/g, "-") // Step 4: Non-alphanumeric runs → single hyphen
    .replace(/^-+|-+$/g, "")   // Step 5: Trim leading/trailing hyphens
    .slice(0, 80);             // Step 6: Cap length for clean URLs
  return base.length > 0 ? base : "novost"; // Fallback if input was all special chars
}
