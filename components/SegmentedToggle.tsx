"use client";

import { useId } from "react";
import { GlidingPill } from "@/components/GlidingPill";

interface SegmentedToggleProps<T extends string> {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}

/** Shared 2-up (or more) sliding-capsule segmented control — the RoRo/
 * Container, Tin Can/Apapa, and Landed/Base toggles across the drawer,
 * inventory and request pages all render through this one component (it
 * replaces the three near-identical `ToggleGroup`/`HeaderToggle` copies
 * that used to live in each file) so the emerald pill glides via Framer
 * Motion rather than each option swapping a static background. `useId()`
 * scopes each mounted instance's `layoutId` to its own options only — two
 * `SegmentedToggle`s on the same page never cross-animate into each other. */
export function SegmentedToggle<T extends string>({ value, options, onChange }: SegmentedToggleProps<T>) {
  const pillId = useId();

  return (
    <div className="flex gap-1 rounded-full border border-white/12 bg-white/[0.03] p-1">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex-1 overflow-hidden rounded-full py-2 font-mono text-[10px] uppercase tracking-wide transition-colors duration-200 ${
              active ? "font-bold text-[#050608]" : "text-white/50 hover:text-white"
            }`}
          >
            {active && <GlidingPill layoutId={`segmented-${pillId}`} className="rounded-full bg-[#10B981]" />}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
