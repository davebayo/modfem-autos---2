// Server-only admin session helpers — never import this from a "use client"
// file, since ADMIN_SECRET must never reach the browser bundle. Both the
// login API route and middleware.ts (Edge runtime) call into this module, so
// it sticks to Web Crypto (crypto.subtle) rather than Node's crypto module.

export const ADMIN_SESSION_COOKIE = "modfem_admin_session";

function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Checks a passcode a user typed into the login form against the server-only
 * secret. Never logs or echoes the secret back. */
export async function verifyAdminPasscode(passcode: string): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;
  return timingSafeEqual(passcode, secret);
}

/** The session cookie's value is a deterministic hash of the server secret —
 * stateless (no session store needed) since only the server can compute it,
 * and it never embeds the raw secret itself. */
export async function createAdminSessionToken(): Promise<string | null> {
  const secret = getAdminSecret();
  if (!secret) return null;
  return sha256Hex(secret);
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const expected = await createAdminSessionToken();
  if (!expected) return false;
  return timingSafeEqual(token, expected);
}

/** Route Handlers receive a plain Request (no .cookies helper), so parse the
 * raw Cookie header manually. */
export function readCookieFromHeader(
  cookieHeader: string | null,
  name: string
): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}
