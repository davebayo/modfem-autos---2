# Modfem Autos — Product Requirements Document

## What this is

Modfem Autos Canada is a direct-to-buyer vehicle sourcing, upgrade/swap, and
import platform connecting Canadian vehicle supply to Nigerian buyers.
Operated by Modfem out of **Vaughan, Ontario**, with a parallel **Lagos-side
distress-sale and pickup operation** for units that have already landed and
cleared customs. There is no dealership showroom and no call center — every
transaction funnels through one real person on WhatsApp.

This is a one-operator business represented by a platform. The product's job
is to make that single operator's real inventory, real pricing, and real
process legible and trustworthy to a skeptical buyer who has likely been
burned by fake "agent" listings before.

## The core trust problem

Nigerian import buyers are conditioned to distrust online car listings —
stock photos standing in for cars that don't exist, landed-cost numbers that
balloon after a deposit is paid, "agents" who disappear. Every product
decision here is downstream of one goal: **make the gap between what's shown
and what's real as small and as visible as possible.**

### Dual-Layer Visual Truth

The platform runs two visual layers deliberately, not duplicatively:

1. **The facade layer** — scenic/studio hero photography (e.g. the Mercedes
   GLA on a misty highway, the overhead "Modfem & Co." studio editorial)
   that gives the brand the polish a first-time visitor expects from a
   serious operator.
2. **The evidence layer** — unedited, lower-production-value Lagos
   inspection photos and flyer-sourced vehicle photography, pulled directly
   from Modfem's own WhatsApp status and flyers, never stock photography.

The facade earns attention; the evidence earns the deposit. Every vehicle
detail view must surface both — see `imageResolution` and
`inspectionGallery` in `ARCHITECTURE.md`. A vehicle is never allowed to show
*only* the facade layer with no real photo backing it.

## Primary KPI

**WhatsApp conversations started with Modfem's real Canadian line,
`+14377765303`.** Every other metric (page views, drawer opens, sourcing
mandates submitted) is a leading indicator toward this one. If a feature
doesn't make a qualified buyer more likely to message that number with
real intent, it's not load-bearing.

## The four buyer flows

1. **Lagos Distress Sale claim.** A unit that has already landed, cleared
   customs, and is sitting for pickup in Lagos at a flat, locked price
   (e.g. the 2016 GLA250 at ₦19,000,000 — see `isDistressSale` /
   `distressPriceNGN`). No landed-cost calculator is needed here, because
   there's nothing left to compute — the number on the flyer is the number
   the buyer pays. The product's job is just to make that number and the
   pickup status unmistakable, and route the buyer to WhatsApp fast.
2. **Canadian Sourcing request.** A buyer with a Lagos budget and a target
   make/model submits a mandate (`/request`, Mode 01). The platform reverses
   the landed-cost formula to show the maximum Canadian auction bid their
   budget supports, then dispatches the mandate to Modfem.
3. **Car Upgrade / Swap trade-in.** Modfem's own flyer-stated signature
   service — a buyer trades an existing vehicle toward a better one
   (`/request`, Mode 02). Captures the buyer's current vehicle (year, make,
   model, condition) alongside the target spec.
4. **VREG / VIN telemetry tracking.** A buyer with an active consignment
   checks real-time shipment/customs status on `/track`, with an explicit
   nudge toward independently verifying the VIN and customs status via
   Nigeria's official VREG portal (`vreg.gov.ng`) rather than taking the
   platform's word for it.

## Non-goals

- This is not a multi-dealer marketplace. There is one operator and one
  inventory.
- This is not a financing or escrow product — WhatsApp and direct payment
  arrangement with Modfem close every transaction; the platform's job ends
  at a well-formed, high-intent WhatsApp handoff.
- Polish should never outrun honesty. See `ARCHITECTURE-ESSENTIALS.md` for
  the hard rules that enforce this (e.g. thumbnail-resolution photos are
  banned from full-bleed hero treatment, `isSampleEstimate`/`[Verify]`
  badges are mandatory on unconfirmed data).
