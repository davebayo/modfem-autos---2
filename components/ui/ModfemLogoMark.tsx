"use client";

import { motion } from "framer-motion";
import {
  MA_MARK_PATH_1,
  MA_MARK_PATH_2,
  MA_MARK_PATH_3,
  MA_MARK_STROKE_BAR_WIDTH,
  MA_MARK_STROKE_MAIN_WIDTH,
  MA_MARK_VIEWBOX,
} from "@/lib/brand-mark";

interface ModfemLogoMarkProps {
  className?: string;
  /** Self-draws all three strokes (pathLength 0 -> 1) instead of rendering
   * static paths — used for the ignition preloader's crest reveal. Not part
   * of the official geometry below; purely an optional render mode layered
   * on top of the exact, unmodified path data. */
  animate?: boolean;
}

/** Official "MA" monoline ribbon emblem — exact, pre-computed G1
 * tangent-continuous cubic Bezier geometry (do not recalculate the
 * coordinates — see lib/brand-mark.ts, the single source of truth also used
 * by the generated icon/OG-image routes). Used across the brand's
 * touchpoints (hero medallion, TopNav, ignition preloader crest, footer). */
export function ModfemLogoMark({ className = "w-8 h-auto", animate }: ModfemLogoMarkProps) {
  const strokeMain = {
    stroke: "currentColor",
    strokeWidth: MA_MARK_STROKE_MAIN_WIDTH,
    strokeLinecap: "butt" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  const strokeBar = {
    stroke: "currentColor",
    strokeWidth: MA_MARK_STROKE_BAR_WIDTH,
    strokeLinecap: "butt" as const,
    fill: "none",
  };

  if (animate) {
    return (
      <svg viewBox={MA_MARK_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Modfem Autos">
        <motion.path
          d={MA_MARK_PATH_1}
          {...strokeMain}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
        <motion.path
          d={MA_MARK_PATH_2}
          {...strokeMain}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
        <motion.path
          d={MA_MARK_PATH_3}
          {...strokeBar}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox={MA_MARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Modfem Autos"
    >
      {/* Path 1: Left M Wave with Collinear Tangents & Upper Stencil Cut */}
      <path d={MA_MARK_PATH_1} {...strokeMain} />
      {/* Path 2: Collinear Lower Interlock Loop & Right A Apex */}
      <path d={MA_MARK_PATH_2} {...strokeMain} />
      {/* Path 3: Precision Stencil Crossbar of A */}
      <path d={MA_MARK_PATH_3} {...strokeBar} />
    </svg>
  );
}
