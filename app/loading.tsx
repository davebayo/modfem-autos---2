"use client";

import { motion } from "framer-motion";
import { TireRimGlyph } from "@/components/TireRimGlyph";
import { TelemetrySlash } from "@/components/ui/TelemetryEyebrow";

/** App Router's automatic route-loading UI — shows the instant a navigation
 * suspends on a route segment that isn't prefetched/cached yet. Styled as a
 * compact automotive HUD facade rather than a generic spinner, in the
 * Arena Aesthetic (flat #0A0B0E, emerald accent, tabular JetBrains Mono). */
export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[#0A0B0E]">
      <TireRimGlyph className="h-16 w-16" />
      <div className="flex w-56 flex-col items-center gap-2.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
          Shifting Gear
          <TelemetrySlash />
          Syncing Telemetry
        </p>
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full w-1/3 rounded-full bg-emerald-500"
            animate={{ x: ["-120%", "220%"] }}
            transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}
