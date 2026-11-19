"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Wallet, X } from "lucide-react";
import Image from "next/image";
import { Vehicle } from "@/lib/types";
import { formatNGN } from "@/lib/pricing";
import { getVehicleInquiryUrl } from "@/lib/site-config";
import { GLASS_CARD, GLASS_PILL } from "@/lib/glass-tokens";
import { useMounted } from "@/lib/use-mounted";
import { TelemetrySlash } from "@/components/ui/TelemetryEyebrow";

interface LagosInspectionModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onOpenLandedCostSheet: () => void;
}

function LedgerRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/8 py-2.5">
      <dt className="text-[11px] uppercase tracking-widest text-zinc-500">{label}</dt>
      <dd className={`text-right text-xs font-medium ${accent ? "text-emerald-400" : "text-white"}`}>
        {value}
      </dd>
    </div>
  );
}

/** Interactive "Lagos Ground-Truth" dossier: the real, unedited inspection
 * photos plus the confirmed spec sheet — the evidence layer backing the
 * polished hero facade (see PRD.md's Dual-Layer Visual Truth strategy).
 * Portaled to `document.body` so it's never a descendant of `app/template.tsx`'s
 * animated wrapper (or any other transformed ancestor) and always positions
 * `fixed` relative to the real viewport. */
export function LagosInspectionModal({
  vehicle,
  isOpen,
  onClose,
  onOpenLandedCostSheet,
}: LagosInspectionModalProps) {
  const gallery = vehicle.inspectionGallery ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = gallery[activeIndex];
  const specs = vehicle.verifiedSpecs;
  const mounted = useMounted();

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="inspection-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            key="inspection-sheet"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[94vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden text-white ${GLASS_CARD}`}
          >
            <div className="flex shrink-0 items-start justify-between px-6 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                  Lagos Ground-Truth Inspection
                </p>
                <h2 className="mt-1 text-xl font-medium tracking-tight">{vehicle.name}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close inspection dossier"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] transition-colors hover:bg-white/[0.12]"
              >
                <X className="h-4.5 w-4.5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.55fr_1fr]">
                {/* LEFT — main photo + 6-up thumbnail switcher */}
                <div>
                  {active && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-900">
                      <Image
                        src={active.url}
                        alt={active.label}
                        fill
                        sizes="(min-width: 1024px) 680px, 90vw"
                        className="object-cover"
                      />
                      <div className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.2em] text-white">
                        <span className="border border-white/20 bg-black/70 px-2.5 py-1">
                          {String(activeIndex + 1).padStart(2, "0")}
                          <TelemetrySlash />
                          {active.label}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 border border-emerald-500/40 bg-black/70 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-emerald-300">
                        RAW · LAGOS ON-GROUND
                      </div>
                    </div>
                  )}

                  {gallery.length > 1 && (
                    <div className="mt-3 grid grid-cols-6 gap-2">
                      {gallery.map((photo, index) => (
                        <button
                          key={photo.url}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={`relative aspect-[4/3] overflow-hidden rounded-lg border transition-colors ${
                            index === activeIndex
                              ? "border-emerald-400"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <Image src={photo.url} alt={photo.label} fill sizes="120px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT — Monroney spec ledger, CTAs anchored to the bottom */}
                <div className="flex flex-col">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Verified Spec Sheet
                    </p>
                    <dl className="mt-2">
                      <LedgerRow label="Year" value={String(vehicle.year)} />
                      <LedgerRow label="Model" value={`${vehicle.make} ${vehicle.model}`} />
                      {specs && (
                        <>
                          <LedgerRow label="Engine" value={specs.engine} />
                          <LedgerRow label="Transmission" value={specs.transmission} />
                        </>
                      )}
                      <LedgerRow label="Status" value="Physically Cleared" accent />
                      <LedgerRow
                        label="Price"
                        value={
                          vehicle.distressPriceNGN
                            ? `${formatNGN(vehicle.distressPriceNGN)} Flat`
                            : "—"
                        }
                        accent
                      />
                    </dl>

                    {specs && specs.features.length > 0 && (
                      <div className="mt-5 grid grid-cols-1 gap-2">
                        {specs.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-xs text-zinc-300">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={1.5} />
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={onOpenLandedCostSheet}
                      className={`flex min-h-[48px] items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-widest text-white ${GLASS_PILL}`}
                    >
                      <Wallet className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Open Landed Cost Sheet
                    </button>
                    <a
                      href={getVehicleInquiryUrl(
                        vehicle.name,
                        vehicle.distressPriceNGN ? formatNGN(vehicle.distressPriceNGN) : ""
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500 px-4 text-[10px] font-medium uppercase tracking-widest text-zinc-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] transition-all duration-300 hover:bg-emerald-400"
                    >
                      <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Claim on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
