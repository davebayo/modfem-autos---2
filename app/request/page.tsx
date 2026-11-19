"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Plus } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { BottomFooter } from "@/components/BottomFooter";
import { NavigationDrawer } from "@/components/NavigationDrawer";
import { useExchangeRate } from "@/lib/fx";
import { createSourcingRequest, useVehicles } from "@/lib/store";
import {
  calculateMaxCanadianBid,
  formatCAD,
  formatNGN,
  formatNGNCompact,
  formatPct,
} from "@/lib/pricing";
import {
  DestinationPort,
  ShippingMethod,
  SourcingRequest,
  SourcingRequestMode,
} from "@/lib/types";
import { getWhatsAppUrl } from "@/lib/site-config";
import { CrossX } from "@/components/CrossX";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { CHIP_ACTIVE, CHIP_BASE, CHIP_INACTIVE, GlidingPill } from "@/components/GlidingPill";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { NumberStepper } from "@/components/NumberStepper";
import { TelemetryEyebrow } from "@/components/ui/TelemetryEyebrow";

const MODE_OPTIONS: { code: string; value: SourcingRequestMode; label: string }[] = [
  { code: "01", value: "DIRECT_SOURCING", label: "Direct Canadian Sourcing" },
  { code: "02", value: "CAR_SWAP", label: "Car Upgrade & Swap" },
];

function modeLabel(mode: SourcingRequestMode): string {
  return MODE_OPTIONS.find((option) => option.value === mode)?.label ?? mode;
}

const BUDGET_MIN = 15_000_000;
const BUDGET_MAX = 250_000_000;
const BUDGET_STEP = 500_000;
const BUDGET_PRESETS = [35_000_000, 60_000_000, 95_000_000, 150_000_000];
const YEAR_OPTIONS = Array.from({ length: 2026 - 2018 + 1 }, (_, i) => 2026 - i);

