"use client";

import { useState } from "react";
import { TelemetrySlash } from "@/components/ui/TelemetryEyebrow";

interface Hotspot {
  id: string;
  top: string;
  left: string;
  code: string;
  description: string;
}

const HOTSPOTS: Hotspot[] = [
  { id: "powertrain", top: "60%", left: "24%", code: "01", description: "POWERTRAIN VERIFIED IN ONTARIO" },
  { id: "title", top: "38%", left: "70%", code: "02", description: "CLEAN CANADIAN TITLE HISTORY" },
  { id: "duty", top: "80%", left: "78%", code: "03", description: "LANDED DUTY INCLUDED IN ESTIMATE" },
];

/** Toggleable inspection checkpoint pins overlaid on a vehicle photo,
 * matching reference-arena.html's `.hot` pin treatment (circular numbered
 * badge, expands into a label on hover or tap). Container must be
 * `position: relative`. */
export function InspectionHotspots() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="absolute inset-0">
      {HOTSPOTS.map((spot, index) => (
        <button
          key={spot.id}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setOpenId((prev) => (prev === spot.id ? null : spot.id));
          }}
          aria-label={`Inspection checkpoint ${spot.code}`}
          className={`hot${openId === spot.id ? " open" : ""}${index === 1 ? " flip" : ""}`}
          style={{ top: spot.top, left: spot.left }}
        >
          <span className="num">{spot.code}</span>
          <span className="lbl">
            {spot.code}
            <TelemetrySlash />
            {spot.description}
          </span>
        </button>
      ))}
    </div>
  );
}
