# Architecture Essentials — Read This First

One page. These are hard invariants, not style preferences. If a change
would violate one of these, the change is wrong — fix the change, not this
list. Full reasoning lives in `ARCHITECTURE.md`; product context lives in
`PRD.md`.

1. **Currency glyphs are always literal.** Naira is always the literal `₦`
   character (or `&#8358;` if an HTML entity is unavoidable) — **never**
   `&#8362;` (that's the Israeli Shekel, a transcription bug that has
   recurred in this codebase before). CAD amounts always go through
   `formatCAD()`; NGN amounts always go through `formatNGN()` /
   `formatNGNCompact()` in `lib/pricing.ts`. Never hand-format currency
   inline.

2. **`imageResolution === "thumbnail"` never renders full-bleed.** It never
   gets stretched across a full-screen hero, a full-bleed card, or sits
   under interactive inspection hotspot pins. It always renders inside a
   framed, native-aspect viewport (`TelemetryDossierViewport`). The
   homepage hero/Next-in-Stock rotation (`app/page.tsx`) filters thumbnail
   vehicles out entirely — they only ever appear in `/inventory`.

3. **`/admin` is never in public nav, never linked from any buyer-facing
   page, and never indexed.** It stays passcode-gated
   (`x-admin-passcode` / `ADMIN_PASSCODE`) and `noindex`. Don't add a nav
   link, a footer link, or a sitemap entry for it.

4. **All contact and business constants live in `lib/site-config.ts`.**
   WhatsApp numbers, operator name, business name, location, services list
   — one source of truth, read everywhere else. Never hardcode a phone
   number or re-type the business name inline in a component.

5. **A locked distress-sale price is never recomputed.** If
   `vehicle.isDistressSale && vehicle.distressPriceNGN` is set,
   `calculateLandedCost()` must return that exact figure as the total —
   full itemized breakdown still shown for transparency, but the bottom
   line is the flyer's real number, not a formula's guess.

6. **Every unconfirmed figure is flagged, not silently presented as fact.**
   `isSampleEstimate: true` + a `MonroneyBadge` ("[Verify] Indicative
   Estimate") in the UI, plus a `TODO(UNCLE-VERIFY)` comment in the source
   naming exactly what needs confirming. Don't invent a plausible-looking
   number and ship it unflagged.

7. **Bump the localStorage key, don't migrate it in place.** Whenever
   `Vehicle` or `SourcingRequest` gains a field a cached browser predates,
   bump the version suffix on `STORAGE_KEY` in `lib/store.ts` (e.g.
   `v4` → `v5`). Don't write migration logic for the old key's shape — let
   it go stale and `mergeVehicleDefaults()` backfill from `SEED_STATE` for
   anything still missing under the new key.

8. **Every pill/badge/card uses the shared glass tokens, not an arbitrary
   rounded corner.** Import `GLASS_PILL` / `GLASS_CARD` / `GLASS_PILL_LIGHT` /
   `GLASS_NAV` from `lib/glass-tokens.ts` — pills are `rounded-full`, cards are
   `rounded-3xl`, both with `backdrop-blur-2xl` and the inset specular
   highlight. `GLASS_NAV` is the darker `bg-black/50` variant reserved for
   `TopNav`/`NavigationDrawer` so persistent nav chrome stays legible over
   the hero imagery. (This replaced a "zero rounded corners" rule in Surgical
   Step 9 — the constitution changed, don't revert toward the old one.)
   One functional accent color stays (emerald, for WhatsApp CTAs and
   status). See `CLAUDE.md` for the full visual constitution.
