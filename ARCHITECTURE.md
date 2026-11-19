# Modfem Autos — Architecture

See `PRD.md` for product context and `ARCHITECTURE-ESSENTIALS.md` for the
condensed, non-negotiable rules. This document explains the *why* behind the
structure; the essentials doc is the thing to re-read before every change.

## Stack

Next.js (App Router, Turbopack) + TypeScript (strict) + Tailwind v4 +
framer-motion + lucide-react. See `CLAUDE.md` for the full visual/design
constitution (zero rounded corners, hairline grid structure, monochrome +
single functional accent color, centralized pricing module).

## Data flow: one reducer, two drivers

The entire mutation surface lives in `lib/store-shared.ts` as a set of pure
`apply*` functions plus a `StoreAction` discriminated union and a single
`applyStoreAction(state, action)` dispatcher. Neither persistence driver
reimplements business logic — they just supply a `StoreState` in and take
one out.

### Driver 1 — Prisma (`lib/db.ts`, used when `DATABASE_URL` is set)

Reads the full relational state from Postgres, runs it through
`applyStoreAction`, and writes the whole result back (`deleteMany` +
`createMany` per entity, not targeted upserts — the right tradeoff at this
app's scale of a handful of vehicles/shipments/requests). Nested value
objects with no independent identity (`inspectionGallery`, `verifiedSpecs`)
are stored as Prisma `Json` columns rather than normalized tables.

### Driver 2 — JSON file (`lib/db.ts`, zero-config fallback)

When `DATABASE_URL` is unset, state lives in `data/db.json`, seeded from
`lib/seed-data.ts` on first read. Hardened for serverless: prefers
`os.tmpdir()` on Vercel, falls back further to an in-memory `globalThis`
cache if even that fails, and never throws a 500 — see the comment block at
the top of `lib/db.ts`'s JSON section for the full fallback chain.

### Client store (`lib/store.ts`)

A `useSyncExternalStore`-based reactive store, SSR-safe (`getServerSnapshot`
always returns the deterministic seed snapshot). On mount it layers in:

1. **localStorage** (`STORAGE_KEY`, currently `"modfem.store.v5"`) —
   instant, works offline, but can go stale. **Bump this key's version
   suffix whenever the `Vehicle`/`SourcingRequest` shape gains a field a
   cached browser's JSON predates** — don't try to migrate the cached JSON
   in place. `readStorage()` also runs every loaded vehicle through
   `mergeVehicleDefaults()`, which backfills any of the "added later" fields
   (`imageResolution`, `isSampleEstimate`, `isDistressSale`,
   `distressPriceNGN`, `locationStatus`, `inspectionGallery`,
   `verifiedSpecs`) from the matching `SEED_STATE` vehicle by id whenever
   the cached copy has it `undefined`. New admin-added vehicles have no
   seed counterpart and are left untouched — `undefined` is correct for
   those.
2. **The server's canonical snapshot** via `GET /api/store`, adopted once
   per page load (`syncWithServer()`) — unless the server comes back
   pristine (just-seeded) while local storage already has real mutations,
   in which case the local state is pushed *up* instead of being overwritten
   (guards against a cold-started, ephemeral Vercel lambda wiping a buyer's
   in-progress reservation).

## Security boundary: `POST /api/store`

`app/api/store/route.ts` requires an `x-admin-passcode` header matching
`ADMIN_PASSCODE` (`lib/config.ts`) for every mutating action **except** the
two genuinely buyer-initiated ones: `reserveVehicle` and
`createSourcingRequest`. `lib/store.ts`'s `postActionToServer()` only
attaches that header when called with `{ asAdmin: true }`, and every
admin-mutator function (`updateVehicleStatus`, `addVehicle`, `resetStore`,
etc.) is exclusively called from the already-passcode-gated `/admin`
console — so the header reflects that console's own unlock state, not a
separate auth step. This is a deliberate, documented demo-grade security
model, not real session/token auth — don't represent it as more than it is.

`/admin` itself is never linked from public nav and carries
`robots: { index: false, follow: false }` via `app/admin/layout.tsx`.

## `imageResolution` enforcement

`Vehicle.imageResolution` is `"full" | "thumbnail"` (defaults to `"full"`
when unset — see `ARCHITECTURE-ESSENTIALS.md` for where this is enforced).
`"full"` means a real, inspection-grade photo safe to stretch full-bleed
with interactive hotspot pins. `"thumbnail"` means it was cropped from a
tiny flyer collage cutout and must never be stretched — it renders inside
`TelemetryDossierViewport` (a framed, native-aspect viewport with an honest
"Source Archive // Flyer Capture" caption) everywhere it appears, and the
homepage hero/Next-in-Stock rotation filters thumbnail vehicles out
entirely (`app/page.tsx`).

## Pricing (`lib/pricing.ts`)

`calculateLandedCost()` is the single source of truth for the landed-cost
formula (Base × FX + Freight + Insurance + Nigerian Customs Duty + Port
Clearing, see `CLAUDE.md`). One override: when
`vehicle.isDistressSale && vehicle.distressPriceNGN` is set, the itemized
breakdown is still computed in full for transparency, but `totalNGN` /
`totalCAD` are replaced with the flyer's flat, locked price — a distress
sale's real price is never silently recomputed from a formula.
