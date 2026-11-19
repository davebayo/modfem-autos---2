"use client";

import { useState } from "react";
import { useVehicles } from "@/lib/store";
import { GridOverlay } from "@/components/GridOverlay";
import { IgnitionPreloader } from "@/components/IgnitionPreloader";
import { DistressHero } from "@/components/DistressHero";
import { BottomFooter } from "@/components/BottomFooter";
import { LandedCostDrawer } from "@/components/LandedCostDrawer";
import { NavigationDrawer } from "@/components/NavigationDrawer";
import { ProcessGate } from "@/components/ProcessGate";
import { EditorialDealerSignoff } from "@/components/EditorialDealerSignoff";

export default function Home() {
  const allVehicles = useVehicles();
  // The hero is dedicated exclusively to the Lagos distress-sale flagship
  // (Vehicle #1) — fall back to the first full-res vehicle if that unit
  // somehow isn't in the current catalog.
  const fullResVehicles = allVehicles.filter(
    (vehicle) => vehicle.imageResolution !== "thumbnail"
  );
  const candidates = fullResVehicles.length > 0 ? fullResVehicles : allVehicles;
  const vehicle =
    candidates.find((v) => v.isDistressSale) ?? candidates[0] ?? allVehicles[0];

  const [ignitionComplete, setIgnitionComplete] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!vehicle) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  return (
    <div className="relative w-full bg-zinc-950 text-white">
      <IgnitionPreloader
        onComplete={() => setIgnitionComplete(true)}
        replayKey={replayKey}
      />

      <div className="relative">
        <GridOverlay />
        <DistressHero
          vehicle={vehicle}
          onOpenLandedCostDrawer={() => setDrawerOpen(true)}
          ignitionComplete={ignitionComplete}
        />
      </div>

      <ProcessGate />
      <EditorialDealerSignoff />

      <BottomFooter
        onOpenMenu={() => setMenuOpen(true)}
        onReplayIgnition={() => {
          setIgnitionComplete(false);
          setReplayKey((prev) => prev + 1);
        }}
      />

      <LandedCostDrawer
        vehicle={vehicle}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <NavigationDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
