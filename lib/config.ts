// Centralized environment-driven configuration. Next.js inlines
// NEXT_PUBLIC_* values into BOTH client and server code at build time, so
// they must be present when the build runs (on Cloudflare Workers Builds:
// the project's Build variables) — setting them only at runtime has no
// effect. The dealer's WhatsApp number lives in lib/site-config.ts.

// Fallback CAD -> NGN exchange rate used whenever /api/fx is unreachable.
export const DEFAULT_FX_RATE_NGN_PER_CAD =
  Number(process.env.NEXT_PUBLIC_DEFAULT_FX_RATE) || 1180;

// The /admin console's passcode lives server-only as ADMIN_SECRET (see
// lib/admin-auth.ts) — never NEXT_PUBLIC_*, since that would ship it to
// every browser's JS bundle.
