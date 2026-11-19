"use client";

import { useEffect, useState } from "react";

export type AtmospherePreset = "GOLDEN_DUSK" | "SUNNY_DAY" | "NIGHT_HIGH_BEAMS";

/** Which of the 3 pixel-registered master hero plates (day/dusk/night) backs
 * a given preset. Single source of truth shared by DistressHero (which
 * plate to show) and CinematicAtmosphere (which lighting overlay to grade
 * in, and whether the baked-in headlights are lit). */
export type HeroPlate = "day" | "dusk" | "night";

const PLATE_BY_PRESET: Record<AtmospherePreset, HeroPlate> = {
  SUNNY_DAY: "day",
  GOLDEN_DUSK: "dusk",
  NIGHT_HIGH_BEAMS: "night",
};

export function getHeroPlate(preset: AtmospherePreset): HeroPlate {
  return PLATE_BY_PRESET[preset];
}

const REFRESH_MS = 60_000;

/** Lagos (WAT) is a fixed UTC+1 offset year-round — it never observes
 * daylight saving — so the schedule is plain arithmetic on the UTC clock
 * rather than an Intl/timezone-database lookup. */
function resolvePresetFromLagosTime(date: Date): AtmospherePreset {
  const lagosMinutes = ((date.getUTCHours() + 1) * 60 + date.getUTCMinutes()) % (24 * 60);
  if (lagosMinutes >= 390 && lagosMinutes <= 1079) return "SUNNY_DAY"; // 06:30–17:59 WAT
  if (lagosMinutes >= 1080 && lagosMinutes <= 1154) return "GOLDEN_DUSK"; // 18:00–19:14 WAT
  return "NIGHT_HIGH_BEAMS"; // 19:15–06:29 WAT
}

export interface AtmosphereState {
  preset: AtmospherePreset;
}

/** Fully automatic hero lighting state, driven by real Lagos time — no
 * manual override, no user interaction. Starts at a fixed default so
 * server-rendered and first-paint client markup always agree (the clock
 * read happens only inside the effect, never during render), then
 * recomputes on mount and every 60s so the stage silently crosses the
 * day/dusk/night boundaries while the page stays open. */
export function useAtmosphere(): AtmosphereState {
  const [preset, setPreset] = useState<AtmospherePreset>("SUNNY_DAY");

  useEffect(() => {
    const update = () => setPreset(resolvePresetFromLagosTime(new Date()));
    update();
    const id = setInterval(update, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return { preset };
}
