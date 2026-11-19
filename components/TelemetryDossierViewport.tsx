import Image from "next/image";

interface TelemetryDossierViewportProps {
  src: string;
  alt: string;
  className?: string;
}

/** Framed viewport for low-resolution flyer-cutout photos — never stretched
 * full-bleed. A blueprint grid + a specular glass highlight read as
 * "archive scan," not a broken photo, and the caption is honest about why
 * it's small. */
export function TelemetryDossierViewport({
  src,
  alt,
  className = "",
}: TelemetryDossierViewportProps) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden bg-zinc-900 ${className}`}
    >
      <div
        className="relative flex flex-1 items-center justify-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]" />
        <div className="relative h-[68%] w-[68%]">
          <Image src={src} alt={alt} fill sizes="320px" className="object-contain" />
        </div>
      </div>
      <div className="shrink-0 border-t border-white/10 bg-zinc-950/90 px-2 py-1.5 text-center font-mono text-[7px] uppercase leading-snug tracking-widest text-zinc-500">
        Source Archive &middot; Flyer Capture — Full Inspection Photos Sent on WhatsApp
      </div>
    </div>
  );
}
