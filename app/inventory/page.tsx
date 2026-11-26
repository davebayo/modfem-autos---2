"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { MessageCircle, Plus, Search } from "lucide-react";
import { useVehicles } from "@/lib/store";
import { calculateLandedCost, formatCAD, formatNGN } from "@/lib/pricing";
import { useExchangeRate } from "@/lib/fx";
import { getVehicleInquiryUrl } from "@/lib/site-config";
import { formatVehicleStatus } from "@/lib/vehicles";
import { useTilt } from "@/lib/useTilt";
import {
  DestinationPort,
  ShippingMethod,
  Vehicle,
  VehicleStatus,
} from "@/lib/types";
import { TopNav } from "@/components/TopNav";
import { BottomFooter } from "@/components/BottomFooter";
import { NavigationDrawer } from "@/components/NavigationDrawer";
import { LandedCostDrawer } from "@/components/LandedCostDrawer";
import { StatusBadge } from "@/components/StatusBadge";
import { InspectionHotspots } from "@/components/InspectionHotspots";
import { MonroneyBadge } from "@/components/MonroneyBadge";
import { CrossX } from "@/components/CrossX";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { TelemetryEyebrow } from "@/components/ui/TelemetryEyebrow";
import { LotVinCapsule } from "@/components/ui/LotVinCapsule";
import { CHIP_ACTIVE, CHIP_BASE, CHIP_INACTIVE, GlidingPill } from "@/components/GlidingPill";

type StatusTab = "ALL" | VehicleStatus;
type PriceMode = "LANDED" | "BASE";

const STATUS_TABS: StatusTab[] = [
  "ALL",
  "AVAILABLE",
  "RESERVED",
  "IN_TRANSIT",
  "CLEARING",
];

const STATUS_TAB_LABELS: Record<StatusTab, string> = {
  ALL: "All",
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  IN_TRANSIT: "In Transit",
  CLEARING: "Clearing",
  DELIVERED: "Delivered",
};

