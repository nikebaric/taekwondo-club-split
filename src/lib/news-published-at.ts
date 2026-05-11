/**
 * CONCEPT: Date Parsing and Validation with Discriminated Union Results
 *
 * This function validates a date string from a form submission and returns
 * a "Result type" — a discriminated union of success/failure:
 *   `{ ok: true; iso: string }` OR `{ ok: false; error: string }`
 *
 * This pattern (inspired by Rust's Result<T, E>) avoids throwing exceptions
 * for expected validation failures. The caller checks `result.ok` and
 * TypeScript narrows the type accordingly.
 *
 * Date validation strategy:
 * 1. Regex check for format (YYYY-MM-DD)
 * 2. Range check for month/day values
 * 3. Round-trip check — construct a Date and verify it matches input
 *    (catches invalid dates like Feb 30 that pass range checks)
 *
 * Kalendarski datum objave (polje `publishedDate`, YYYY-MM-DD).
 * Sprema se kao ISO uz podne UTC za taj kalendarski dan — stabilno za sortiranje i prikaz datuma.
 */
export function parsePublishedDateFromForm(form: FormData): { ok: true; iso: string } | { ok: false; error: string } {
  const raw = String(form.get("publishedDate") ?? "").trim();
  // Step 1: Format validation with regex
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { ok: false, error: "Odaberite datum objave." };
  }
  const [ys, ms, ds] = raw.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  // Step 2: Basic range check
  if (!Number.isFinite(y) || m < 1 || m > 12 || d < 1 || d > 31) {
    return { ok: false, error: "Neispravan datum objave." };
  }
  // Step 3: Round-trip validation — Date constructor normalizes invalid dates
  // (e.g., Feb 31 becomes Mar 3), so we check if output matches input.
  // Using noon UTC avoids timezone edge cases where the day might shift.
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return { ok: false, error: "Neispravan datum objave." };
  }
  return { ok: true, iso: dt.toISOString() };
}
