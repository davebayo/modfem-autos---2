import { ReactElement } from "react";
import { VehicleStatus } from "@/lib/types";
import { formatVehicleStatus } from "@/lib/vehicles";

/** Top-down chassis silhouette with illuminated emerald headlamps — used
 * for the "available to source" / "delivered" states (the car is sourced,
 * sound, and accounted for). */
function CarChassisStatusIcon() {
  return (
    <svg viewBox="0 0 13 10" className="h-[10px] w-[13px] shrink-0" aria-hidden="true">
      <path
        d="M 1.5 3 L 1.5 7 C 1.5 7.6 2 8 2.8 8 L 9 8 C 10.5 8 11.8 6.8 11.8 5 C 11.8 3.2 10.5 2 9 2 L 2.8 2 C 2 2 1.5 2.4 1.5 3 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        className="text-white/85"
      />
      <circle cx="10.5" cy="3.9" r="0.55" fill="#10B981" />
      <circle cx="10.5" cy="6.1" r="0.55" fill="#10B981" />
    </svg>
  );
}

/** Navigation-reticle vector in a dashed radar ring — used for the
 * "in transit" ocean-crossing state. */
function NavigationReticleIcon() {
  return (
    <svg viewBox="0 0 13 10" className="h-[10px] w-[13px] shrink-0 text-sky-400" aria-hidden="true">
      <circle
        cx="6.5"
        cy="5"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeDasharray="1.2 1"
        opacity="0.45"
      />
      <path d="M 6.5 1.7 L 8.3 7.3 L 6.5 6 L 4.7 7.3 Z" fill="currentColor" />
    </svg>
  );
}

/** Precision gauge dial with a needle — used for in-process states being
 * actively monitored (reserved pending pickup, clearing customs). */
function GaugeDialStatusIcon() {
  return (
    <svg viewBox="0 0 13 10" className="h-[10px] w-[13px] shrink-0 text-amber-400" aria-hidden="true">
      <circle cx="6.5" cy="5" r="3.7" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
      <line x1="6.5" y1="5" x2="6.5" y2="1.7" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="6.5" y1="5" x2="8.8" y2="6.4" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
      <circle cx="6.5" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

const STATUS_CONFIG: Record<VehicleStatus, { chamberClass: string; icon: () => ReactElement }> = {
  AVAILABLE: { chamberClass: "border-emerald-500/30", icon: CarChassisStatusIcon },
  DELIVERED: { chamberClass: "border-emerald-500/30", icon: CarChassisStatusIcon },
  RESERVED: { chamberClass: "border-amber-500/30", icon: GaugeDialStatusIcon },
  CLEARING: { chamberClass: "border-amber-500/30", icon: GaugeDialStatusIcon },
  IN_TRANSIT: { chamberClass: "border-sky-400/30", icon: NavigationReticleIcon },
};

/** Flat-carbon automotive telemetry status capsule — a recessed instrument
 * bay (bespoke SVG icon, no plain dots) paired with a monospace readout,
 * replacing the old glass pill + animate-ping dot. */
export function StatusBadge({ status }: { status: VehicleStatus }) {
  const { chamberClass, icon: Icon } = STATUS_CONFIG[status];

  return (
    <div className="inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border border-white/12 bg-[#101216] p-1 pr-3 shadow-[0_8px_24px_rgba(0,0,0,0.55)]">
      <span className={`inline-flex h-5 shrink-0 items-center justify-center gap-1.5 rounded-full border bg-[#0A0B0E] px-2 ${chamberClass}`}>
        <Icon />
      </span>
      <span className="font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-white/90">
        {formatVehicleStatus(status)}
      </span>
    </div>
  );
}
