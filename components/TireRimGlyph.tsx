"use client";

import { useEffect } from "react";
import { motion, animate as animateMotionValue, useMotionValue } from "framer-motion";

interface TireRimGlyphProps {
  className?: string;
  /** If set, the wheel decelerates to the nearest upright 0deg stop this many
   * ms after mount instead of spinning forever — used by the ignition
   * preloader so the wheel locks just before the curtain split. Omit for a
   * continuous spin (e.g. the route-loading facade, where duration is
   * unknown). */
  lockAfterMs?: number;
}

/** Minimalist multi-spoke alloy wheel + tire, shared between the ignition
 * preloader's "M AUT[O]S" wordmark and the route-loading telemetry facade.
 * Spins continuously via a framer-motion MotionValue so a lock-to-upright
 * transition (when requested) continues smoothly from the live current
 * angle rather than snapping back to a hardcoded 0deg start. */
export function TireRimGlyph({ className = "h-[0.78em] w-[0.78em]", lockAfterMs }: TireRimGlyphProps) {
  const rotate = useMotionValue(0);
  const spokes = Array.from({ length: 6 });

  useEffect(() => {
    const spin = animateMotionValue(rotate, 360, {
      duration: 0.55,
      ease: "linear",
      repeat: Infinity,
    });

    let lockTimer: ReturnType<typeof setTimeout> | undefined;
    if (lockAfterMs !== undefined) {
      lockTimer = setTimeout(() => {
        spin.stop();
        const current = rotate.get();
        const nearestUpright = Math.ceil((current + 1) / 360) * 360;
        animateMotionValue(rotate, nearestUpright, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
      }, lockAfterMs);
    }

    return () => {
      spin.stop();
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, [rotate, lockAfterMs]);

  return (
    <motion.svg viewBox="0 0 100 100" className={`shrink-0 ${className}`} style={{ rotate }}>
      <circle cx="50" cy="50" r="47" fill="none" stroke="white" strokeWidth="4" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
      {spokes.map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="50"
          x2={50 + 31 * Math.cos((i * Math.PI) / 3)}
          y2={50 + 31 * Math.sin((i * Math.PI) / 3)}
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
      ))}
      <circle cx="50" cy="50" r="9" fill="#09090b" stroke="white" strokeWidth="2" />
      {/* Emerald brake caliper accent */}
      <path
        d="M 72 32 A 30 30 0 0 1 80 50"
        fill="none"
        stroke="#34d399"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
