"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GLASS_PILL } from "@/lib/glass-tokens";
import { TireRimGlyph } from "@/components/TireRimGlyph";
import { ModfemLogoMark } from "@/components/ui/ModfemLogoMark";

const SESSION_KEY = "modfem_ignition_v1";
const TOTAL_MS = 2400;

interface IgnitionPreloaderProps {
  onComplete: () => void;
  /** Bump this (e.g. with a counter) to force a replay even if the session
   * has already seen the ignition sequence once. */
  replayKey?: number;
}

function TachometerRing({ percent }: { percent: number }) {
  const circumference = 2 * Math.PI * 46;
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="relative flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-xs tracking-widest text-zinc-400">IGNITION</span>
        <span className="mt-1 font-mono text-2xl text-white">{percent}%</span>
      </div>
    </div>
  );
}

export function IgnitionPreloader({ onComplete, replayKey }: IgnitionPreloaderProps) {
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [percent, setPercent] = useState(0);
  const percentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Instantly unlocks the viewport — used by both the natural timeout and
  // the Skip button, so skipping never re-triggers or waits on the sequence
  // it's meant to dismiss.
  const finishNow = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (percentTimerRef.current) clearInterval(percentTimerRef.current);
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // storage unavailable — fine, just won't persist across tabs
    }
    setPlaying(false);
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    const forced = replayKey !== undefined && replayKey > 0;
    const alreadySeen =
      typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";

    finishedRef.current = false;

    if (reducedMotion) {
      // No overlay ever mounts, so there's no artificial black-screen delay
      // to eliminate — the viewport is free the instant this effect runs.
      finishedRef.current = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
      onCompleteRef.current();
      return;
    }

    if (!forced && alreadySeen) {
      finishedRef.current = true;
      onCompleteRef.current();
      return;
    }

    startTransition(() => {
      setPlaying(true);
      setPercent(0);
    });

    percentTimerRef.current = setInterval(() => {
      setPercent((prev) => (prev >= 100 ? 100 : prev + 4));
    }, 36);

    completeTimerRef.current = setTimeout(finishNow, TOTAL_MS);

    return () => {
      if (percentTimerRef.current) clearInterval(percentTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [replayKey, reducedMotion, finishNow]);

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          key="ignition-overlay"
          className="fixed inset-0 z-[100] overflow-hidden bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            onClick={finishNow}
            className={`absolute right-6 top-6 z-10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white ${GLASS_PILL}`}
          >
            Skip Intro
          </button>

          {/* Phase 1: M monogram + tachometer ring, 0.0s - 1.0s, fades out ~1.0-1.2s */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 1, 0] }}
            transition={{ duration: 1.2, times: [0, 0.8, 1], ease: "easeInOut" }}
          >
            <TachometerRing percent={percent} />
            <ModfemLogoMark animate className="h-10 w-auto text-white" />
          </motion.div>

          {/* Phase 2: "M AUT[O]S" wordmark, ~1.0s - 2.0s */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: [0, 1, 1, 0], x: [40, 0, 0, 0] }}
            transition={{ duration: 1.3, delay: 0.85, times: [0, 0.25, 0.8, 1], ease: "easeInOut" }}
          >
            <div className="flex items-center gap-2 font-[family-name:var(--font-brand)] text-4xl font-semibold uppercase tracking-[0.2em] text-white sm:text-6xl">
              <span>M AUT</span>
              <TireRimGlyph lockAfterMs={1450} />
              <span>S</span>
            </div>
          </motion.div>

          {/* Phase 3: vertical curtain split, 2.0s - 2.4s — the wheel lock
              (completes 1.95s) has already settled by the time this starts. */}
          <div className="absolute inset-0 flex">
            <motion.div
              className="h-full w-1/2 bg-black"
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              transition={{ duration: 0.4, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="h-full w-1/2 bg-black"
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              transition={{ duration: 0.4, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
