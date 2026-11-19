"use client";

import { useState } from "react";
import { CrossX } from "@/components/CrossX";
import { GlidingPill } from "@/components/GlidingPill";
import { TelemetryEyebrow } from "@/components/ui/TelemetryEyebrow";

interface Gate {
  n: string;
  name: string;
  where: string;
  pay: string;
  proof: string;
}

const GATES: Gate[] = [
  {
    n: "01",
    name: "SPEC",
    where:
      "We lock the exact spec, budget ceiling and port of arrival in Vaughan, Ontario — then quote the landed number in ₦ before you move a kobo.",
    pay: "Nothing. Zero commitment at this stage.",
    proof: "Written spec sheet + indicative landed-cost line items on WhatsApp.",
  },
  {
    n: "02",
    name: "INSPECT",
    where:
      "Independent pre-purchase inspection in Ontario: lift, OBD scan, cold-start video, paint depth and full photo set.",
    pay: "Inspection fee only (waived once you proceed).",
    proof: "Inspection video, lift photos, VIN report and fault list.",
  },
  {
    n: "03",
    name: "ACQUIRE",
    where:
      "Purchase, payment handling, title transfer and export paperwork executed under Modfem's Canadian entity.",
    pay: "Agreed purchase price + staged payment structure in writing.",
    proof: "Bill of sale, title/ownership transfer and Canadian tax receipt.",
  },
  {
    n: "04",
    name: "SHIP",
    where:
      "RoRo or container booked from Halifax/Toronto to Tin Can or PTML; vessel tracked door to door.",
    pay: "Freight, marine insurance and export handling.",
    proof: "Bill of Lading, vessel name, tracking link and ETA.",
  },
  {
    n: "05",
    name: "DELIVER",
    where:
      "Age-tiered Customs duty assessed, Tin Can clearing completed and the unit released to you in Lagos.",
    pay: "Nigerian Customs duty + clearing, then hand-over.",
    proof: "Customs assessment sheet, clearing release and hand-over photos.",
  },
];

const GATE_SEQUENCE_WORDS = ["Spec", "Inspect", "Acquire", "Ship", "Deliver"];

/** The 5-stage gear-shift process gate, ported verbatim from
 * reference-arena.html's `.gear` track + `.stage-cell`-style readout —
 * hover or tap a gate stage to light its telemetry readout. */
export function ProcessGate() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = GATES[activeIndex];

  return (
    <section className="relative overflow-hidden bg-[#0A0B0E] border-t border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
        <div className="max-w-3xl">
          <TelemetryEyebrow category="Transmission" spec="5-Stage Shift Gate" />
          <h2 className="mt-3 text-3xl font-bold leading-[1.06] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {GATE_SEQUENCE_WORDS.map((word, index) => (
              <span key={word}>
                {index > 0 && <span className="text-emerald-500/80"> &rarr; </span>}
                {word}
              </span>
            ))}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/60">
            Hover or tap a gate stage. Each position lights its telemetry readout:
            what we do in Ontario, what you pay at that exact milestone, and the
            proof that lands on your WhatsApp before we shift to the next stage.
          </p>
        </div>

        <div className="mt-10">
          <div className="cross relative overflow-x-auto rounded-2xl border border-white/12 bg-[#101216] p-4 sm:p-7">
            <CrossX />
            <div className="relative min-w-[720px]">
              <div className="absolute left-0 right-0 top-[46px] h-px bg-gradient-to-r from-white/10 via-white/25 to-white/10" />
              <div className="relative flex justify-between gap-2">
                {GATES.map((gate, index) => {
                  const active = index === activeIndex;
                  return (
                    <button
                      key={gate.n}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`gear${active ? " active" : ""}`}
                    >
                      {/* The `.gear.active` CSS modifier (globals.css) still
                          drives the instant background wash and the dot/gnum/
                          gname descendant-selector color changes — this pill
                          only adds the animated glow ring gliding between
                          cells, layered separately so it never doubles up
                          with `.active`'s own flat background fill. */}
                      {active && (
                        <GlidingPill
                          layoutId="process-gate-pill"
                          className="rounded-xl shadow-[0_0_0_1px_rgba(16,185,129,0.45),0_12px_34px_-18px_rgba(16,185,129,0.8)]"
                        />
                      )}
                      <span className="relative z-10 dot" />
                      <span className="relative z-10 gnum">{gate.n}</span>
                      <span className="relative z-10 gname">{gate.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {[
              { heading: "WHAT MODFEM DOES IN ONTARIO", body: active.where, accent: false },
              { heading: "WHAT YOU PAY AT THIS MILESTONE", body: active.pay, accent: false },
              { heading: "VERIFICATION PROOF SENT TO WHATSAPP", body: active.proof, accent: true },
            ].map((cell) => (
              <div
                key={cell.heading}
                className="cross relative rounded-2xl border border-white/12 bg-[#101216] p-5"
              >
                <CrossX />
                <p
                  className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
                    cell.accent ? "text-emerald-400" : "text-white/40"
                  }`}
                >
                  {cell.heading}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-white/75">{cell.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
