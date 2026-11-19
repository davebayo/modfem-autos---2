"use client";

import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageCircle, Plus, Printer, X } from "lucide-react";
import Link from "next/link";
import { DestinationPort, ShippingMethod, Vehicle } from "@/lib/types";
import { calculateLandedCost, formatCAD, formatNGN, formatPct } from "@/lib/pricing";
import { useExchangeRate } from "@/lib/fx";
import { reserveVehicle, ReservationResult } from "@/lib/store";
import { getWhatsAppUrl } from "@/lib/site-config";
import { formatVehicleStatus } from "@/lib/vehicles";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { MonroneyBadge } from "@/components/MonroneyBadge";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { NumberStepper } from "@/components/NumberStepper";
import { useMounted } from "@/lib/use-mounted";

interface LandedCostDrawerProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

interface ConfirmationState extends ReservationResult {
  buyerPhone: string;
  quotedLandedNGN: number;
  exchangeRateCadToNgn: number;
  shippingMethod: ShippingMethod;
  destinationPort: DestinationPort;
}

interface BuyerFormState {
  name: string;
  email: string;
  phone: string;
}

const EMPTY_BUYER_FORM: BuyerFormState = { name: "", email: "", phone: "" };

function BreakdownRow({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 py-2.5">
      <div>
        <p className="font-mono text-[12.5px] tnum text-white/60">{label}</p>
        {caption && (
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide tnum text-white/35">
            {caption}
          </p>
        )}
      </div>
      <span className="whitespace-nowrap font-mono text-[12.5px] font-bold tnum text-white">
        {value}
      </span>
    </div>
  );
}

function DrawerField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field"
      />
    </label>
  );
}

