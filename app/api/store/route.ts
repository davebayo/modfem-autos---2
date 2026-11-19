import { NextResponse } from "next/server";
import { applyStoreActionPersisted, getStoreState } from "@/lib/db";
import { computeSnapshot, redactSnapshotForPublic, StoreAction } from "@/lib/store-shared";
import {
  ADMIN_SESSION_COOKIE,
  readCookieFromHeader,
  verifyAdminSessionToken,
} from "@/lib/admin-auth";

const VALID_ACTIONS = new Set<StoreAction["action"]>([
  "updateVehicleStatus",
  "addVehicle",
  "addTrackingLog",
  "updateShipment",
  "createShipment",
  "reserveVehicle",
  "createSourcingRequest",
  "updateSourcingRequestStatus",
  "resetStore",
  "replaceState",
]);

/** Actions a buyer can trigger directly against their own data — booking a
 * specific vehicle, submitting a sourcing mandate. Every other action
 * mutates shared dealer-side state (inventory, shipments, status, or a
 * wholesale state replace) and requires the admin passcode. */
const CUSTOMER_ACTIONS = new Set<StoreAction["action"]>([
  "reserveVehicle",
  "createSourcingRequest",
]);

async function isAuthorizedAdmin(request: Request): Promise<boolean> {
  const token = readCookieFromHeader(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);
  return verifyAdminSessionToken(token);
}

export async function GET(request: Request) {
  const state = await getStoreState();
  const snapshot = computeSnapshot(state);
  if (await isAuthorizedAdmin(request)) {
    return NextResponse.json(snapshot);
  }
  return NextResponse.json(redactSnapshotForPublic(snapshot));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("action" in body) ||
    typeof (body as { action: unknown }).action !== "string" ||
    !VALID_ACTIONS.has((body as { action: StoreAction["action"] }).action)
  ) {
    return NextResponse.json({ error: "Unknown or missing action." }, { status: 400 });
  }

  const action = body as StoreAction;
  const isAdmin = await isAuthorizedAdmin(request);

  if (!CUSTOMER_ACTIONS.has(action.action) && !isAdmin) {
    return NextResponse.json(
      { error: "Admin authorization required." },
      { status: 401 }
    );
  }

  if (action.action === "replaceState") {
    const s = action.state;
    const hasValidShape =
      s &&
      typeof s === "object" &&
      Array.isArray(s.vehicles) &&
      Array.isArray(s.users) &&
      Array.isArray(s.shipments) &&
      Array.isArray(s.trackingLogs) &&
      Array.isArray(s.sourcingRequests);
    if (!hasValidShape) {
      return NextResponse.json({ error: "Invalid state payload." }, { status: 400 });
    }
  }

  const nextState = await applyStoreActionPersisted(action);
  const snapshot = computeSnapshot(nextState);
  return NextResponse.json(isAdmin ? snapshot : redactSnapshotForPublic(snapshot));
}
