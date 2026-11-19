interface TelemetryEyebrowProps {
  category: string;
  spec: string;
  variant?: "dark" | "light";
}

/** H-pattern mechanical shift-gate glyph for the eyebrow's category badge —
 * two rails joined by a crossbar with a position dot, never raw text. */
function ShiftGateIcon() {
  return (
    <svg viewBox="0 0 11 11" className="h-[11px] w-[11px] shrink-0 text-emerald-500" aria-hidden="true">
      <path
        d="M 2.5 1.5 V 9.5 M 8.5 1.5 V 9.5 M 2.5 5.5 H 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
    </svg>
  );
}

/** Razor-sharp vector separator replacing a raw ASCII "//" — a hairline
 * flanked by a tiny rotated emerald diamond node. Exported standalone for
 * single-line inline readouts (e.g. "LOGGED // <timestamp>", "LOT //
 * {lot}") that don't warrant the full two-chamber capsule below. */
export function TelemetrySlash({ variant = "dark" }: { variant?: "dark" | "light" }) {
  if (variant === "light") {
    return (
      <span className="mx-1.5 inline-flex items-center gap-1.5 align-middle">
        <span className="h-3 w-px bg-[#111111]/25" />
        <span className="h-[3px] w-[3px] rotate-45 bg-emerald-500" />
      </span>
    );
  }
  return (
    <svg viewBox="0 0 10 12" className="mx-1 inline h-3 w-[10px] shrink-0 align-middle" aria-hidden="true">
      <line x1="5" y1="0" x2="5" y2="12" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <rect x="3.5" y="4.5" width="3" height="3" fill="#10B981" fillOpacity="0.7" transform="rotate(45 5 6)" />
    </svg>
  );
}

/** Machined flat-carbon section eyebrow — a category badge (icon + label)
 * and a spec readout, joined by a vector divider instead of a raw "//".
 * Use `variant="light"` on alabaster surfaces (EditorialDealerSignoff). */
export function TelemetryEyebrow({ category, spec, variant = "dark" }: TelemetryEyebrowProps) {
  if (variant === "light") {
    return (
      <span className="flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-1">
        <span className="whitespace-nowrap font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-[#111111]">
          {category}
        </span>
        <TelemetrySlash variant="light" />
        <span className="whitespace-nowrap font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-[#111111]/65">
          {spec}
        </span>
      </span>
    );
  }

  return (
    <span className="flex w-fit max-w-full flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-full border border-white/12 bg-[#101216] p-1 pr-3.5">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-[#0A0B0E] px-2.5 py-0.5">
        <ShiftGateIcon />
        <span className="whitespace-nowrap font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-emerald-500">
          {category}
        </span>
      </span>
      <TelemetrySlash />
      <span className="whitespace-nowrap font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-white/75">
        {spec}
      </span>
    </span>
  );
}
