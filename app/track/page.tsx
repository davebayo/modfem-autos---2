"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, FileText, Lock, Plus } from "lucide-react";
import { getUserById, getVehicleByVinOrId, useVehicles } from "@/lib/store";
import { useExchangeRate } from "@/lib/fx";
import {
  arrivalPortToDestinationPort,
  calculateLandedCost,
  formatCAD,
  formatNGN,
} from "@/lib/pricing";
import { MILESTONE_SEQUENCE } from "@/lib/milestones";
import { Vehicle, VehicleStatus } from "@/lib/types";
import { getWhatsAppUrl } from "@/lib/site-config";
import { TopNav } from "@/components/TopNav";
import { BottomFooter } from "@/components/BottomFooter";
import { NavigationDrawer } from "@/components/NavigationDrawer";
import { LandedCostDrawer } from "@/components/LandedCostDrawer";
import { StatusBadge } from "@/components/StatusBadge";
import { DocumentPreviewModal, DocumentType } from "@/components/DocumentPreviewModal";
import { CrossX } from "@/components/CrossX";
import { CHIP_ACTIVE, CHIP_BASE, CHIP_INACTIVE, GlidingPill } from "@/components/GlidingPill";
import { TelemetryEyebrow, TelemetrySlash } from "@/components/ui/TelemetryEyebrow";

interface DocumentDefinition {
  code: string;
  type: DocumentType;
  title: string;
  subtitle: string;
  requiredStatuses?: VehicleStatus[];
}

const DOCUMENT_DEFINITIONS: DocumentDefinition[] = [
  {
    code: "01",
    type: "EXPORT_CERT",
    title: "CARFAX & Canadian Export Certificate",
    subtitle: "Verified Clean Title",
  },
  {
    code: "02",
    type: "BILL_OF_LADING",
    title: "Ocean Bill of Lading (BOL)",
    subtitle: "Available once in transit",
    requiredStatuses: ["IN_TRANSIT", "CLEARING", "DELIVERED"],
  },
  {
    code: "03",
    type: "CUSTOMS_ASSESSMENT",
    title: "NCS Customs Assessment & SONCAP Release",
    subtitle: "Available once clearing",
    requiredStatuses: ["CLEARING", "DELIVERED"],
  },
];