function FeaturedVehicleCard({
  vehicle,
  shippingMethod,
  destinationPort,
  priceMode,
  exchangeRateCadToNgn,
  lot,
  onInspect,
}: {
  vehicle: Vehicle;
  shippingMethod: ShippingMethod;
  destinationPort: DestinationPort;
  priceMode: PriceMode;
  exchangeRateCadToNgn: number;
  lot: string;
  onInspect: () => void;
}) {
  const breakdown = calculateLandedCost(vehicle, {
    shippingMethod,
    destinationPort,
    exchangeRateCadToNgn,
  });
  const tiltRef = useRef<HTMLDivElement>(null);
  const tilt = useTilt(tiltRef, 4);

  // Real angle photos to switch between — the inspection gallery when one
  // exists (e.g. the GLA250's 6 Lagos photos), else distinct front/rear
  // shots. Vehicles with only a single photo get no switcher at all.
  const angles = useMemo(() => {
    if (vehicle.inspectionGallery && vehicle.inspectionGallery.length > 1) {
      return vehicle.inspectionGallery.slice(0, 6);
    }
    if (
      vehicle.frontImageUrl &&
      vehicle.rearImageUrl &&
      vehicle.frontImageUrl !== vehicle.rearImageUrl
    ) {
      return [
        { url: vehicle.frontImageUrl, label: "Front" },
        { url: vehicle.rearImageUrl, label: "Rear" },
      ];
    }
    return [];
  }, [vehicle]);
  const [activeAngle, setActiveAngle] = useState(0);
  const activeImageUrl = angles[activeAngle]?.url ?? vehicle.thumbnailUrl;

  const isDistress = vehicle.status === "DELIVERED" && vehicle.isDistressSale;
  const ledColor = isDistress ? "bg-red-500" : "bg-amber-500";
  const statusLine = isDistress
    ? "ON GROUND IN LAGOS — DISTRESS SALE"
    : `SOURCED IN ONTARIO — ${formatVehicleStatus(vehicle.status).toUpperCase()}`;

  return (
    <motion.article
      ref={tiltRef}
      {...tilt.handlers}
      style={{ ...tilt.style, transformStyle: "preserve-3d" }}
      className="cross relative overflow-hidden rounded-2xl border border-white/12 bg-[#101216]"
    >
      <CrossX />
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative min-w-0 bg-black">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={activeImageUrl}
              alt={`${vehicle.name} — ${angles[activeAngle]?.label ?? "front view"}`}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(10,11,14,.55), transparent 45%)" }}
            />
            <InspectionHotspots />
            <div className="absolute left-3 right-3 top-3 flex min-w-0 items-center gap-2 sm:right-36">
              <span className={`led ${ledColor}`} />
              <span className="truncate font-mono text-[10px] tracking-[0.16em] text-white">
                ● {statusLine}
              </span>
            </div>
            <div className="absolute right-3 top-3 hidden border border-white/20 bg-black/70 px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-white sm:block">
              RAW · {Math.max(angles.length, 1)} VIEW{angles.length === 1 ? "" : "S"}
            </div>
            <div className="absolute left-4 top-1/2 hidden -translate-y-1/2 sm:block">
              <StatusBadge status={vehicle.status} />
            </div>
          </div>
          {angles.length > 1 && (
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto p-3">
              {angles.map((angle, index) => (
                <button
                  key={angle.url}
                  type="button"
                  onClick={() => setActiveAngle(index)}
                  className={`thumb-btn${index === activeAngle ? " active" : ""}`}
                  aria-label={`View ${angle.label}`}
                  aria-current={index === activeAngle}
                >
                  <Image src={angle.url} alt={angle.label} fill sizes="64px" />
                  <span>{angle.label.slice(0, 3).toUpperCase()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col border-t border-white/10 p-5 sm:border-l sm:border-t-0 sm:p-7">
          <LotVinCapsule lot={lot} />
          <h3 className="mt-2 text-2xl font-bold leading-tight sm:text-[27px]">
            {vehicle.year} {vehicle.make}
            <br />
            {vehicle.model}
          </h3>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-3xl font-bold tnum text-emerald-400">
              {priceMode === "LANDED" ? formatNGN(breakdown.totalNGN) : formatCAD(breakdown.basePriceCAD)}
            </span>
            <span className="font-mono text-[11px] text-white/45">
              {priceMode === "LANDED" ? "LANDED · LAGOS" : "CANADA BASE"}
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-white/55">
            {priceMode === "LANDED"
              ? `${formatCAD(breakdown.basePriceCAD)} Canada base`
              : `${formatNGN(breakdown.totalNGN)} landed in Lagos`}
          </p>
          <dl className="mt-5 divide-y divide-white/8 border-y border-white/8 font-mono text-[11.5px]">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-white/45">ORIGIN</dt>
              <dd className="min-w-0 break-words text-right">{vehicle.location}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-white/45">DRIVETRAIN</dt>
              <dd className="min-w-0 break-words text-right">{vehicle.specs.drivetrain}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-white/45">ENGINE</dt>
              <dd className="min-w-0 break-words text-right">{vehicle.specs.engine}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-white/45">MILEAGE</dt>
              <dd className="min-w-0 break-words text-right">{vehicle.specs.mileageKm.toLocaleString("en-CA")} KM</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-white/45">VIN</dt>
              <dd className="min-w-0 break-words text-right">{vehicle.vin}</dd>
            </div>
          </dl>
          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            <button
              type="button"
              onClick={onInspect}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Inspect Breakdown
            </button>
            <a
              href={getVehicleInquiryUrl(vehicle.name, formatNGN(breakdown.totalNGN))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              WhatsApp Modfem
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ArchiveRow({
  vehicle,
  lot,
  landedLabel,
}: {
  vehicle: Vehicle;
  lot: string;
  landedLabel: string;
}) {
  return (
    <div className="group flex flex-wrap items-center gap-4 p-3.5 transition hover:bg-white/[0.04] sm:flex-nowrap">
      <div className="relative shrink-0 border border-white/20" style={{ width: 140, height: 96 }}>
        <Image
          src={vehicle.thumbnailUrl}
          alt={vehicle.name}
          fill
          sizes="140px"
          className="object-cover"
        />
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(140deg, rgba(255,255,255,.06), transparent 55%)" }}
        />
        <span className="absolute -left-px -top-px h-2.5 w-2.5 border-l border-t border-amber-500/80" />
        <span className="absolute -bottom-px -right-px h-2.5 w-2.5 border-b border-r border-amber-500/80" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-tight">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </p>
        <p className="mt-1 font-mono text-[10.5px] text-white/45">
          LOT {lot} · FLYER CAPTURE · 140×96 NATIVE
        </p>
      </div>
      <span className="rounded-full border border-amber-500/40 px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-amber-400">
        [VERIFY] INDICATIVE ESTIMATE
      </span>
      <p className="w-[150px] text-right font-mono text-[15px] font-bold tnum text-white/85">
        {landedLabel} <span className="text-[11px] font-normal text-white/40">Landed</span>
      </p>
    </div>
  );
}

export default function InventoryPage() {
  const vehicles = useVehicles();
  const fx = useExchangeRate();
  const [statusFilter, setStatusFilter] = useState<StatusTab>("ALL");
  const [hoveredStatusTab, setHoveredStatusTab] = useState<StatusTab | null>(null);
  const [priceMode, setPriceMode] = useState<PriceMode>("LANDED");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("RoRo");
  const [destinationPort, setDestinationPort] =
    useState<DestinationPort>("Tin Can Island");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [inspectingVehicleId, setInspectingVehicleId] = useState<string | null>(
    null
  );
  const inspectingVehicle =
    vehicles.find((v) => v.id === inspectingVehicleId) ?? null;

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      if (statusFilter !== "ALL" && vehicle.status !== statusFilter) {
        return false;
      }
      if (!query) return true;
      return (
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        String(vehicle.year).includes(query) ||
        vehicle.vin.toLowerCase().includes(query)
      );
    });
  }, [vehicles, statusFilter, search]);

  const featured = filteredVehicles.filter((v) => v.imageResolution !== "thumbnail");
  const archive = filteredVehicles.filter((v) => v.imageResolution === "thumbnail");

  function lotFor(vehicle: Vehicle) {
    const index = vehicles.findIndex((v) => v.id === vehicle.id);
    return String(index + 1).padStart(2, "0");
  }

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white">
      <TopNav
        announcement="4-Column Inventory Catalog — Live Landed Cost Across the Fleet"
        onOpenMenu={() => setMenuOpen(true)}
      />

      <div className="mx-auto max-w-[1600px] px-4 pb-6 pt-16 sm:px-6 sm:pt-24 lg:px-10">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-7 lg:flex-row lg:items-end">
          <div>
            <TelemetryEyebrow category="Fleet Ledger" spec="Monroney Spec-Sheet Telemetry" />
            <h2 className="mt-3 text-3xl font-bold leading-[1.06] tracking-tight sm:text-4xl lg:text-5xl">
              {featured.length} unit{featured.length === 1 ? "" : "s"} on the books.
              <br />
              <span className="text-white/40">Nothing hidden between the lines.</span>
            </h2>
          </div>
          <div className="max-w-md border-l border-white/15 pl-4 font-mono text-[11px] leading-relaxed text-white/50">
            {priceMode === "LANDED" ? "Landed in Lagos (₦)" : "Canada Base ($ CAD)"} · {shippingMethod} ·{" "}
            {destinationPort}
            <br />
            Prices shown are <span className="text-emerald-400">live-calculated</span>, not estimates.
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div
            className="flex min-w-0 flex-wrap items-center gap-2 rounded-2xl border border-white/12 bg-[#101216] p-3"
            onMouseLeave={() => setHoveredStatusTab(null)}
          >
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab;
              const showHover = !active && hoveredStatusTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  onMouseEnter={() => setHoveredStatusTab(tab)}
                  className={`${CHIP_BASE} relative shrink-0 overflow-hidden whitespace-nowrap ${active ? CHIP_ACTIVE : CHIP_INACTIVE}`}
                >
                  {active && (
                    <GlidingPill layoutId="inventory-status-active" className="rounded-full bg-[#10B981]" />
                  )}
                  {showHover && (
                    <GlidingPill
                      layoutId="inventory-status-hover"
                      className="rounded-full border border-white/25 bg-white/10"
                    />
                  )}
                  <span className="relative z-10">{STATUS_TAB_LABELS[tab]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col justify-center gap-2 rounded-2xl border border-white/12 bg-[#101216] p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Price Mode
            </p>
            <SegmentedToggle
              value={priceMode}
              onChange={setPriceMode}
              options={[
                { label: "Landed in Lagos (₦)", value: "LANDED" },
                { label: "Canada Base ($ CAD)", value: "BASE" },
              ]}
            />
          </div>

          <div className="flex flex-col justify-center gap-2 rounded-2xl border border-white/12 bg-[#101216] p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Global Freight Baseline
            </p>
            <div className="flex flex-col gap-2">
              <SegmentedToggle
                value={shippingMethod}
                onChange={setShippingMethod}
                options={[
                  { label: "RoRo", value: "RoRo" },
                  { label: "Container", value: "Container" },
                ]}
              />
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

          <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-[#101216] px-5 py-4">
            <Search className="h-4 w-4 shrink-0 text-white/40" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="SEARCH MAKE, MODEL, YEAR, VIN"
              className="w-full min-w-0 bg-transparent font-mono text-xs uppercase tracking-wide text-white placeholder:text-white/35 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* PRIMARY UNITS — full-resolution featured vehicles */}
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-4 pb-14 sm:px-6 lg:px-10">
        {featured.map((vehicle) => (
          <div key={vehicle.id}>
            {vehicle.isSampleEstimate && (
              <div className="mb-3">
                <MonroneyBadge />
              </div>
            )}
            <FeaturedVehicleCard
              vehicle={vehicle}
              shippingMethod={shippingMethod}
              destinationPort={destinationPort}
              priceMode={priceMode}
              exchangeRateCadToNgn={fx.rate}
              lot={lotFor(vehicle)}
              onInspect={() => setInspectingVehicleId(vehicle.id)}
            />
          </div>
        ))}

        {featured.length === 0 && archive.length === 0 && (
          <div className="rounded-2xl border border-white/12 bg-[#101216] px-8 py-24 text-center font-mono text-xs uppercase tracking-widest text-white/40">
            No vehicles match these filters.
          </div>
        )}
      </div>

      {/* ARCHIVE / RESOLUTION GUARD — low-res flyer-cutout units */}
      {archive.length > 0 && (
        <div className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-6 lg:px-10">
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400">
                  Recent Sourcing Archive &amp; Flyer Captures
                </p>
                <p className="mt-2 max-w-2xl text-sm text-white/60">
                  Rendered at native thumbnail scale (never stretched). Request full inspection
                  dossier on WhatsApp.
                </p>
              </div>
              <span className="self-start rounded-full border border-amber-500/40 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-amber-400/90">
                [VERIFY] {archive.length} INDICATIVE ESTIMATE{archive.length === 1 ? "" : "S"}
              </span>
            </div>

            <div className="mt-6 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10">
              {archive.map((vehicle) => {
                const breakdown = calculateLandedCost(vehicle, {
                  shippingMethod,
                  destinationPort,
                  exchangeRateCadToNgn: fx.rate,
                });
                return (
                  <ArchiveRow
                    key={vehicle.id}
                    vehicle={vehicle}
                    lot={lotFor(vehicle)}
                    landedLabel={formatNGN(breakdown.totalNGN)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      <BottomFooter onOpenMenu={() => setMenuOpen(true)} />

      {inspectingVehicle && (
        <LandedCostDrawer
          vehicle={inspectingVehicle}
          isOpen={inspectingVehicle !== null}
          onClose={() => setInspectingVehicleId(null)}
        />
      )}
      <NavigationDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
