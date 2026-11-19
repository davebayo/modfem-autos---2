/**
 * Translucent Apple Glass Pill & Spatial Frosted UI — the site-wide design
 * system (see CLAUDE.md / ARCHITECTURE-ESSENTIALS.md). Centralized here so
 * every pill/badge/card across the app shares the exact same tokens rather
 * than drifting copies of the same long className string.
 */

export const GLASS_PILL =
  "rounded-full backdrop-blur-2xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-[0.98] border border-white/[0.16] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300";

// Heavy-duty "Pagani/Rimac darkroom" card: a near-opaque charcoal slab
// (rather than a barely-tinted overlay) with a sharp specular top edge, a
// deep contact shadow, and an emerald border-glow + lighten response on
// hover so cards read as tactile, lit surfaces rather than flat panels.
export const GLASS_CARD =
  "rounded-3xl backdrop-blur-2xl bg-[rgba(20,22,28,0.65)] border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-emerald-500/40 hover:bg-[rgba(32,35,43,0.72)]";

/** Light-surface variant of GLASS_PILL for white/alabaster panels (e.g. the
 * LandedCostDrawer, LagosInspectionModal's light sections). */
export const GLASS_PILL_LIGHT =
  "rounded-full backdrop-blur-2xl bg-zinc-950/[0.04] hover:bg-zinc-950/[0.08] active:scale-[0.98] border border-zinc-950/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300";

/** Light-surface variant of GLASS_CARD for white/alabaster card panels
 * (e.g. the LandedCostDrawer's confirmed-phase panel, the request page's
 * results card, /track's ManifestCard). */
export const GLASS_CARD_LIGHT =
  "rounded-3xl backdrop-blur-2xl bg-white/95 border border-zinc-950/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_20px_50px_rgba(0,0,0,0.25)]";

/** Darker, more opaque chrome for persistent navigation surfaces (TopNav's
 * floating header pill, NavigationDrawer's panel) — same glass language,
 * tuned more opaque than GLASS_PILL/GLASS_CARD so nav furniture reads above
 * every hero/weather treatment behind it. Pair with `rounded-full` or
 * `rounded-3xl` depending on shape. */
export const GLASS_NAV =
  "backdrop-blur-2xl bg-black/50 border border-white/[0.14] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_12px_40px_rgba(0,0,0,0.45)]";
