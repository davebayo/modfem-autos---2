"use client";

import { motion, useReducedMotion } from "framer-motion";

export const PILL_SPRING = { type: "spring", stiffness: 400, damping: 32, mass: 0.7 } as const;

/** Visually matches the `.chip` Arena CSS class (globals.css), reimplemented
 * as plain Tailwind utilities for any chip that hosts a `GlidingPill`. Needed
 * because `.chip` is unlayered custom CSS while Tailwind's utilities live in
 * `@layer utilities` — per the CSS cascade-layers spec, unlayered rules always
 * win over layered ones regardless of source order or specificity, so a
 * Tailwind class on an element still carrying `.chip` could never override
 * `.chip`'s own `color`/`background` for the active state. */
/** Deliberately carries no text/border color — callers append exactly one of
 * `CHIP_INACTIVE`/`CHIP_ACTIVE` (never both) so there's only ever a single
 * `text-*`/`border-*` utility on the element. Two Tailwind color utilities
 * targeting the same property on one element don't have a reliably-ordered
 * winner (unlike a plain CSS cascade, Tailwind's own generation order
 * decides ties, not the className string's left-to-right order), so this
 * stays unambiguous by construction instead of relying on override order. */
export const CHIP_BASE =
  "rounded-full border border-white/[0.16] bg-white/[0.03] px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-200";
export const CHIP_INACTIVE = "text-white/65 hover:text-white hover:border-white/40";
export const CHIP_ACTIVE = "border-transparent font-bold text-[#050608]";

interface GlidingPillProps {
  /** Shared across every sibling option in one control so Framer Motion
   * glides this span between positions instead of each option drawing its
   * own static background. Must be unique per control instance — reusing
   * the same id across two controls mounted at once makes the pill jump
   * between unrelated groups. */
  layoutId: string;
  className: string;
}

/** The sliding capsule behind an active or hovered option in a segmented
 * control, chip row, or mode toggle. `z-0` (not a negative z-index) so it
 * reliably paints above the host button's own static background without
 * risking a negative z-index "escaping" past an ancestor that doesn't
 * establish its own stacking context — pair with `relative z-10` on the
 * label text. */
export function GlidingPill({ layoutId, className }: GlidingPillProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.span
      layoutId={layoutId}
      className={`absolute inset-0 z-0 ${className}`}
      transition={reducedMotion ? { duration: 0 } : PILL_SPRING}
    />
  );
}
