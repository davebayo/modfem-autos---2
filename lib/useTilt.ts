"use client";

import { RefObject, MouseEvent } from "react";
import { useSpring, useReducedMotion } from "framer-motion";

/** Lightweight pointer-driven 3D tilt. Takes a ref the caller created with
 * `useRef` directly (kept out of this hook's return value so the ref prop
 * in JSX always traces back to a literal `useRef()` call, not an object
 * indirection). Returns motion values + handlers to spread onto a
 * `motion.div`. No-ops entirely when the user has `prefers-reduced-motion`
 * set. */
export function useTilt(ref: RefObject<HTMLDivElement | null>, maxDeg = 8) {
  const reducedMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });

  function onMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * maxDeg);
    rotateX.set((0.5 - py) * maxDeg);
  }

  function onMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return {
    style: reducedMotion
      ? undefined
      : { perspective: 1000, rotateX, rotateY },
    handlers: { onMouseMove, onMouseLeave },
  };
}
