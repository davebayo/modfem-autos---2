"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useExchangeRate } from "@/lib/fx";
import { GLASS_NAV } from "@/lib/glass-tokens";
import { ModfemLogoMark } from "@/components/ui/ModfemLogoMark";

interface TopNavProps {
  announcement?: string;
  onOpenMenu?: () => void;
}

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "INVENTORY", href: "/inventory" },
  { label: "TRACK", href: "/track" },
  { label: "SOURCING", href: "/request" },
];

export function TopNav({
  announcement = "Based in Vaughan, Ontario — Direct Vehicle Sourcing & Shipping to Lagos",
  onOpenMenu,
}: TopNavProps) {
  const pathname = usePathname();
  const fx = useExchangeRate();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const fxDotColor =
    fx.source === "live"
      ? "bg-emerald-400"
      : fx.source === "manual"
        ? "bg-amber-400"
        : "bg-zinc-500";

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
      <div className={`mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-full px-4 sm:px-6 ${GLASS_NAV}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <ModfemLogoMark className="h-4 w-auto text-white" />
            <span className="font-[family-name:var(--font-brand)] text-sm font-semibold tracking-[-0.02em] text-white sm:text-base">
              MODFEM AUTOS
            </span>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[9px] uppercase tracking-widest text-zinc-400 lg:flex">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${fxDotColor}`} />
            ₦{fx.rate.toLocaleString("en-NG")}/CAD
          </span>
        </div>

        <div className="hidden flex-1 items-center justify-center overflow-hidden md:flex">
          <AnimatePresence mode="wait">
            <motion.span
              key={announcement}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="truncate text-[10px] font-light uppercase tracking-wider text-zinc-400"
            >
              {announcement}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <nav
            className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 md:flex"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              const showPill = hoveredHref ? hoveredHref === link.href : active;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onMouseEnter={() => setHoveredHref(link.href)}
                  className={`relative rounded-full px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors duration-300 ${
                    showPill ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {showPill && (
                    <motion.span
                      layoutId="modfem-nav-pill"
                      className="absolute inset-0 -z-10 rounded-full border border-white/25 bg-white/10 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[10px] font-medium uppercase tracking-widest text-white transition-all duration-300 hover:bg-white/[0.12] lg:flex"
          >
            <span>Lagos (Tin Can)</span>
            <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-white md:hidden"
          >
            Lagos
            <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
          </button>

          {onOpenMenu && (
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-all duration-300 hover:bg-white/[0.12] md:hidden"
            >
              <Menu className="h-4.5 w-4.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-xl md:hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={announcement}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="block truncate text-[10px] font-light uppercase tracking-wider text-zinc-400"
          >
            {announcement}
          </motion.span>
        </AnimatePresence>
      </div>
    </header>
  );
}
