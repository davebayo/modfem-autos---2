"use client";

import { Menu, RotateCcw } from "lucide-react";
import Link from "next/link";
import { ModfemLogoMark } from "@/components/ui/ModfemLogoMark";

interface BottomFooterProps {
  onOpenMenu: () => void;
  /** Only passed on the homepage — re-triggers the full-screen ignition
   * preloader sequence even if this session has already seen it once. */
  onReplayIgnition?: () => void;
}

export function BottomFooter({ onOpenMenu, onReplayIgnition }: BottomFooterProps) {
  return (
    <footer className="flex h-14 shrink-0 items-center justify-between gap-4 border-t border-white/10 px-4 md:h-16 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          aria-label="Modfem Autos — Home"
          className="flex shrink-0 items-center gap-1.5 rounded-full transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0A0B0E]"
        >
          <ModfemLogoMark className="h-3.5 w-auto text-white" />
          <span className="font-[family-name:var(--font-brand)] text-xs font-semibold tracking-[-0.02em] text-white">
            MODFEM AUTOS
          </span>
        </Link>
        <p className="min-w-0 truncate text-xs text-zinc-400">
          &copy; 2026 Modfem Autos. Vehicles independently inspected prior to
          export &mdash; landed cost is an estimate pending final agent
          clearance.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onReplayIgnition && (
          <button
            type="button"
            onClick={onReplayIgnition}
            aria-label="Replay ignition sequence"
            title="Replay Ignition"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-zinc-400 transition-colors hover:text-white"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center text-white"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>
    </footer>
  );
}
