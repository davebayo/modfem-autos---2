"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  animate as animateMotionValue,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import {
  ArrowUpRight,
  MessageCircle,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { Vehicle } from "@/lib/types";
import { formatNGN } from "@/lib/pricing";
import { getVehicleInquiryUrl, getWhatsAppUrl } from "@/lib/site-config";
import { getHeroPlate, useAtmosphere } from "@/lib/use-atmosphere";
import { CinematicAtmosphere } from "@/components/CinematicAtmosphere";
import { LagosInspectionModal } from "@/components/LagosInspectionModal";
import { ModfemLogoMark } from "@/components/ui/ModfemLogoMark";

interface DistressHeroProps {
  vehicle: Vehicle;
  onOpenLandedCostDrawer: () => void;
  ignitionComplete: boolean;
}

function SpeedStreaks({ style }: { style?: MotionStyle }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "repeating-linear-gradient(112deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 2px, transparent 2px, transparent 44px)",
        maskImage: "linear-gradient(90deg, transparent, black 25%, black 75%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 25%, black 75%, transparent)",
        ...style,
      }}
    />
  );
}

/** Redline tachometer dial for the distress capsule's left chamber — a
 * 5-tick gauge ring with a crimson redline arc and a needle that sweeps up
 * into the red on mount. Uses a framer-motion MotionValue (not a raw CSS
 * keyframe) so the sweep eases from its live angle rather than restarting;
 * respects reduced motion by resting the needle in the redline immediately. */
function TachometerDial() {
  const reducedMotion = useReducedMotion();
  const needleRotate = useMotionValue(-150);
  const ticks = Array.from({ length: 5 });

  useEffect(() => {
    if (reducedMotion) {
      needleRotate.set(-10);
      return;
    }
    const sweep = animateMotionValue(needleRotate, -10, {
      type: "spring",
      stiffness: 120,
      damping: 9,
      delay: 0.3,
    });
    return () => sweep.stop();
  }, [reducedMotion, needleRotate]);

  return (
    <svg viewBox="0 0 16 16" className="h-[13px] w-[13px] shrink-0 text-[#F43F5E]">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
      {ticks.map((_, i) => {
        const angle = (-210 + i * 60) * (Math.PI / 180);
        const x1 = 8 + 5 * Math.cos(angle);
        const y1 = 8 + 5 * Math.sin(angle);
        const x2 = 8 + 6.8 * Math.cos(angle);
        const y2 = 8 + 6.8 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeLinecap="round"
          />
        );
      })}
      {/* Redline arc — upper-right quadrant */}
      <path d="M 12.6 4.14 A 6 6 0 0 1 13.2 11" fill="none" stroke="#F43F5E" strokeWidth="1.75" strokeLinecap="round" />
      <motion.line
        x1="8"
        y1="8"
        x2="8"
        y2="3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        style={{ rotate: needleRotate, originX: "8px", originY: "8px" }}
      />
      <circle cx="8" cy="8" r="1.1" fill="currentColor" />
    </svg>
  );
}

/** Minimalist top-down coupe/SUV silhouette for the distress capsule's
 * right chamber, with two emerald headlamp accents signaling the unit is
 * live and ignition-ready. */
function ChassisGlyph() {
  return (
    <svg viewBox="0 0 22 12" className="h-[10px] w-[18px] shrink-0">
      {/* Aerodynamic body, nose pointed right */}
      <path
        d="M 2.5 4 L 2.5 8 C 2.5 8.8 3.2 9.3 4.5 9.3 L 14 9.3 C 16.5 9.3 18.5 8 19.7 6 C 18.5 4 16.5 2.7 14 2.7 L 4.5 2.7 C 3.2 2.7 2.5 3.2 2.5 4 Z"
        fill="none"
        stroke="white"
        strokeOpacity="0.7"
        strokeWidth="1.25"
      />
      {/* Panoramic roof / windshield pillars */}
      <path
        d="M 9 3.4 C 10.8 2.6 13 2.6 14.8 3.4 M 9 8.6 C 10.8 9.4 13 9.4 14.8 8.6"
        fill="none"
        stroke="white"
        strokeOpacity="0.7"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Headlamp pair at the nose */}
      <circle cx="18.6" cy="4.6" r="0.8" fill="#10B981" />
      <circle cx="18.6" cy="7.4" r="0.8" fill="#10B981" />
    </svg>
  );
}

