"use client";

import { ReactNode, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Re-mounts on every navigation (unlike layout.tsx, which persists), giving
 * every route change the same Apple-grade spatial entrance: a soft blur/scale
 * settle rather than an abrupt swap. Respects reduced-motion with an instant,
 * untransformed render. */
export default function Template({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const nodeRef = useRef<HTMLDivElement>(null);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      ref={nodeRef}
      initial={{ opacity: 0, y: 12, scale: 0.994, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => {
        // transform/filter — even at their settled identity values — create
        // a new containing block for `position: fixed` descendants. This
        // version of framer-motion's types don't expose a `transitionEnd`
        // prop to snap them to their true CSS-initial value, so clear the
        // inline styles directly once the entrance animation finishes.
        // (The two modals that actually render `position: fixed` content —
        // LagosInspectionModal, LandedCostDrawer — are also portaled to
        // `document.body` as a structural fix that doesn't depend on this
        // timing at all; this is a secondary safeguard for anything else.)
        const node = nodeRef.current;
        if (node) {
          node.style.transform = "";
          node.style.filter = "";
        }
      }}
    >
      {children}
    </motion.div>
  );
}
