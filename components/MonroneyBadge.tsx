import { TriangleAlert } from "lucide-react";

export function MonroneyBadge() {
  return (
    <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/[0.1] px-3 py-1.5 text-[9px] font-medium uppercase tracking-widest text-amber-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-2xl">
      <TriangleAlert className="h-3 w-3 shrink-0" strokeWidth={1.5} />
      [Verify] Indicative Estimate — Confirm Today&apos;s Rate on WhatsApp
    </div>
  );
}
