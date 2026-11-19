"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { IS_DEMO_MODE } from "@/lib/site-config";

const CHECKLIST = [
  "Confirm the missing 11th digit on the Nigerian WhatsApp number (+234 807 42961 on the flyer only has 10 digits).",
  "Confirm how you want your full name & Ontario business registration status displayed.",
  "Verify/adjust the indicative CAD prices & mileage on the Lexus RX 350, Toyota Camry, Toyota Venza, and Acura MDX (the 2013 Kia Sportage and 2016 GLA250 are already locked at your real ₦11.5M and ₦19M prices).",
  "Confirm current clearing agent duty/shipping estimates used in the landed-cost calculator.",
  "Approve switching from Modfemtidings@yahoo.com to a custom domain email upon deployment.",
  "Send original full-res phone photos for the Venza, RX 350, Camry & Acura — the current photos are cropped from a tiny flyer collage and look soft when enlarged.",
];

/** Thin honesty banner across every buyer-facing page while the catalog
 * still mixes real sourced units with placeholder [Verify] estimates —
 * expandable so Modfem can see exactly what's pending his sign-off. */
export function DemoModeRibbon() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  if (!IS_DEMO_MODE || pathname?.startsWith("/admin")) return null;

  return (
    <div className="relative z-40 flex justify-center px-3 pt-3">
      <div className="flex w-fit max-w-[94vw] flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-amber-400/25 bg-amber-400/[0.08] px-4 py-2 text-center font-mono text-[9px] uppercase tracking-widest text-amber-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          <span>
            Operator Preview Mode — Items Marked [Verify] Use Sample Estimates
            Pending Modfem&apos;s Final Sign-Off
          </span>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/[0.1] px-2.5 py-1 text-amber-200 transition-all duration-300 hover:bg-amber-400/20"
          >
            View 6 Items to Verify
            <ChevronDown
              className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
              strokeWidth={1.5}
            />
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="mt-2 w-[min(640px,100%)] overflow-hidden rounded-3xl border border-white/12 bg-[#141619]/85 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-[10px] uppercase tracking-widest text-amber-400">
                  Operator Sign-Off Checklist
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close checklist"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-colors hover:bg-white/[0.12]"
                >
                  <X className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
                </button>
              </div>
              <ol className="flex flex-col divide-y divide-white/10 border-t border-white/10 px-5">
                {CHECKLIST.map((item, index) => (
                  <li
                    key={item}
                    className="flex gap-3 py-3 text-left text-xs leading-relaxed text-zinc-300"
                  >
                    <span className="shrink-0 font-mono text-[10px] text-amber-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
              <p className="px-5 pb-4 pt-2 text-left text-[9px] uppercase tracking-widest text-zinc-600">
                Flip IS_DEMO_MODE to false in lib/site-config.ts once every item
                above is confirmed.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
