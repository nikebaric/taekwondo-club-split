/**
 * Kalendarski datum objave (polje `publishedDate`, YYYY-MM-DD).
 * Sprema se kao ISO uz podne UTC za taj kalendarski dan — stabilno za sortiranje i prikaz datuma.
 */
export function parsePublishedDateFromForm(form: FormData): { ok: true; iso: string } | { ok: false; error: string } {
  const raw = String(form.get("publishedDate") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { ok: false, error: "Odaberite datum objave." };
  }
  const [ys, ms, ds] = raw.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!Number.isFinite(y) || m < 1 || m > 12 || d < 1 || d > 31) {
    return { ok: false, error: "Neispravan datum objave." };
  }
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return { ok: false, error: "Neispravan datum objave." };
  }
  return { ok: true, iso: dt.toISOString() };
}
