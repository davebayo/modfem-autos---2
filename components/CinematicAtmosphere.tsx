import { AtmospherePreset, getHeroPlate } from "@/lib/use-atmosphere";

interface CinematicAtmosphereProps {
  preset: AtmospherePreset;
}

// Hand-measured anchor points on the hero plates, expressed as percentages
// of the full hero section (the background image is object-cover, full-bleed
// behind the whole section) so every lighting overlay below stays aligned to
// the actual photo.
const LEFT_LAMP = { xPct: 39.25, yPct: 50.4 };
const RIGHT_LAMP = { xPct: 55.3, yPct: 50.8 };
// Representative village-rooftop light positions along the horizon band —
// an approximation (this overlay never samples the actual <Image> pixels
// beneath it), spread across the width while leaving the car itself clear.
const VILLAGE_LIGHTS = [
  { xPct: 9, yPct: 44 },
  { xPct: 21, yPct: 47 },
  { xPct: 32, yPct: 45 },
  { xPct: 73, yPct: 43 },
  { xPct: 84, yPct: 46 },
  { xPct: 92, yPct: 44 },
];

const TRANSITION = "transition-opacity duration-1000 ease-out";

/** Elite, particle-free lighting layer for the hero stage. No canvas, no
 * rAF loop, no simulation — just a handful of always-mounted DOM/SVG
 * overlays whose opacity crossfades in lockstep with the 3 master plates
 * (day / dusk / night), grading each into its own cinematic profile:
 * crisp daylight bloom, warm dusk rim-light + DRL strips, or blue-hour
 * night with volumetric headlamp cones and glowing village lights. */
export function CinematicAtmosphere({ preset }: CinematicAtmosphereProps) {
  const activePlate = getHeroPlate(preset);
  const isDay = activePlate === "day";
  const isDusk = activePlate === "dusk";
  const isNight = activePlate === "night";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* SUNNY DAY — crisp high-contrast grading + warm sun-ray bloom from
          the top-left. */}
      <div
        className={`absolute inset-0 ${TRANSITION}`}
        style={{
          opacity: isDay ? 1 : 0,
          background:
            "radial-gradient(circle at 18% 10%, rgba(255,250,235,0.26), transparent 42%), radial-gradient(ellipse at center, transparent 55%, rgba(10,12,16,0.14) 100%)",
        }}
      />

      {/* GOLDEN DUSK — amber rim light along the mountain ridge + glowing
          LED DRL strips at each headlamp. */}
      <div
        className={`absolute inset-0 ${TRANSITION}`}
        style={{
          opacity: isDusk ? 1 : 0,
          background:
            "linear-gradient(180deg, rgba(255,175,95,0.28) 0%, rgba(255,175,95,0.1) 18%, transparent 36%)",
        }}
      />
      {isDusk && (
        <>
          {[LEFT_LAMP, RIGHT_LAMP].map((lamp) => (
            <div
              key={`drl-${lamp.xPct}`}
              className="absolute h-2 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/70 blur-[3px]"
              style={{ left: `${lamp.xPct}%`, top: `${lamp.yPct}%` }}
            />
          ))}
        </>
      )}

      {/* NIGHT HIGH-BEAMS — deep blue-hour grading, volumetric SVG headlamp
          cones, taillight/cabin glow, and glowing village house lights. */}
      <div
        className={`absolute inset-0 ${TRANSITION}`}
        style={{
          opacity: isNight ? 1 : 0,
          background: "linear-gradient(180deg, rgba(10,18,42,0.22), rgba(10,18,42,0.08) 45%, rgba(10,18,42,0.2))",
        }}
      />
      <svg
        className={`absolute inset-0 h-full w-full ${TRANSITION}`}
        style={{ opacity: isNight ? 1 : 0, mixBlendMode: "screen" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="beam-left" x1={`${LEFT_LAMP.xPct}%`} y1={`${LEFT_LAMP.yPct}%`} x2="30%" y2="88%">
            <stop offset="0%" stopColor="rgba(255,248,222,0.45)" />
            <stop offset="100%" stopColor="rgba(255,248,222,0)" />
          </linearGradient>
          <linearGradient id="beam-right" x1={`${RIGHT_LAMP.xPct}%`} y1={`${RIGHT_LAMP.yPct}%`} x2="66%" y2="88%">
            <stop offset="0%" stopColor="rgba(255,248,222,0.45)" />
            <stop offset="100%" stopColor="rgba(255,248,222,0)" />
          </linearGradient>
        </defs>
        <polygon
          points={`${LEFT_LAMP.xPct},${LEFT_LAMP.yPct} 18,88 42,88`}
          fill="url(#beam-left)"
        />
        <polygon
          points={`${RIGHT_LAMP.xPct},${RIGHT_LAMP.yPct} 52,88 80,88`}
          fill="url(#beam-right)"
        />
      </svg>
      {isNight && (
        <>
          <div
            className="absolute h-10 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/25 blur-xl"
            style={{ left: "60%", top: "47%" }}
          />
          <div
            className="absolute h-6 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/30 blur-lg"
            style={{ left: "47%", top: "46%" }}
          />
          {VILLAGE_LIGHTS.map((light, index) => (
            <div
              key={`village-light-${light.xPct}-${light.yPct}`}
              className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-amber-200/80 blur-[1px]"
              style={{
                left: `${light.xPct}%`,
                top: `${light.yPct}%`,
                animationDelay: `${index * 0.4}s`,
                animationDuration: "3s",
              }}
            />
          ))}
        </>
      )}

      {/* Lamp glow dots for the dusk DRL state (soft warm halo around each
          strip, independent of the sharper night high-beam treatment). */}
      {isDusk && (
        <>
          {[LEFT_LAMP, RIGHT_LAMP].map((lamp) => (
            <div
              key={`glow-${lamp.xPct}`}
              className="absolute h-10 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${lamp.xPct}%`,
                top: `${lamp.yPct}%`,
                background: "radial-gradient(ellipse, rgba(255,220,170,0.3), transparent 70%)",
                filter: "blur(5px)",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
