"use client";

import Image from "next/image";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";
import { TelemetryEyebrow } from "@/components/ui/TelemetryEyebrow";

const GENERAL_INQUIRY_MESSAGE =
  "Hi Modfem, I'd like to talk about sourcing a car from Canada to Nigeria.";

const PILLARS: { title: string; description: string }[] = [
  {
    title: "Car Sourcing",
    description:
      "Ontario auctions, dealer trade-ins and private lots matched to your budget.",
  },
  {
    title: "Thorough Pre-Purchase Inspection",
    description: "Lift, OBD and cold-start video before a cent is committed.",
  },
  {
    title: "Purchase & Paperwork Support",
    description: "Title, safety, export documents and Canadian tax handling.",
  },
  {
    title: "RoRo & Container Shipping",
    description:
      "Bill of Lading, vessel tracking and port-side clearing at Tin Can / PTML.",
  },
  {
    title: "Car Upgrading & Swapping",
    description:
      "Trade what you drive now toward something better. Same You. A Better Ride!",
  },
  {
    title: "Flexible Financing Support",
    description: "Staged payment structures agreed in writing before shipment.",
  },
];

/** Full-width alabaster editorial spread — ported verbatim from
 * reference-arena.html's `#operator` section (12-col grid, Instrument Serif
 * headline, 6-pillar accountability list, direct-contact dossier card).
 * Deliberately breaks from the dark cockpit palette used everywhere else:
 * this is the one place the operator himself, not a vehicle, is the subject. */
export function EditorialDealerSignoff() {
  return (
    <section className="w-full bg-[#EAEAEA] text-[#111111]">
      <div className="relative mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          {/* LEFT 7 — overhead studio visual */}
          <div className="relative h-full lg:col-span-7">
            <div className="relative aspect-[4/5] w-full h-full overflow-hidden bg-[#EAEAEA] lg:aspect-auto">
              <Image
                src="/images/modfem-editorial-overhead.webp"
                alt={`${SITE_CONFIG.operatorName} — Modfem & Co. overhead studio portrait`}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "15% 40%" }}
              />
              <div className="absolute right-4 top-4 font-mono text-[9.5px] tracking-[0.2em] text-[#111111]/55">
                STUDIO · OVERHEAD · 01
              </div>
            </div>
          </div>

          {/* RIGHT 5 — operator dossier */}
          <div className="flex h-full flex-col justify-between lg:col-span-5">
            <div>
              <TelemetryEyebrow
                category="Direct Operator Accountability"
                spec="Vaughan, Ontario → Lagos, Nigeria"
                variant="light"
              />

              <h2 className="mt-3 font-serif text-2xl font-normal leading-[1.25] tracking-[-0.01em] text-[#111111] sm:text-3xl lg:text-[32px]">
                &ldquo;Every vehicle on this platform passes through my own hands before
                it reaches yours — sourced, inspected, and shipped personally, not
                resold through a broker chain.&rdquo;
              </h2>

              <p className="mt-4 text-xs font-medium tracking-tight text-[#111111]/80 sm:text-sm">
                Modupe, Founder &mdash; Modfem Autos Canada
              </p>

              <div className="mt-8 border-t border-[#111111]/15">
                <div className="grid grid-cols-1 divide-y divide-[#111111]/12 sm:grid-cols-2 lg:grid-cols-1 lg:divide-y-0 lg:[&>*:not(:first-child)]:border-t lg:[&>*:not(:first-child)]:border-[#111111]/12">
                  {PILLARS.map((pillar, index) => (
                    <div key={pillar.title} className="flex items-baseline gap-4 py-3.5">
                      <span className="w-6 font-mono text-[10.5px] text-[#111111]/45">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-[15px] font-semibold">{pillar.title}</p>
                        <p className="text-[13px] text-[#111111]/60">{pillar.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 border border-[#111111]/20 bg-white/60 p-8 lg:mt-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#111111]/55">
                Direct Contact
              </p>
              <dl className="mt-3 divide-y divide-[#111111]/12 font-mono text-[12.5px]">
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-[#111111]/55">Canadian WhatsApp</dt>
                  <dd className="tnum font-bold">{SITE_CONFIG.whatsappCanadaDisplay}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-[#111111]/55">Nigerian WhatsApp</dt>
                  <dd className="tnum font-bold">
                    {SITE_CONFIG.whatsappNigeriaDisplay}{" "}
                    <span className="text-[#B45309]">[VERIFY]</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-[#111111]/55">Email</dt>
                  <dd className="break-all font-bold">{SITE_CONFIG.email}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-[#111111]/55">Operating Base</dt>
                  <dd className="text-right font-bold">{SITE_CONFIG.location}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-[#111111]/55">Lagos Hub</dt>
                  <dd className="text-right font-bold">Tin Can / PTML &amp; Mainland</dd>
                </div>
              </dl>
              <a
                href={getWhatsAppUrl(GENERAL_INQUIRY_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-6 text-sm font-semibold text-white transition hover:bg-black"
              >
                Message Modfem on WhatsApp ({SITE_CONFIG.whatsappCanadaDisplay}) &#8599;
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