export function LandedCostDrawer({
  vehicle,
  isOpen,
  onClose,
}: LandedCostDrawerProps) {
  const fx = useExchangeRate();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("RoRo");
  const [destinationPort, setDestinationPort] =
    useState<DestinationPort>("Tin Can Island");
  const [phase, setPhase] = useState<"breakdown" | "buyer-form" | "confirmed">(
    "breakdown"
  );
  const [buyerForm, setBuyerForm] = useState<BuyerFormState>(EMPTY_BUYER_FORM);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(
    null
  );
  const mounted = useMounted();

  const breakdown = calculateLandedCost(vehicle, {
    shippingMethod,
    destinationPort,
    exchangeRateCadToNgn: fx.rate,
  });

  function handleClose() {
    setPhase("breakdown");
    setBuyerForm(EMPTY_BUYER_FORM);
    setReserveError(null);
    onClose();
  }

  function handleReserveSubmit(event: FormEvent) {
    event.preventDefault();
    if (!buyerForm.name.trim() || !buyerForm.email.trim() || !buyerForm.phone.trim()) {
      setReserveError("Please complete all buyer dossier fields.");
      return;
    }
    const result = reserveVehicle(vehicle.id, buyerForm, {
      shippingMethod,
      destinationPort,
      quotedLandedNGN: breakdown.totalNGN,
    });
    if (!result) {
      setReserveError(
        "This vehicle could not be reserved — it may no longer be available."
      );
      return;
    }
    setConfirmation({
      ...result,
      buyerPhone: buyerForm.phone,
      quotedLandedNGN: breakdown.totalNGN,
      exchangeRateCadToNgn: breakdown.exchangeRateCadToNgn,
      shippingMethod,
      destinationPort,
    });
    setReserveError(null);
    setPhase("confirmed");
  }

  const segments = [
    {
      label: "Vehicle Base",
      pct: breakdown.baseCostPct,
      className: "bg-white",
    },
    {
      label: "Freight & Insurance",
      pct: breakdown.shippingAndInsurancePct,
      className: "bg-white/50",
    },
    {
      label: "Customs & Port Fees",
      pct: breakdown.customsAndClearingPct,
      className: "bg-white/25",
    },
  ];

  const depositNGN = confirmation ? confirmation.quotedLandedNGN * 0.3 : 0;
  const balanceNGN = confirmation ? confirmation.quotedLandedNGN * 0.7 : 0;
  const depositCAD = confirmation
    ? depositNGN / confirmation.exchangeRateCadToNgn
    : 0;
  const balanceCAD = confirmation
    ? balanceNGN / confirmation.exchangeRateCadToNgn
    : 0;

  const whatsappUrl = confirmation
    ? getWhatsAppUrl(
        [
          `Modfem Autos Reservation — ${confirmation.bookingReference}`,
          `Vehicle: ${vehicle.name}`,
          `VIN: ${vehicle.vin}`,
          `Buyer: ${confirmation.buyer.name} (${confirmation.buyerPhone})`,
          `Port: ${confirmation.shipment.arrivalPort} · ${confirmation.shipment.shippingMethod}`,
          `Quoted Landed Cost: ${formatNGN(confirmation.quotedLandedNGN)}`,
          `30% Deposit Due: ${formatNGN(depositNGN)}`,
        ].join("\n")
      )
    : "#";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm print:hidden"
          />

          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-white/12 bg-[#101216] text-white sm:max-w-[520px] print:relative print:inset-auto print:h-auto print:w-auto print:max-w-none print:border-none print:shadow-none"
          >
            {phase === "confirmed" && confirmation ? (
              <div className="print-dossier flex h-full flex-col">
                <div className="flex shrink-0 items-start justify-between border-b border-white/10 bg-[#0D0F13]/95 px-6 py-5 print:hidden sm:px-8">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">
                      Confirmed
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight">
                      Proforma Import Dossier
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
                  >
                    <X className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8">
                  <p className="font-mono text-sm font-bold">
                    {confirmation.bookingReference}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    <BreakdownRow label="Buyer" value={confirmation.buyer.name} />
                    <BreakdownRow label="Email" value={confirmation.buyer.email} />
                    <BreakdownRow
                      label="Phone / WhatsApp"
                      value={confirmation.buyerPhone}
                    />
                    <BreakdownRow label="VIN" value={vehicle.vin} />
                    <BreakdownRow
                      label="Destination Port"
                      value={confirmation.shipment.arrivalPort}
                    />
                    <BreakdownRow
                      label="Shipping Mode"
                      value={confirmation.shipment.shippingMethod}
                    />
                  </div>

                  <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    <BreakdownRow
                      label="30% Canadian Acquisition Deposit"
                      value={`${formatCAD(depositCAD)} / ${formatNGN(depositNGN)}`}
                    />
                    <BreakdownRow
                      label="70% Port Clearing Balance"
                      value={`${formatCAD(balanceCAD)} / ${formatNGN(balanceNGN)}`}
                    />
                    <div className="flex items-end justify-between border-t border-emerald-500/40 pt-4">
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
                        Total Quoted Landed Cost
                      </span>
                      <span className="font-mono text-2xl font-bold tracking-tight tnum text-emerald-400">
                        {formatNGN(confirmation.quotedLandedNGN)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 font-mono text-[10.5px] text-white/40 leading-relaxed print:mt-8">
                    Estimate only &mdash; final clearing costs confirmed by a
                    licensed Modfem Autos agent at Tin Can / Apapa.
                  </p>
                </div>

                <div className="shrink-0 border-t border-white/10 px-6 py-5 print:hidden sm:px-8">
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/track?vin=${vehicle.vin}`}
                      className="flex min-h-[48px] items-center justify-between rounded-full border border-white/25 px-5 font-mono text-[10px] uppercase tracking-widest text-white transition hover:border-white/60 hover:bg-white/10"
                    >
                      Track Consignment on /track
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex min-h-[48px] items-center justify-between rounded-full border border-white/25 px-5 font-mono text-[10px] uppercase tracking-widest text-white transition hover:border-white/60 hover:bg-white/10"
                    >
                      Print / Save Proforma PDF
                      <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[48px] items-center justify-between rounded-full bg-emerald-500 px-5 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-950 transition hover:bg-emerald-400"
                    >
                      Dispatch to Dealer via WhatsApp
                      <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex shrink-0 items-start justify-between border-b border-white/10 bg-[#0D0F13]/95 px-6 py-5 sm:px-8">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">
                      Landed Cost &amp; Spec Sheet Drawer
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight">
                      {vehicle.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
                  >
                    <X className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8">
                  {vehicle.isSampleEstimate && (
                    <div className="mb-4">
                      <MonroneyBadge />
                    </div>
                  )}

                  <WhatsAppCTA
                    vehicleName={vehicle.name}
                    landedLabel={formatNGN(breakdown.totalNGN)}
                    className="mb-6 w-full"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                        Shipping Method
                      </p>
                      <SegmentedToggle
                        value={shippingMethod}
                        onChange={setShippingMethod}
                        options={[
                          { label: "RoRo", value: "RoRo" },
                          { label: "Container", value: "Container" },
                        ]}
                      />
                    </div>
                    <div>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                        Destination Port
                      </p>
                      <SegmentedToggle
                        value={destinationPort}
                        onChange={setDestinationPort}
                        options={[
                          { label: "Tin Can Island", value: "Tin Can Island" },
                          { label: "Apapa", value: "Apapa" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0A0B0E] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] tnum text-white/45">
                        Exchange Rate (
                        {fx.source === "live"
                          ? "Live"
                          : fx.source === "manual"
                            ? "Manual Override"
                            : "Fallback"}
                        )
                      </p>
                      <p className="mt-1 font-mono text-sm tnum text-white">
                        ₦{fx.rate.toLocaleString("en-NG")} / CAD
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <NumberStepper
                        value={fx.rate}
                        onChange={(value) => fx.setOverride(value)}
                        step={10}
                        min={1}
                        aria-label="Exchange rate override (NGN per CAD)"
                      />
                      {fx.isOverridden && (
                        <button
                          type="button"
                          onClick={fx.resetOverride}
                          className="font-mono text-[10px] uppercase tracking-wide text-white/50 underline underline-offset-2"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
                      Cost Composition
                    </p>
                    <div className="flex h-2 w-full overflow-hidden rounded-full border border-white/10">
                      {segments.map((segment) => (
                        <div
                          key={segment.label}
                          className={segment.className}
                          style={{ width: `${segment.pct}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4">
                      {segments.map((segment) => (
                        <div key={segment.label} className="flex items-center gap-2">
                          <span className={`h-2 w-2 ${segment.className}`} />
                          <span className="font-mono text-[10px] uppercase tracking-wide text-white/50">
                            {segment.label}{" "}
                            <span className="font-mono tnum text-white/80">
                              {formatPct(segment.pct)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 divide-y divide-white/8 border-y border-white/8">
                    <BreakdownRow
                      label="Canadian Base Price"
                      caption={`${formatCAD(breakdown.basePriceCAD)} @ ₦${breakdown.exchangeRateCadToNgn.toLocaleString(
                        "en-NG"
                      )}/CAD`}
                      value={formatNGN(breakdown.basePriceNGN)}
                    />
                    <BreakdownRow
                      label={`Ocean Freight — ${shippingMethod}`}
                      caption={formatCAD(breakdown.freightCAD)}
                      value={formatNGN(breakdown.freightNGN)}
                    />
                    <BreakdownRow
                      label="Marine Insurance"
                      caption="1.5% of Base + Freight"
                      value={formatNGN(breakdown.insuranceNGN)}
                    />
                    <BreakdownRow
                      label="CIF Value"
                      caption="Cost + Insurance + Freight"
                      value={formatNGN(breakdown.cifValueNGN)}
                    />
                    <BreakdownRow
                      label={`Nigerian Customs Duty — ${breakdown.dutyRatePct}%`}
                      caption={`${breakdown.ageTier} model${
                        breakdown.depreciationDiscountPct > 0
                          ? ` · ${breakdown.depreciationDiscountPct}% age depreciation on taxable base`
                          : ""
                      }`}
                      value={formatNGN(breakdown.customsDutyNGN)}
                    />
                    <BreakdownRow
                      label={`NAC Levy — ${breakdown.nacLevyRatePct}%`}
                      caption={`Taxable base ${formatNGN(breakdown.taxableCustomsBaseNGN)}`}
                      value={formatNGN(breakdown.nacLevyNGN)}
                    />
                    <BreakdownRow
                      label="VAT, CISS & ETLS"
                      caption="7.5% VAT + 1% CISS + 0.5% ETLS"
                      value={formatNGN(breakdown.statutoryTaxesNGN)}
                    />
                    <BreakdownRow
                      label="Port Clearing & Agency Fees"
                      caption={destinationPort}
                      value={formatNGN(breakdown.portClearingNGN)}
                    />
                  </div>

                  {vehicle.status === "AVAILABLE" && phase === "buyer-form" && (
                    <form
                      onSubmit={handleReserveSubmit}
                      className="mt-6 rounded-2xl border border-white/10 bg-[#0A0B0E] p-4"
                    >
                      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                        Buyer Dossier
                      </p>
                      <div className="flex flex-col gap-3">
                        <DrawerField
                          label="Full Name"
                          value={buyerForm.name}
                          onChange={(value) =>
                            setBuyerForm((f) => ({ ...f, name: value }))
                          }
                        />
                        <DrawerField
                          label="Email"
                          type="email"
                          value={buyerForm.email}
                          onChange={(value) =>
                            setBuyerForm((f) => ({ ...f, email: value }))
                          }
                        />
                        <DrawerField
                          label="Nigerian Phone / WhatsApp"
                          value={buyerForm.phone}
                          placeholder="+234 80..."
                          onChange={(value) =>
                            setBuyerForm((f) => ({ ...f, phone: value }))
                          }
                        />
                      </div>
                      {reserveError && (
                        <p className="mt-3 font-mono text-xs text-red-400">{reserveError}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhase("breakdown");
                            setReserveError(null);
                          }}
                          className="min-h-[44px] flex-1 rounded-full border border-white/20 font-mono text-[10px] uppercase tracking-widest text-white/70 transition-colors hover:bg-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="min-h-[44px] flex-1 rounded-full bg-white font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-100"
                        >
                          Confirm Reservation
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="shrink-0 border-t border-white/10 px-6 py-5 sm:px-8">
                  <div className="flex items-end justify-between border-t border-emerald-500/40 pt-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
                      Total Landed · Lagos
                    </span>
                    <span className="font-mono text-3xl font-bold tracking-tight text-emerald-400">
                      {formatNGN(breakdown.totalNGN)}
                    </span>
                  </div>

                  {vehicle.status === "AVAILABLE" ? (
                    phase !== "buyer-form" && (
                      <button
                        type="button"
                        onClick={() => setPhase("buyer-form")}
                        className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white text-zinc-950 transition-colors hover:bg-zinc-100"
                      >
                        <span className="font-mono text-xs font-bold uppercase tracking-widest">
                          Reserve &amp; Lock Quote (30% Deposit)
                        </span>
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    )
                  ) : (
                    <div className="mt-4 font-mono text-xs text-white/60">
                      This vehicle is currently{" "}
                      <strong className="text-white">
                        {formatVehicleStatus(vehicle.status)}
                      </strong>{" "}
                      &mdash; contact your Modfem Autos agent for status updates.
                    </div>
                  )}
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-white/40">
                    Estimate only &mdash; final clearing costs confirmed by a
                    licensed Modfem Autos agent at Tin Can / Apapa.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
