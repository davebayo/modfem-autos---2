"use client";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  step: number;
  min?: number;
  max?: number;
  "aria-label"?: string;
}

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}

/** Arena-flat numeric input pill with integrated dark -/+ steppers,
 * replacing the stark white native OS spin buttons `app/globals.css`
 * already strips globally. Used for buyer-facing numeric fields on
 * `/request`; `LandedCostDrawer`'s FX rate input keeps its own existing
 * -10/+10 buttons rather than switching to this. */
export function NumberStepper({
  value,
  onChange,
  step,
  min,
  max,
  "aria-label": ariaLabel,
}: NumberStepperProps) {
  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <div className="inline-flex h-10 items-center overflow-hidden rounded-full border border-white/12 bg-[#101216] transition-all focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/30">
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(clamp(Number(event.target.value) || 0, min, max))}
        aria-label={ariaLabel}
        className="tnum w-full bg-transparent px-3.5 py-1.5 text-right font-mono text-sm text-white focus:outline-none"
      />
      <div className="flex h-full shrink-0 border-l border-white/10">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step, min, max))}
          disabled={atMin}
          aria-label="Decrease value"
          className="flex h-full w-8 items-center justify-center text-white/50 transition-colors hover:bg-white/[0.04] hover:text-emerald-500 active:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-25"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onChange(clamp(value + step, min, max))}
          disabled={atMax}
          aria-label="Increase value"
          className="flex h-full w-8 items-center justify-center border-l border-white/10 text-white/50 transition-colors hover:bg-white/[0.04] hover:text-emerald-500 active:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-25"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