/** Automotive VIN & chassis seal — the medallion inside the verification
 * plaque's left circle. A segmented gauge ring frames a minimal headlamp
 * silhouette over a 6-bar VIN barcode, bisected by a laser-scan line with
 * a verification node, standing in for the stock shield-check icon. */
function VinMedallionIcon() {
  const bars = Array.from({ length: 6 });

  return (
    <svg viewBox="0 0 22 22" className="h-[22px] w-[22px] shrink-0">
      <circle
        cx="11"
        cy="11"
        r="10"
        fill="none"
        stroke="#10B981"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeDasharray="3 2"
      />
      {/* Upper motif: front chassis / headlamp silhouette */}
      <path
        d="M 6 9.5 C 6 6.8 8.3 5 11 5 C 13.7 5 16 6.8 16 9.5"
        fill="none"
        stroke="white"
        strokeOpacity="0.85"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="7.4" cy="8.4" r="0.6" fill="white" fillOpacity="0.85" />
      <circle cx="14.6" cy="8.4" r="0.6" fill="white" fillOpacity="0.85" />
      {/* Lower motif: VIN barcode bisected by a laser-scan line */}
      {bars.map((_, i) => {
        const x = 7 + i * 1.6;
        return (
          <line
            key={i}
            x1={x}
            y1="12"
            x2={x}
            y2="17"
            stroke="white"
            strokeOpacity="0.7"
            strokeWidth="0.9"
          />
        );
      })}
      <line x1="6" y1="14.5" x2="16" y2="14.5" stroke="#10B981" strokeOpacity="0.25" strokeWidth="3" />
      <line x1="6" y1="14.5" x2="16" y2="14.5" stroke="#10B981" strokeWidth="1" />
      <circle cx="16.5" cy="14.5" r="1" fill="#10B981" />
    </svg>
  );
}

const HERO_NAV_ITEMS = [
  { key: "inventory", href: "/inventory", label: "Inventory" },
  { key: "track", href: "/track", label: "Track" },
  { key: "swap", href: "/request", label: "Car Upgrade & Swap" },
];

/** Hero-only magnetic gliding nav pill — a deliberate, scoped exception to
 * the Arena Aesthetic's flat-carbon rule (see CLAUDE.md "Primary Navigation
 * Exception"). A single shared `layoutId` span slides between whichever
 * link is hovered, snapping back to nothing (plain text) once the pointer
 * leaves the nav entirely. */
