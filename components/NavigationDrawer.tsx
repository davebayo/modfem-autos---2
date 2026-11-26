"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GLASS_NAV } from "@/lib/glass-tokens";
import { ModfemLogoMark } from "@/components/ui/ModfemLogoMark";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LINKS = [
  { number: "01", label: "HOME", href: "/" },
  { number: "02", label: "INVENTORY CATALOG", href: "/inventory" },
  { number: "03", label: "VIN & SHIPMENT TRACKER", href: "/track" },
  { number: "04", label: "CUSTOM SOURCING CONCIERGE", href: "/request" },
];

export function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            key="nav-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`fixed inset-y-3 right-3 z-50 flex w-[calc(100%-1.5rem)] max-w-sm flex-col justify-between overflow-y-auto overscroll-contain rounded-3xl text-white ${GLASS_NAV}`}
          >
            <div>
              <div className="sticky top-0 flex items-center justify-between px-6 py-5">
                <Link
                  href="/"
                  onClick={onClose}
                  aria-label="Modfem Autos — Home"
                  className="flex items-center gap-2 rounded-full transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0A0B0E]"
                >
                  <ModfemLogoMark className="h-4 w-auto" />
                  <span className="font-[family-name:var(--font-brand)] text-sm font-semibold tracking-[-0.02em]">
                    MODFEM AUTOS
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] transition-all duration-300 hover:bg-white/[0.12]"
                >
                  <X className="h-4.5 w-4.5" strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex flex-col gap-2 px-4 pb-4">
                {LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-300 ${
                        active
                          ? "border-white/20 bg-white/[0.14] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]"
                          : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      <span className="font-mono text-xs text-zinc-500">{link.number}</span>
                      <span className="text-sm font-medium uppercase tracking-widest">
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-white/10 px-6 py-5 text-[10px] uppercase tracking-widest text-zinc-500">
              Canada &mdash; Lagos Import Desk
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
