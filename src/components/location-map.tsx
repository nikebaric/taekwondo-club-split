import { site } from "@/config/site";

type Props = {
  fullBleed?: boolean;
  className?: string;
};

export function LocationMap({ fullBleed = false, className = "" }: Props) {
  const shell = fullBleed
    ? `relative isolate min-h-[min(52vh,480px)] w-full overflow-hidden border-y border-slate-200 bg-[var(--surface)] shadow-inner ${className}`
    : `relative isolate aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] shadow-inner sm:aspect-video ${className}`;

  const iframeClass = fullBleed
    ? "relative z-0 h-[min(52vh,480px)] min-h-[280px] w-full border-0 sm:min-h-[360px]"
    : "relative z-0 h-full min-h-[260px] w-full border-0 sm:min-h-[300px]";

  return (
    <div className={shell}>
      <iframe
        title={`Lokacija — ${site.address.venueName}, ${site.address.street}, ${site.city}`}
        src={site.mapsEmbedUrl}
        className={iframeClass}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
