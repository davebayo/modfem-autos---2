"use client";

import { useEffect } from "react";

// Shared across every overlay so stacked locks (e.g. the reservation flow
// opened over the landed-cost drawer) only release when the last one closes.
let lockCount = 0;
let savedScrollY = 0;
let savedBodyStyle: string | null = null;

/**
 * Freezes page scroll while an overlay (drawer/modal) is open.
 *
 * Uses the `position: fixed` + negative `top` technique rather than just
 * `overflow: hidden` on <body>, because iOS Safari (pre-16) ignores body
 * overflow and still scrolls the page behind a fixed overlay. The original
 * scroll position is restored on release.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const body = document.body;

    if (lockCount === 0) {
      savedScrollY = window.scrollY;
      savedBodyStyle = body.getAttribute("style");
      body.style.position = "fixed";
      body.style.top = `-${savedScrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount > 0) return;
      if (savedBodyStyle) body.setAttribute("style", savedBodyStyle);
      else body.removeAttribute("style");
      window.scrollTo(0, savedScrollY);
    };
  }, [active]);
}