function DocumentVault({
  vehicle,
  onOpenDocument,
}: {
  vehicle: Vehicle;
  onOpenDocument: (type: DocumentType) => void;
}) {
  return (
    <div className="mt-6 border-t border-white/10 pt-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
        Verified Export &amp; Customs Dossier
      </p>
      <div className="flex flex-col gap-2">
        {DOCUMENT_DEFINITIONS.map((doc) => {
          const available =
            !doc.requiredStatuses || doc.requiredStatuses.includes(vehicle.status);
          return (
            <button
              key={doc.type}
              type="button"
              disabled={!available}
              onClick={() => available && onOpenDocument(doc.type)}
              className={`flex items-center justify-between rounded-lg border border-white/10 bg-[#0D0F13] px-4 py-3 text-left transition-colors ${
                available ? "hover:bg-white/[0.05]" : "cursor-not-allowed opacity-40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-white/40">{doc.code}</span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-white">
                    {doc.title}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    {doc.subtitle}
                  </p>
                </div>
              </div>
              {available ? (
                <FileText className="h-4 w-4 shrink-0 text-white/40" strokeWidth={1.5} />
              ) : (
                <Lock className="h-4 w-4 shrink-0 text-white/25" strokeWidth={1.5} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const DEMO_CHIPS: { id: string; label: string }[] = [
  { id: "mercedes-gla250-4matic", label: "Mercedes GLA 250 — Delivered" },
  { id: "lexus-rx-350", label: "Lexus RX 350 — Clearing" },
  { id: "toyota-venza", label: "Toyota Venza — Reserved" },
];

function maskEmail(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex < 2) return email;
  const visible = email.slice(0, 2);
  const domain = email.slice(atIndex);
  return `${visible}${"*".repeat(Math.max(atIndex - 2, 3))}${domain}`;
}

function VehicleDossier({ vehicle }: { vehicle: Vehicle }) {
  const owner = vehicle.ownerId ? getUserById(vehicle.ownerId) : undefined;
  const destination = vehicle.shipment?.arrivalPort ?? "Not yet booked";

  return (
    <div className="col-span-1 flex flex-col gap-6 rounded-2xl border border-white/12 bg-[#101216] px-4 py-8 sm:px-8">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
        <Image
          src={vehicle.thumbnailUrl}
          alt={vehicle.name}
          fill
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="object-cover contrast-105"
        />
      </div>

      <div>
        <StatusBadge status={vehicle.status} />
        <h2 className="mt-3 text-xl font-bold tracking-tight text-white">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
        <p className="mt-1 font-mono text-[11px] tnum text-white/45">
          VIN {vehicle.vin}
        </p>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          Route
        </p>
        <p className="mt-2 text-sm text-white/70">{vehicle.location}</p>
        <div className="my-1 ml-[3px] h-3 border-l border-dashed border-white/20" />
        <p className="text-sm text-white">{destination}</p>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          Buyer Assignment
        </p>
        {owner?.name ? (
          <div className="mt-2">
            <p className="text-sm text-white">{owner.name}</p>
            <p className="font-mono text-xs text-white/45">
              {maskEmail(owner.email)}
            </p>
          </div>
        ) : vehicle.ownerId ? (
          <p className="mt-2 text-sm text-white/45">
            Reserved — buyer details withheld.
          </p>
        ) : (
          <p className="mt-2 text-sm text-white/45">
            Unassigned — available for purchase.
          </p>
        )}
      </div>
    </div>
  );
}

function StageCellGrid({ vehicle }: { vehicle: Vehicle }) {
  const logsByCode = useMemo(
    () => new Map(vehicle.trackingLogs.map((log) => [log.milestone, log])),
    [vehicle.trackingLogs]
  );

  let currentIndex = -1;
  MILESTONE_SEQUENCE.forEach((stage, index) => {
    if (currentIndex !== -1) return;
    const log = logsByCode.get(stage.code);
    if (!log || !log.completed) currentIndex = index;
  });
  const allCompleted = currentIndex === -1;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      {MILESTONE_SEQUENCE.map((stage, index) => {
        const log = logsByCode.get(stage.code);
        const isCompleted = allCompleted || index < currentIndex;
        const isCurrent = !allCompleted && index === currentIndex;
        const state = isCompleted ? "done" : isCurrent ? "current" : "pending";
        const mark = isCompleted ? "✓" : isCurrent ? "●" : "○";
        return (
          <div key={stage.code} className={`stage-cell ${state}`}>
            <p className={`sc-num tnum ${isCompleted || isCurrent ? "text-emerald-400" : "text-white/40"}`}>
              {String(index + 1).padStart(2, "0")} {mark}
            </p>
            <p className="mt-1.5 text-[12.5px] font-semibold leading-snug">{stage.title}</p>
            <p className="mt-0.5 font-mono text-[9.5px] text-white/40">
              {log
                ? new Date(log.timestamp).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric",
                  })
                : isCompleted
                  ? "VERIFIED"
                  : isCurrent
                    ? "ACTIVE"
                    : "PENDING"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ManifestRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/10 py-3">
      <span className="text-xs text-white/45">{label}</span>
      <span
        className={`whitespace-nowrap text-right text-xs tnum text-white ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ManifestCard({
  vehicle,
  onInspect,
  onOpenDocument,
}: {
  vehicle: Vehicle;
  onInspect: () => void;
  onOpenDocument: (type: DocumentType) => void;
}) {
  const fx = useExchangeRate();
  const shipment = vehicle.shipment;
  const destinationPort = shipment
    ? arrivalPortToDestinationPort(shipment.arrivalPort)
    : "Tin Can Island";
  const breakdown = calculateLandedCost(vehicle, {
    shippingMethod: shipment?.shippingMethod ?? "RoRo",
    destinationPort,
    exchangeRateCadToNgn: fx.rate,
  });

  return (
    <div className="col-span-1 rounded-2xl border border-white/12 bg-[#101216] p-6 text-white">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
        Maritime &amp; Customs Manifest
      </p>
      <p className="mt-1 font-mono text-sm font-bold tnum">
        {shipment?.bookingNumber ?? "NOT YET BOOKED"}
      </p>

      <div className="mt-6 border-t border-white/10 pt-1">
        <ManifestRow label="Vessel" value={shipment?.vesselName ?? "—"} mono={false} />
        <ManifestRow
          label="Shipping Mode"
          value={shipment?.shippingMethod ?? "—"}
          mono={false}
        />
        <ManifestRow
          label="Departure Date"
          value={shipment?.departureDate ?? "—"}
        />
        <ManifestRow label="ETA Lagos" value={shipment?.etaLagos ?? "—"} />
        <div className="flex items-baseline justify-between border-b border-white/10 py-3">
          <span className="text-xs text-white/45">Bill of Lading</span>
          <span
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
              shipment?.billOfLadingVerified
                ? "border-emerald-500/45 text-emerald-400"
                : "border-white/20 text-white/40"
            }`}
          >
            {shipment?.billOfLadingVerified ? "Verified" : "Pending"}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-1">
        <ManifestRow
          label="Vehicle Base"
          value={`${formatCAD(breakdown.basePriceCAD)} / ${formatNGN(
            breakdown.basePriceNGN
          )}`}
        />
        <ManifestRow
          label="Freight & Insurance"
          value={`${formatCAD(
            breakdown.freightCAD + breakdown.insuranceCAD
          )} / ${formatNGN(breakdown.freightNGN + breakdown.insuranceNGN)}`}
        />
        <ManifestRow
          label="Duty + Port Clearing"
          value={formatNGN(
            breakdown.customsDutyNGN +
              breakdown.nacLevyNGN +
              breakdown.portClearingNGN
          )}
        />
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-emerald-500/40 pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
          Total Landed
        </span>
        <span className="font-mono text-xl font-bold tracking-tight tnum text-emerald-400">
          {formatNGN(breakdown.totalNGN)}
        </span>
      </div>

      <button
        type="button"
        onClick={onInspect}
        className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-white/25 font-mono text-[10px] uppercase tracking-widest text-white transition hover:border-white/60 hover:bg-white/10"
      >
        Inspect Full Breakdown
        <Plus className="h-4 w-4" strokeWidth={1.5} />
      </button>

      <DocumentVault vehicle={vehicle} onOpenDocument={onOpenDocument} />
    </div>
  );
}

function getDaysSince(timestamp: string): number {
  return Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24));
}

function describeStaleness(timestamp: string): string {
  const diffDays = getDaysSince(timestamp);
  if (diffDays <= 0) return "Synced today";
  if (diffDays === 1) return "Synced 1 day ago";
  return `Synced ${diffDays} days ago`;
}

/** Automotive satellite/GPS transponder dial for the uplink module's radar
 * medallion — a dashed azimuth ring framing a sweep arc, crosshair ticks and
 * a pulsing core, all tinted emerald when the last sync is fresh or amber
 * when it's gone stale. */
function RadarTransponderDial({ stale }: { stale: boolean }) {
  const colorClass = stale ? "text-amber-500/80" : "text-emerald-500/70";
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 2"
        className="text-white/30"
      />
      <path
        d="M 10 2.5 A 7.5 7.5 0 0 1 17.5 10"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke="currentColor"
        className={colorClass}
      />
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" className={colorClass}>
        <line x1="10" y1="4.5" x2="10" y2="2.5" />
        <line x1="10" y1="15.5" x2="10" y2="17.5" />
        <line x1="4.5" y1="10" x2="2.5" y2="10" />
        <line x1="15.5" y1="10" x2="17.5" y2="10" />
      </g>
      <circle cx="10" cy="10" r="1.5" fill="currentColor" className={`${colorClass} animate-pulse`} />
    </svg>
  );
}

/** Camera-viewfinder / live-signal glyph for the concierge dispatch pill —
 * four corner brackets framing a center lens ring, replacing the generic
 * speech-bubble icon. */
function ViewfinderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 15 15" className={`h-[15px] w-[15px] shrink-0 ${className ?? ""}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 1 4.5 V 1.5 H 4" />
        <path d="M 11 1.5 H 14 V 4.5" />
        <path d="M 14 10.5 V 13.5 H 11" />
        <path d="M 4 13.5 H 1 V 10.5" />
        <circle cx="7.5" cy="7.5" r="2.3" />
      </g>
    </svg>
  );
}

function TelemetrySyncBox({ vehicle }: { vehicle: Vehicle }) {
  const latestLog = useMemo(() => {
    const completed = vehicle.trackingLogs.filter((log) => log.completed);
    if (completed.length === 0) return null;
    return completed.reduce((latest, log) =>
      new Date(log.timestamp) > new Date(latest.timestamp) ? log : latest
    );
  }, [vehicle.trackingLogs]);

  const diffDays = latestLog ? getDaysSince(latestLog.timestamp) : null;
  const isStale = diffDays === null || diffDays > 3;

  const whatsappUrl = getWhatsAppUrl(
    `Hi Modfem, can you share a live photo/status update for my ${vehicle.name} (VIN ${vehicle.vin})? The tracker last synced ${
      latestLog ? describeStaleness(latestLog.timestamp).toLowerCase() : "has no update yet"
    }.`
  );

  return (
    <div className="mx-auto mt-6 max-w-[1600px] px-4 sm:px-6 lg:px-10">
      <div className="relative flex w-full flex-col items-start justify-between gap-4 rounded-2xl border border-white/12 bg-[#101216] p-3.5 shadow-[0_12px_34px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:px-5 sm:py-4">
        <span className="absolute left-2 top-2 h-[2px] w-[2px] rounded-full bg-white/15" />
        <span className="absolute right-2 top-2 h-[2px] w-[2px] rounded-full bg-white/15" />
        <span className="absolute bottom-2 left-2 h-[2px] w-[2px] rounded-full bg-white/15" />
        <span className="absolute bottom-2 right-2 h-[2px] w-[2px] rounded-full bg-white/15" />

        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-[#0A0B0E]">
            <RadarTransponderDial stale={isStale} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                Last Telemetry Sync
              </span>
              <span className="rounded-full border border-white/12 bg-[#0A0B0E] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-500 tnum">
                {latestLog ? describeStaleness(latestLog.timestamp).toUpperCase() : "NO DATA"}
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] tracking-[0.08em] text-white/80 tnum">
              {latestLog ? (
                <>
                  LOGGED
                  <TelemetrySlash />
                  {new Date(latestLog.timestamp).toLocaleString("en-CA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </>
              ) : (
                "NO RECORD ON FILE — REQUEST A FRESH CAPTURE"
              )}
            </p>
          </div>
        </div>

        <div className="mx-4 hidden flex-1 items-center lg:flex">
          <div className="relative h-px w-full bg-white/10">
            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20" />
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-emerald-500/35 bg-[#0A0B0E] px-4 py-2.5 transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-500/10"
        >
          <ViewfinderIcon className="text-emerald-500" />
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-white transition-colors group-hover:text-emerald-500">
            Ask Modfem for a Live Photo/Status Update
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-emerald-500" />
            <ArrowUpRight
              className="h-3 w-3 text-white/50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
              strokeWidth={2}
            />
          </span>
        </a>
      </div>
    </div>
  );
}

function IndependentVerificationBox({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="mx-auto mt-6 grid max-w-[1600px] grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
      <div className="rounded-2xl border border-white/12 bg-[#101216] p-5 sm:p-6">
        <TelemetryEyebrow category="Independent Verification" spec="Nigeria" />
        <h3 className="mt-2 text-lg font-bold">VREG Portal</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">
          Confirm this VIN and its Nigerian customs duty status directly with
          the Nigeria Customs Service vehicle registry — don&apos;t take our
          word for it.
        </p>
        <a
          href="https://vreg.gov.ng"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-[13px] font-medium transition hover:border-white/60 hover:bg-white/10"
        >
          Open vreg.gov.ng
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </a>
      </div>
      <div className="rounded-2xl border border-white/12 bg-[#101216] p-5 sm:p-6">
        <TelemetryEyebrow category="Independent Verification" spec="North America" />
        <h3 className="mt-2 text-lg font-bold">NHTSA &amp; VIN Decoders</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">
          Cross-check recall history, build spec and theft records directly
          against manufacturer databases. VIN:{" "}
          <span className="font-mono tnum text-white/80">{vehicle.vin}</span>
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href="https://www.nhtsa.gov/recalls"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-[13px] font-medium transition hover:border-white/60 hover:bg-white/10"
          >
            NHTSA Recalls
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </a>
          <a
            href="https://www.nhtsa.gov/vin-decoder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-[13px] font-medium transition hover:border-white/60 hover:bg-white/10"
          >
            NHTSA VIN Decoder
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </div>
  );
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDocument, setOpenDocument] = useState<DocumentType | null>(null);
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(() => {
    const candidate =
      searchParams.get("vin") ||
      searchParams.get("id") ||
      searchParams.get("vehicleId");
    if (candidate) {
      const found = getVehicleByVinOrId(candidate);
      if (found) return found.id;
    }
    return "mercedes-gla250-4matic";
  });

  const vehicles = useVehicles();
  const vehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedId),
    [vehicles, selectedId]
  );

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const found = getVehicleByVinOrId(query);
    if (found) {
      setSelectedId(found.id);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white">
      <TopNav
        announcement="Trans-Atlantic VIN & Shipment Tracker — Live Milestone Feed"
        onOpenMenu={() => setMenuOpen(true)}
      />

      <div className="mx-auto max-w-[1600px] px-4 pb-7 pt-16 sm:px-6 sm:pt-24 lg:px-10">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-7 lg:flex-row lg:items-end">
          <div>
            <TelemetryEyebrow category="Radical Transparency" spec="Shipment Tracker" />
            <h2 className="mt-3 text-3xl font-bold leading-[1.06] tracking-tight sm:text-4xl lg:text-5xl">
              Where your car actually is.
            </h2>
          </div>
          <p className="max-w-sm font-mono text-[11px] leading-relaxed text-white/45">
            Telemetry is pushed from Ontario and the Lagos clearing desk. Independent
            verification links sit below the progress bar — check us without us.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2" onMouseLeave={() => setHoveredChip(null)}>
            {DEMO_CHIPS.map((chip) => {
              const active = selectedId === chip.id;
              const showHover = !active && hoveredChip === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(chip.id);
                    setNotFound(false);
                    setQuery("");
                  }}
                  onMouseEnter={() => setHoveredChip(chip.id)}
                  className={`${CHIP_BASE} relative overflow-hidden ${active ? CHIP_ACTIVE : CHIP_INACTIVE}`}
                >
                  {active && (
                    <GlidingPill layoutId="track-unit-active-pill" className="rounded-full bg-[#10B981]" />
                  )}
                  {showHover && (
                    <GlidingPill
                      layoutId="track-unit-hover-pill"
                      className="rounded-full border border-white/25 bg-white/10"
                    />
                  )}
                  <span className="relative z-10">{chip.label}</span>
                </button>
              );
            })}
          </div>
          <form onSubmit={handleSearch} className="flex w-full gap-2 lg:ml-auto lg:w-auto">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Order ref / VIN (e.g. MFC-2016-GLA-01)"
              className="field font-mono lg:w-72"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-white px-5 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100"
            >
              Lookup
            </button>
          </form>
        </div>
        {notFound && (
          <p className="mt-2 font-mono text-[11px] text-red-400">
            No consignment found for &ldquo;{query}&rdquo;. Try a VIN, vehicle ID, or
            booking number.
          </p>
        )}
      </div>

      {vehicle ? (
        <>
          <TelemetrySyncBox vehicle={vehicle} />

          <div className="mx-auto mt-6 max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#101216] p-5 sm:p-7">
              <CrossX />
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                    ORDER REF
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-bold tnum">
                    {vehicle.vin.slice(0, 8)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                    UNIT
                  </p>
                  <p className="mt-0.5 text-[15px] font-semibold">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>

              <StageCellGrid vehicle={vehicle} />
            </div>
          </div>

          <div className="mx-auto mt-6 grid max-w-[1600px] grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
            <VehicleDossier vehicle={vehicle} />
            <ManifestCard
              vehicle={vehicle}
              onInspect={() => setDrawerOpen(true)}
              onOpenDocument={(type) => setOpenDocument(type)}
            />
          </div>
          <IndependentVerificationBox vehicle={vehicle} />
        </>
      ) : (
        <div className="px-4 py-24 text-center font-mono text-xs uppercase tracking-widest text-white/40 sm:px-8">
          Select or search for a consignment to view its tracking record.
        </div>
      )}

      <BottomFooter onOpenMenu={() => setMenuOpen(true)} />

      {vehicle && (
        <LandedCostDrawer
          vehicle={vehicle}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
      {vehicle && (
        <DocumentPreviewModal
          vehicle={vehicle}
          documentType={openDocument}
          onClose={() => setOpenDocument(null)}
        />
      )}
      <NavigationDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0B0E]" />}>
      <TrackPageContent />
    </Suspense>
  );
}