function ModeGateSelector({
  value,
  onChange,
}: {
  value: SourcingRequestMode;
  onChange: (mode: SourcingRequestMode) => void;
}) {
  const [hovered, setHovered] = useState<SourcingRequestMode | null>(null);

  return (
    <div className="grid grid-cols-2 border-b border-white/10" onMouseLeave={() => setHovered(null)}>
      {MODE_OPTIONS.map((option, index) => {
        const active = value === option.value;
        const showHover = !active && hovered === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            onMouseEnter={() => setHovered(option.value)}
            className={`relative overflow-hidden px-4 py-4 text-left transition-colors duration-200 ${
              active ? "text-white" : "text-white/50 hover:text-white"
            } ${index === 1 ? "border-l border-white/10" : ""}`}
          >
            {active && (
              <GlidingPill
                layoutId="concierge-mode-pill"
                className="border-b-2 border-emerald-500 bg-emerald-500/10"
              />
            )}
            {showHover && <GlidingPill layoutId="concierge-mode-hover" className="bg-white/[0.05]" />}
            <span className="relative z-10 block font-mono text-[10px] tracking-[0.16em]">
              MODE {option.code}
            </span>
            <span className="relative z-10 mt-1 block text-[13px] font-semibold">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: boolean;
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
        aria-invalid={error || undefined}
        className={`field${error ? " err" : ""}`}
      />
      {error && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-red-400">
          Required
        </span>
      )}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-xs text-white/50">{label}</span>
      <span className="whitespace-nowrap font-mono text-xs tnum text-white">
        {value}
      </span>
    </div>
  );
}

function ConfirmationView({
  confirmation,
  whatsappUrl,
}: {
  confirmation: SourcingRequest;
  whatsappUrl: string;
}) {
  return (
    <div className="border-t border-white/10 bg-[#0D0F13] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
          Monroney Mandate Confirmation Ticket
        </p>
        <span className="font-mono text-[10px] text-white/40">{confirmation.id}</span>
      </div>
      <h2 className="mt-2 text-xl font-bold tracking-tight">
        Sourcing Mandate Dispatched
      </h2>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
        <Row label="Mode" value={modeLabel(confirmation.mode)} />
        <Row label="Buyer" value={confirmation.buyer.name} />
        <Row
          label="Target Vehicle"
          value={`${confirmation.vehicleSpec.year} ${confirmation.vehicleSpec.make} ${confirmation.vehicleSpec.model}`}
        />
        {confirmation.vehicleSpec.trimOrColor && (
          <Row label="Trim / Color" value={confirmation.vehicleSpec.trimOrColor} />
        )}
        {confirmation.vehicleSpec.maxMileageKm > 0 && (
          <Row
            label="Max Mileage"
            value={`${confirmation.vehicleSpec.maxMileageKm.toLocaleString("en-CA")} km`}
          />
        )}
        {confirmation.swapVehicle && (
          <Row
            label="Swap Vehicle"
            value={`${confirmation.swapVehicle.year} ${confirmation.swapVehicle.make} ${confirmation.swapVehicle.model}`}
          />
        )}
        <Row
          label="Max Canadian Bid"
          value={formatCAD(confirmation.financials.maxBidCAD)}
        />
        <Row
          label="All-In Budget"
          value={formatNGN(confirmation.financials.totalBudgetNGN)}
        />
      </div>

      <p className="mt-4 font-mono text-[11px] text-white/45">
        Our Canadian auction desk begins sourcing at Manheim Toronto / ADESA
        Montreal and notifies you the moment a match is found.
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-emerald-500 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-950 transition hover:bg-emerald-400"
      >
        Dispatch Mandate Directly to Modfem on WhatsApp
        <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
      </a>
    </div>
  );
}

export default function RequestPage() {
  const fx = useExchangeRate();
  const vehicles = useVehicles();
  const [menuOpen, setMenuOpen] = useState(false);

  const [mode, setMode] = useState<SourcingRequestMode>("DIRECT_SOURCING");

  const [totalBudgetNGN, setTotalBudgetNGN] = useState(60_000_000);
  const [hoveredPreset, setHoveredPreset] = useState<number | null>(null);
  const [year, setYear] = useState(2022);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("RoRo");
  const [destinationPort, setDestinationPort] =
    useState<DestinationPort>("Tin Can Island");

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [trimOrColor, setTrimOrColor] = useState("");
  const [maxMileageKm, setMaxMileageKm] = useState(0);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  const [swapYear, setSwapYear] = useState(new Date().getFullYear());
  const [swapMake, setSwapMake] = useState("");
  const [swapModel, setSwapModel] = useState("");
  const [swapCondition, setSwapCondition] = useState("");

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [confirmation, setConfirmation] = useState<SourcingRequest | null>(null);

  function clearFieldError(key: string) {
    setInvalidFields((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  const budgetFillPct = ((totalBudgetNGN - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  const maxBid = useMemo(
    () =>
      calculateMaxCanadianBid({
        totalBudgetNGN,
        year,
        shippingMethod,
        destinationPort,
        exchangeRateCadToNgn: fx.rate,
      }),
    [totalBudgetNGN, year, shippingMethod, destinationPort, fx.rate]
  );

  const matchingVehicle = useMemo(
    () =>
      vehicles.find(
        (v) => v.status === "AVAILABLE" && v.basePriceCAD <= maxBid.maxBasePriceCAD
      ),
    [vehicles, maxBid.maxBasePriceCAD]
  );

  const feasibility = useMemo(() => {
    if (maxBid.maxBasePriceCAD >= 45_000) {
      return {
        label: "Strong Canadian Auction Budget",
        className: "border-emerald-500/45 text-emerald-400",
      };
    }
    if (maxBid.maxBasePriceCAD >= 20_000) {
      return {
        label: "Workable Budget for Selected Year",
        className: "border-amber-500/45 text-amber-400",
      };
    }
    return {
      label: "Tight Budget for Selected Year",
      className: "border-red-500/45 text-red-400",
    };
  }, [maxBid.maxBasePriceCAD]);

  const segments = [
    {
      label: "Vehicle in Canada",
      pct: maxBid.breakdown.baseCostPct,
      className: "bg-white",
    },
    {
      label: "Ocean Freight & Insurance",
      pct: maxBid.breakdown.shippingAndInsurancePct,
      className: "bg-white/50",
    },
    {
      label: "Nigerian Customs & Port",
      pct: maxBid.breakdown.customsAndClearingPct,
      className: "bg-white/25",
    },
  ];

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const missing = new Set<string>();
    if (!make.trim()) missing.add("make");
    if (!model.trim()) missing.add("model");
    if (!buyerName.trim()) missing.add("buyerName");
    if (!buyerEmail.trim()) missing.add("buyerEmail");
    if (!buyerPhone.trim()) missing.add("buyerPhone");
    if (mode === "CAR_SWAP") {
      if (!swapMake.trim()) missing.add("swapMake");
      if (!swapModel.trim()) missing.add("swapModel");
      if (!swapCondition.trim()) missing.add("swapCondition");
    }
    if (missing.size > 0) {
      setInvalidFields(missing);
      setSubmitError(
        mode === "CAR_SWAP" && (missing.has("swapMake") || missing.has("swapModel") || missing.has("swapCondition"))
          ? "Please describe the vehicle you want to swap or upgrade from."
          : "Please complete the highlighted fields."
      );
      return;
    }
    setInvalidFields(new Set());
    const request = createSourcingRequest({
      mode,
      buyer: { name: buyerName, email: buyerEmail, phone: buyerPhone },
      vehicleSpec: {
        year,
        make,
        model,
        trimOrColor,
        maxMileageKm,
      },
      swapVehicle:
        mode === "CAR_SWAP"
          ? {
              year: swapYear,
              make: swapMake,
              model: swapModel,
              condition: swapCondition,
            }
          : undefined,
      financials: {
        totalBudgetNGN,
        maxBidCAD: maxBid.maxBasePriceCAD,
        shippingMethod,
        destinationPort,
        exchangeRateUsed: fx.rate,
      },
    });
    setSubmitError(null);
    setConfirmation(request);
  }

  const whatsappUrl = confirmation
    ? getWhatsAppUrl(
        [
          `Modfem Autos Sourcing Mandate — ${confirmation.id}`,
          `Mode: ${modeLabel(confirmation.mode)}`,
          `Buyer: ${confirmation.buyer.name} (${confirmation.buyer.phone})`,
          `Target Vehicle: ${confirmation.vehicleSpec.year} ${confirmation.vehicleSpec.make} ${confirmation.vehicleSpec.model}`,
          ...(confirmation.vehicleSpec.trimOrColor
            ? [`Trim / Color: ${confirmation.vehicleSpec.trimOrColor}`]
            : []),
          ...(confirmation.vehicleSpec.maxMileageKm > 0
            ? [`Max Mileage: ${confirmation.vehicleSpec.maxMileageKm.toLocaleString("en-CA")} km`]
            : []),
          ...(confirmation.swapVehicle
            ? [
                `Swap Vehicle: ${confirmation.swapVehicle.year} ${confirmation.swapVehicle.make} ${confirmation.swapVehicle.model} — ${confirmation.swapVehicle.condition}`,
              ]
            : []),
          `All-In Budget: ${formatNGN(confirmation.financials.totalBudgetNGN)}`,
          `Max Canadian Bid: ${formatCAD(confirmation.financials.maxBidCAD)}`,
          `Destination Port: ${confirmation.financials.destinationPort}`,
        ].join("\n")
      )
    : "#";

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white">
      <TopNav
        announcement="Custom Canadian Sourcing Concierge — Reverse Budget to Auction Bid"
        onOpenMenu={() => setMenuOpen(true)}
      />

      <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
        <TelemetryEyebrow category="Concierge" spec="Dual-Mode Mandate Builder" />
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-[1.06] tracking-tight sm:text-4xl lg:text-5xl">
          Tell us the car.
          <br />
          <span className="text-white/40">We source it from Ontario.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/60">
          Tell us your total all-in Lagos budget and the vehicle you want — we
          reverse the landed-cost formula to show exactly what you can bid in
          Canada, then dispatch a sourcing mandate straight to our auction desk.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-3 px-4 pb-20 sm:px-6 lg:grid-cols-4 lg:px-10">
        <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#101216] lg:col-span-2">
          <CrossX />
          <ModeGateSelector value={mode} onChange={setMode} />

          <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Step 1 &mdash; All-In Nigerian Budget &amp; Logistics
            </p>

            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Total All-In Budget (₦)
                </span>
                <NumberStepper
                  value={totalBudgetNGN}
                  onChange={setTotalBudgetNGN}
                  step={1_000_000}
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  aria-label="Total all-in budget in Naira"
                />
              </div>
              <input
                type="range"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                value={totalBudgetNGN}
                onChange={(event) => setTotalBudgetNGN(Number(event.target.value))}
                className="range-slider mt-3 w-full"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #10B981 ${budgetFillPct}%, #0A0B0E ${budgetFillPct}%, #0A0B0E 100%)`,
                }}
              />
              <div
                className="mt-3 flex flex-wrap gap-2"
                onMouseLeave={() => setHoveredPreset(null)}
              >
                {BUDGET_PRESETS.map((preset) => {
                  const active = totalBudgetNGN === preset;
                  const showHover = !active && hoveredPreset === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTotalBudgetNGN(preset)}
                      onMouseEnter={() => setHoveredPreset(preset)}
                      className={`${CHIP_BASE} relative overflow-hidden ${active ? CHIP_ACTIVE : CHIP_INACTIVE}`}
                    >
                      {active && (
                        <GlidingPill layoutId="budget-preset-active" className="rounded-full bg-[#10B981]" />
                      )}
                      {showHover && (
                        <GlidingPill
                          layoutId="budget-preset-hover"
                          className="rounded-full border border-white/25 bg-white/10"
                        />
                      )}
                      <span className="relative z-10">{formatNGNCompact(preset)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                Target Model Year
              </span>
              <div className="mt-1.5">
                <CustomSelect
                  value={String(year)}
                  onChange={(v) => setYear(Number(v))}
                  options={YEAR_OPTIONS.map((y) => ({ label: String(y), value: String(y) }))}
                  aria-label="Target Model Year"
                />
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
                Customs Age Tier:{" "}
                <span className="text-white/70">{maxBid.breakdown.ageTier}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
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
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
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

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0A0B0E] px-5 py-3.5">
              <span className="font-mono text-[10px] uppercase tracking-widest tnum text-white/40">
                Live Exchange Rate
              </span>
              <span className="font-mono text-sm tnum text-white">
                ₦{fx.rate.toLocaleString("en-NG")} / CAD
              </span>
            </div>

            <p className="pt-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
              Step 2 &mdash; Target Vehicle Dossier &amp; Buyer Contact
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldInput
                label="Make"
                value={make}
                onChange={(v) => {
                  setMake(v);
                  clearFieldError("make");
                }}
                placeholder="e.g. Porsche"
                error={invalidFields.has("make")}
              />
              <FieldInput
                label="Model"
                value={model}
                onChange={(v) => {
                  setModel(v);
                  clearFieldError("model");
                }}
                placeholder="e.g. Cayenne Coupe"
                error={invalidFields.has("model")}
              />
              <FieldInput
                label="Preferred Trim / Exterior Color"
                value={trimOrColor}
                onChange={setTrimOrColor}
              />
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                  Maximum Mileage (km)
                </span>
                <NumberStepper
                  value={maxMileageKm}
                  onChange={setMaxMileageKm}
                  step={5_000}
                  min={0}
                  aria-label="Maximum mileage in kilometers"
                />
              </div>
              <FieldInput
                label="Buyer Full Name"
                value={buyerName}
                onChange={(v) => {
                  setBuyerName(v);
                  clearFieldError("buyerName");
                }}
                error={invalidFields.has("buyerName")}
              />
              <FieldInput
                label="Email"
                type="email"
                value={buyerEmail}
                onChange={(v) => {
                  setBuyerEmail(v);
                  clearFieldError("buyerEmail");
                }}
                error={invalidFields.has("buyerEmail")}
              />
              <FieldInput
                label="Nigerian WhatsApp Number"
                value={buyerPhone}
                onChange={(v) => {
                  setBuyerPhone(v);
                  clearFieldError("buyerPhone");
                }}
                placeholder="+234 80..."
                error={invalidFields.has("buyerPhone")}
              />
            </div>

            {mode === "CAR_SWAP" && (
              <>
                <p className="pt-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Step 3 &mdash; Vehicle You&apos;re Swapping / Upgrading From
                </p>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                    Your Current Trade-In Vehicle
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                        Current Vehicle Year
                      </span>
                      <NumberStepper
                        value={swapYear}
                        onChange={setSwapYear}
                        step={1}
                        aria-label="Current vehicle year"
                      />
                    </div>
                    <FieldInput
                      label="Current Vehicle Make"
                      value={swapMake}
                      onChange={(v) => {
                        setSwapMake(v);
                        clearFieldError("swapMake");
                      }}
                      placeholder="e.g. Toyota"
                      error={invalidFields.has("swapMake")}
                    />
                    <FieldInput
                      label="Current Vehicle Model"
                      value={swapModel}
                      onChange={(v) => {
                        setSwapModel(v);
                        clearFieldError("swapModel");
                      }}
                      placeholder="e.g. Camry SE"
                      error={invalidFields.has("swapModel")}
                    />
                    <FieldInput
                      label="Condition"
                      value={swapCondition}
                      onChange={(v) => {
                        setSwapCondition(v);
                        clearFieldError("swapCondition");
                      }}
                      placeholder="e.g. Clean title, minor rear scuff"
                      error={invalidFields.has("swapCondition")}
                    />
                  </div>
                  <p className="mt-3 font-mono text-[10px] text-white/45">
                    Swap value is assessed after photo inspection of the trade-in.{" "}
                    <span className="text-emerald-400">Same You. A Better Ride!</span>
                  </p>
                </div>
              </>
            )}

            {submitError && (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-400">
                {submitError}
              </p>
            )}

            {!confirmation && (
              <button
                type="submit"
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white text-zinc-950 transition-colors hover:bg-zinc-100"
              >
                <span className="font-mono text-xs font-bold uppercase tracking-widest">
                  Generate Mandate Ticket
                </span>
                <Plus className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </form>

          {confirmation && (
            <ConfirmationView confirmation={confirmation} whatsappUrl={whatsappUrl} />
          )}
        </div>

        <div className="rounded-2xl border border-white/12 bg-[#101216] p-6 text-white lg:col-span-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            Live Purchasing Power
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
            Maximum Canadian Vehicle Price
          </p>
          <p className="mt-1 font-mono text-4xl font-bold tracking-tight tnum sm:text-5xl">
            {formatCAD(maxBid.maxBasePriceCAD)}
          </p>
          <p className="font-mono text-sm tnum text-white/45">
            &#8776; {formatNGN(maxBid.breakdown.basePriceNGN)} of your budget
          </p>

          <div
            className={`mt-4 inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest ${feasibility.className}`}
          >
            {feasibility.label}
          </div>

          {matchingVehicle && (
            <Link
              href={`/track?id=${matchingVehicle.id}`}
              className="mt-3 flex min-h-[44px] items-center justify-between rounded-full border border-white/25 px-5 font-mono text-[10px] uppercase tracking-widest text-white transition hover:border-white/60 hover:bg-white/10"
            >
              In Stock Now: {matchingVehicle.name}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            </Link>
          )}

          <div className="mt-8">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
              Budget Allocation
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
                  <span className={`h-2 w-2 shrink-0 ${segment.className}`} />
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

          <div className="mt-8 space-y-2 border-t border-white/10 pt-4">
            <Row
              label="Recommended Auction Ceiling"
              value={formatCAD(maxBid.recommendedAuctionCeilingCAD)}
            />
            <Row
              label="Sourcing & Inspection Margin"
              value={formatCAD(maxBid.sourcingFeeCAD)}
            />
            <Row
              label="Ocean Freight & Insurance"
              value={formatNGN(
                maxBid.breakdown.freightNGN + maxBid.breakdown.insuranceNGN
              )}
            />
            <Row
              label="Customs & Port Clearing"
              value={formatNGN(
                maxBid.breakdown.customsDutyNGN +
                  maxBid.breakdown.nacLevyNGN +
                  maxBid.breakdown.statutoryTaxesNGN +
                  maxBid.breakdown.portClearingNGN
              )}
            />
            <div className="flex items-end justify-between border-t border-emerald-500/40 pt-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                Total All-In Budget
              </span>
              <span className="font-mono text-lg font-bold tnum text-emerald-400">
                {formatNGN(maxBid.breakdown.totalNGN)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <BottomFooter onOpenMenu={() => setMenuOpen(true)} />
      <NavigationDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
