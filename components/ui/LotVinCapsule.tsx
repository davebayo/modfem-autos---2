interface LotVinCapsuleProps {
  lot: string;
}

/** VIN barcode & laser-tick glyph — 3 micro-bars bisected by an emerald
 * scan line, replacing a raw "//" next to "VIN". */
function VinBarcodeIcon() {
  return (
    <svg viewBox="0 0 12 10" className="h-[10px] w-[12px] shrink-0" aria-hidden="true">
      <line x1="2.5" y1="1" x2="2.5" y2="9" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
      <line x1="6" y1="1" x2="6" y2="9" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
      <line x1="9.5" y1="1" x2="9.5" y2="9" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
      <line x1="0.5" y1="5" x2="11.5" y2="5" stroke="#10B981" strokeWidth="1" />
    </svg>
  );
}

/** Machined lot-index & VIN-verification capsule — replaces the old
 * "LOT // {lot} · VIN // VERIFIED" raw-slash string with a recessed lot
 * pill and a VIN-barcode icon chamber. */
export function LotVinCapsule({ lot }: LotVinCapsuleProps) {
  return (
    <span className="inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border border-white/12 bg-[#101216] p-1 pr-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0A0B0E] px-2.5 py-0.5">
        <span className="font-mono text-[9.5px] uppercase leading-none tracking-[0.14em] text-white/45">LOT</span>
        <span className="tnum font-mono text-[10px] font-semibold leading-none tracking-[0.1em] text-white">{lot}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <VinBarcodeIcon />
        <span className="font-mono text-[9.5px] uppercase leading-none tracking-[0.14em] text-white/55">VIN</span>
        <span className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-emerald-500">
          VERIFIED
        </span>
      </span>
    </span>
  );
}
