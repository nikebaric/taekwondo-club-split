/**
 * SectionHeading — a reusable presentational component for page section titles.
 *
 * KEY CONCEPTS:
 * - **Presentational component**: has no state, no side effects, no data fetching.
 *   It receives data via props and renders UI — a pure function of its inputs.
 * - **TypeScript props interface**: the `Props` type defines the component's API.
 *   TypeScript catches mistakes (e.g., missing `title`) at build time, not runtime.
 * - **Optional props with `?`**: `eyebrow` and `subtitle` are optional — callers
 *   don't need to provide them. This makes the component flexible for different contexts.
 * - **Conditional rendering**: `eyebrow ? <p>...</p> : null` only renders the element
 *   when a value is provided. This avoids empty/invisible DOM elements.
 */

// TypeScript type alias — defines the "shape" of props this component accepts.
// Required props (no `?`) must always be provided; optional ones can be omitted.
type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

// Destructuring in the parameter `({ eyebrow, title, subtitle })` extracts
// individual props from the props object — cleaner than writing `props.title`.
export function SectionHeading({ eyebrow, title, subtitle }: Props) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {/* Conditional rendering: only show the eyebrow if provided */}
      {/* Conditional rendering: only render the eyebrow if a value was passed.
          Since `eyebrow` is optional (?), it may be undefined — which is falsy. */}
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-gold)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {/* `aria-hidden` removes the decorative divider from the accessibility tree,
          so screen readers skip it — it's purely visual. */}
      <div
        className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-[var(--brand-gold)]/55 to-transparent"
        aria-hidden
      />
      {subtitle ? (
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[var(--muted)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