function HeroNav() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
    <nav className="flex items-center gap-1" onMouseLeave={() => setHoveredKey(null)}>
      {HERO_NAV_ITEMS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          prefetch={true}
          onMouseEnter={() => setHoveredKey(item.key)}
          className="relative px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-white/80 transition-colors duration-300 hover:text-white"
        >
          {hoveredKey === item.key && (
            <motion.span
              layoutId="modfem-nav-pill"
              className="absolute inset-0 -z-10 rounded-full border border-white/25 bg-white/10 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22)]"
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
            />
          )}
          <span className="relative">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function RailButton({
  onClick,
  label,
  icon,
}: {
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/20"
    >
      {icon}
    </button>
  );
}

export function DistressHero({ vehicle, onOpenLandedCostDrawer, ignitionComplete }: DistressHeroProps) {
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollScale = useTransform(scrollY, [0, 600], [1, 1.16]);
  const scrollYOffset = useTransform(scrollY, [0, 600], [0, 28]);
  const scrollStreakOpacity = useTransform(scrollY, [0, 600], [0, 1]);
  const scrollFlareOpacity = useTransform(scrollY, [0, 600], [0.12, 0.4]);

  const [arrivalKey, setArrivalKey] = useState(0);
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const atmosphere = useAtmosphere();
  const heroRef = useRef<HTMLElement>(null);

  const landedLabel = vehicle.distressPriceNGN ? formatNGN(vehicle.distressPriceNGN) : "";
  const claimUrl = getVehicleInquiryUrl(vehicle.name, landedLabel);

  // Arrival drive-in: starts pulled-in/offset (pre-ignition rest pose) and
  // decelerates to the resting frame, settling 0.4deg nose-down like a
  // car braking to a stop.
  const arrivalState = ignitionComplete
    ? { scale: 1, x: "0%", y: "0%", rotate: 0.4 }
    : { scale: 1.12, x: "-1.2%", y: "-0.8%", rotate: 0 };

  // Three pixel-registered master plates crossfade under the preset —
  // getHeroPlate is the single source of truth shared with CinematicAtmosphere.
  const activePlate = getHeroPlate(atmosphere.preset);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden bg-zinc-950"
    >
      {/* Scenic stage background */}
      <motion.div
        className="absolute inset-0"
        style={reducedMotion ? undefined : { scale: scrollScale, y: scrollYOffset }}
      >
        <motion.div
          key={arrivalKey}
          className="relative h-full w-full"
          initial={{ scale: 1.12, x: "-1.2%", y: "-0.8%", rotate: 0 }}
          animate={reducedMotion ? { scale: 1, x: "0%", y: "0%", rotate: 0 } : arrivalState}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/images/hero/gla-day.webp"
            alt={`${vehicle.name} — scenic highway stage, daylight`}
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-center transition-opacity duration-1000 ease-out"
            style={{ opacity: activePlate === "day" ? 1 : 0 }}
          />
          <Image
            src="/images/hero/gla-dusk.webp"
            alt={`${vehicle.name} — scenic highway stage, dusk`}
            fill
            quality={95}
            sizes="100vw"
            className="object-cover object-center transition-opacity duration-1000 ease-out"
            style={{ opacity: activePlate === "dusk" ? 1 : 0 }}
          />
          <Image
            src="/images/hero/gla-night.webp"
            alt={`${vehicle.name} — scenic highway stage, night`}
            fill
            quality={95}
            sizes="100vw"
            className="object-cover object-center transition-opacity duration-1000 ease-out"
            style={{ opacity: activePlate === "night" ? 1 : 0 }}
          />
        </motion.div>
      </motion.div>

      {/* Text-legibility scrim darkens the base plate only — the cinematic
          lighting layer below renders on top of it, so each profile's bloom/
          rim-light/beam-cone reads at full intended contrast instead of
          being crushed under the scrim. */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/30" />

      <CinematicAtmosphere preset={atmosphere.preset} />

      {/* Headlight flare, boosts on scroll — only when the lamps are actually lit */}
      {activePlate !== "day" && (
        <motion.div
          className="pointer-events-none absolute left-[36%] top-[58%] h-20 w-48 -translate-x-1/2 rounded-full bg-amber-100 blur-2xl"
          style={{ opacity: reducedMotion ? 0.2 : scrollFlareOpacity }}
        />
      )}

      {/* One-shot arrival speed streak flash */}
      <motion.div
        key={`arrival-streak-${arrivalKey}`}
        initial={{ opacity: ignitionComplete ? 0.8 : 0 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.1, delay: 0.1 }}
      >
        <SpeedStreaks />
      </motion.div>
      {/* Scroll-driven speed streaks */}
      <SpeedStreaks style={reducedMotion ? { opacity: 0 } : { opacity: scrollStreakOpacity }} />

      {/* Foreground content */}
      <div className="relative z-20 flex min-h-screen w-full flex-col lg:flex-row">
        {/* LEFT: Frosted glass architectural pillar — leaves the car and
            highway on the right 70% completely unobstructed */}
        <div className="flex w-full flex-col justify-between border-r border-white/[0.14] bg-black/45 p-8 shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.12)] backdrop-blur-2xl lg:min-h-screen lg:w-[30%] lg:p-12">
          <Link
            href="/"
            aria-label="Modfem Autos — Home"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#101216] transition-colors duration-200 hover:border-white/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0E]"
          >
            <ModfemLogoMark className="h-auto w-7 text-white" />
          </Link>

          <div className="mt-10 flex flex-col gap-5 lg:mt-0">
            <div className="inline-flex w-fit max-w-full flex-nowrap items-center gap-2 rounded-full border border-white/12 bg-[#101216] p-1 pr-3 shadow-[0_10px_30px_rgba(0,0,0,0.65)]">
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#F43F5E]/35 bg-[#F43F5E]/15 px-2.5 py-1">
                <TachometerDial />
                <span className="whitespace-nowrap font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.12em] text-[#F43F5E]">
                  Distress Sale
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                <ChassisGlyph />
                <span className="whitespace-nowrap font-mono text-[9.5px] uppercase leading-none tracking-[0.1em] text-white/85">
                  Lagos Pickup
                </span>
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#10B981]" />
              </span>
            </div>

            <h1 className="text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-5xl">
              GLA250 4MATIC.
              <br />
              Lagos Distress.
            </h1>

            <p className="max-w-sm text-sm font-light leading-relaxed text-zinc-300">
              2016 Model physically cleared and ready for immediate inspection
              and pickup in Lagos. 2.0L Turbo (211 HP), 7G-DCT 4MATIC AWD,
              Panoramic Sunroof &amp; Full Leather.
            </p>

            <button
              type="button"
              onClick={() => setInspectionOpen(true)}
              className="flex min-h-[48px] w-fit items-center gap-2 rounded-full bg-white px-5 text-[10px] font-medium uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              Inspect Real Lagos Photos &amp; Specs
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 lg:mt-0">
            <div className="relative flex w-full max-w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/12 bg-[#101216] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
              <span className="absolute left-2 top-2 h-[2px] w-[2px] rounded-full bg-white/20" />
              <span className="absolute right-2 top-2 h-[2px] w-[2px] rounded-full bg-white/20" />
              <span className="absolute bottom-2 left-2 h-[2px] w-[2px] rounded-full bg-white/20" />
              <span className="absolute bottom-2 right-2 h-[2px] w-[2px] rounded-full bg-white/20" />

              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#10B981]/35 bg-[#0A0B0E]">
                <VinMedallionIcon />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="whitespace-nowrap font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                    VREG &amp; VIN Verified
                  </span>
                  <span className="shrink-0 font-mono text-[9px] tracking-[0.1em] text-[#10B981]">
                    [CLEARED]
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2 whitespace-nowrap border-t border-white/10 pt-1.5 font-mono text-[10px] uppercase tracking-[0.08em]">
                  <span className="text-white/60">Lagos Pickup</span>
                  <span className="tnum font-semibold text-white/95">{landedLabel} Flat</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Scenic stage overlays */}
        <div className="relative flex min-h-[75vh] w-full flex-col justify-between p-6 lg:min-h-screen lg:w-[70%] lg:p-10">
          {/* Top floating nav */}
          <div className="flex items-center justify-between">
            <HeroNav />
            <a
              href={getWhatsAppUrl(
                `Hi Modfem, I'd like to talk about sourcing a car from Canada to Nigeria.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Modfem"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-500 text-zinc-950 transition-colors hover:bg-emerald-400"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>

          {/* Right vertical rail */}
          <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex xl:right-8">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/60"
              style={{ writingMode: "vertical-rl" }}
            >
              Vaughan Ontario &middot; Lagos Nigeria
            </span>
            <div className="flex flex-col gap-3">
              <RailButton
                onClick={onOpenLandedCostDrawer}
                label="Open Landed Cost Drawer"
                icon={<Wallet className="h-4 w-4" strokeWidth={1.5} />}
              />
              <RailButton
                onClick={() => setArrivalKey((prev) => prev + 1)}
                label="Replay Drive-In Motion"
                icon={<RefreshCw className="h-4 w-4" strokeWidth={1.5} />}
              />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col gap-4 pr-2 lg:mt-0 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/12 bg-[#1C1E22]/82 px-5 py-4 backdrop-blur-xl sm:gap-6 sm:px-7">
              <div>
                <p className="text-sm font-medium text-white sm:text-base">2.0L / 211 HP</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-widest text-zinc-400">
                  Turbocharged Inline-4
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-white sm:text-base">7G-DCT AWD</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-widest text-zinc-400">
                  4MATIC Dual-Clutch
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-white sm:text-base">{landedLabel}</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-widest text-zinc-400">
                  Distress Price (Lagos)
                </p>
              </div>
            </div>

            <a
              href={claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Claim this GLA250 on WhatsApp"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 transition-colors hover:bg-emerald-400"
            >
              <ArrowUpRight className="h-5 w-5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>

      <LagosInspectionModal
        vehicle={vehicle}
        isOpen={inspectionOpen}
        onClose={() => setInspectionOpen(false)}
        onOpenLandedCostSheet={() => {
          setInspectionOpen(false);
          onOpenLandedCostDrawer();
        }}
      />
    </section>
  );
}
