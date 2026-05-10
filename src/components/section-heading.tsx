type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function SectionHeading({ eyebrow, title, subtitle }: Props) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-gold)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-slate-950 sm:text-4xl">
        {title}
      </h2>
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
