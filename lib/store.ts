import { useSyncExternalStore } from "react";
import {
  SourcingRequest,
  SourcingRequestStatus,
  TrackingLog,
  User,
  Vehicle,
  VehicleStatus,
} from "./types";
import { cloneSeed, SEED_STATE, StoreState, VehicleRecord } from "./seed-data";
import {
  applyAddTrackingLog,
  applyAddVehicle,
  applyCreateShipment,
  applyCreateSourcingRequest,
  applyReserveVehicle,
  applyResetStore,
  applySetVehicleOwner,
  applyUpdateShipment,
  applyUpdateSourcingRequestStatus,
  applyUpdateVehicleStatus,
  computeSnapshot,
  joinVehicle,
  NewSourcingRequestInput,
  NewVehicleInput,
  normalizeSnapshot,
  PublicStoreSnapshot,
  ReservationResult,
  ReserveVehicleBuyer,
  ReserveVehicleOptions,
  StoreAction,
  StoreSnapshot,
  VehicleFilter,
} from "./store-shared";

export type {
  NewSourcingRequestInput,
  NewVehicleInput,
  ReservationResult,
  ReserveVehicleBuyer,
  ReserveVehicleOptions,
  StoreSnapshot,
  VehicleFilter,
};

// Bumped v1 -> v5: the Vehicle shape gained imageResolution, isDistressSale,
// distressPriceNGN, inspectionGallery, and verifiedSpecs. A returning
// browser's v1 cache predates all of these — rather than patch it in place,
// the version bump orphans the old key outright so getState() falls back to
// a fresh cloneSeed() with the current fields. The old key is simply never
// read again; nothing explicitly deletes it (harmless dead localStorage).
const STORAGE_KEY = "modfem.store.v5";

const SEED_VEHICLE_BY_ID = new Map(SEED_STATE.vehicles.map((v) => [v.id, v]));

// Fields added to Vehicle after a browser may have already cached a
// StoreState under the CURRENT storage key (e.g. a vehicle reserved before
// a later field was introduced). For any vehicle that still exists in
// SEED_STATE, a missing field is backfilled from the seed rather than left
// undefined — new admin-added vehicles with no seed counterpart are
// untouched since undefined is the correct value for those.
function mergeVehicleDefaults(vehicle: VehicleRecord): VehicleRecord {
  const seedVehicle = SEED_VEHICLE_BY_ID.get(vehicle.id);
  if (!seedVehicle) return vehicle;
  return {
    ...vehicle,
    imageResolution: vehicle.imageResolution ?? seedVehicle.imageResolution,
    isSampleEstimate: vehicle.isSampleEstimate ?? seedVehicle.isSampleEstimate,
    isDistressSale: vehicle.isDistressSale ?? seedVehicle.isDistressSale,
    distressPriceNGN: vehicle.distressPriceNGN ?? seedVehicle.distressPriceNGN,
    locationStatus: vehicle.locationStatus ?? seedVehicle.locationStatus,
    inspectionGallery: vehicle.inspectionGallery ?? seedVehicle.inspectionGallery,
    verifiedSpecs: vehicle.verifiedSpecs ?? seedVehicle.verifiedSpecs,
  };
}

function readStorage(): StoreState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoreState;
    return {
      ...parsed,
      vehicles: parsed.vehicles.map(mergeVehicleDefaults),
    };
  } catch {
    return null;
  }
}

function writeStorage(state: StoreState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode / quota) — state still works in memory for this session.
  }
}

let memoryState: StoreState | null = null;

function getState(): StoreState {
  if (!memoryState) {
    memoryState = readStorage() ?? cloneSeed();
  }
  return memoryState;
}

const STORE_EVENT = "modfem:store-change";

// Every mutation calls persist() with a BRAND NEW top-level StoreState object
// (never the same reference mutated in place). useSyncExternalStore relies on
// Object.is(prevSnapshot, nextSnapshot) to detect change, so an in-place
// mutation would silently fail to notify subscribers.
function persist(state: StoreState): void {
  memoryState = state;
  writeStorage(state);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

/** Best-effort background sync of a mutation to the server's canonical,
 * file-backed store. The optimistic local write (persist() above) has
 * already happened and already notified subscribers, so a failure here
 * just means this change stays local-only until the next successful sync —
 * it never blocks or breaks the UI.
 *
 * Every admin-mutator function below (updateVehicleStatus, addVehicle, etc.)
 * is only ever called from the already session-gated /admin console; POST
 * /api/store checks that session via its httpOnly cookie, which this
 * same-origin fetch sends automatically — no secret is attached here. */
function postActionToServer(action: StoreAction): void {
  if (typeof window === "undefined") return;
  fetch("/api/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  }).catch(() => {
    // Server unreachable — the local optimistic cache remains the source of truth for now.
  });
}

let hasSyncedWithServer = false;

// SEED_STATE is never mutated by any store function (every mutation builds a
// new object via spread), so this is safe to compute once and reuse forever —
// it is the one value both the server render and the client's first
// hydration pass are guaranteed to agree on, byte for byte.
const SERVER_SNAPSHOT: StoreSnapshot = computeSnapshot(SEED_STATE);

/** True when a snapshot's vehicles are byte-for-byte the untouched seed data
 * — used to detect a cold-started, zero-DB server (e.g. a fresh Vercel
 * lambda with no DATABASE_URL, whose ephemeral /tmp store reset on this cold
 * start) versus one that genuinely has no mutations yet because nobody's
 * made any. Compares vehicles only (never redacted, unlike users/
 * sourcingRequests) so this works the same for an anonymous caller's
 * PublicStoreSnapshot as it does for an admin's full StoreSnapshot. */
function isPristineSnapshot(snapshot: { vehicles: StoreSnapshot["vehicles"] }): boolean {
  try {
    return JSON.stringify(snapshot.vehicles) === JSON.stringify(SERVER_SNAPSHOT.vehicles);
  } catch {
    return false;
  }
}

/** Pulls the canonical server snapshot once per page load and, if reachable,
 * adopts it as the local state — this is what lets a fresh browser (empty
 * localStorage) immediately see mutations made from another browser/device.
 *
 * Guard: if the server comes back pristine (just the seed) while this
 * browser's localStorage already has real mutations, a cold start wiped the
 * server's ephemeral store — adopting its pristine data here would silently
 * erase the local demo state instead. In that case we keep the newer local
 * state and push it back up to the server instead of overwriting it.
 *
 * Known limitation: "pristine" is the only signal available, so a genuine
 * admin "Reset Demo Data" is indistinguishable from an ephemeral cold start
 * — if some OTHER browser still has stale pre-reset mutations cached when it
 * next loads, this guard will push that stale state back up and undo the
 * reset. This is a real risk once DATABASE_URL is configured (a real reset
 * is persistent and meant to stick); against the JSON-file fallback it's
 * moot, since that store is ephemeral by design anyway. Fixing it properly
 * needs a real per-write version/timestamp to compare against, not just
 * snapshot equality — out of scope for now, flagged for whoever adds
 * multi-instance production persistence. */
function syncWithServer(): void {
  if (hasSyncedWithServer || typeof window === "undefined") return;
  hasSyncedWithServer = true;

  const localStateAtSync = getState();
  const localHasMutations = !isPristineSnapshot(computeSnapshot(localStateAtSync));

  fetch("/api/store")
    .then((res) => (res.ok ? res.json() : null))
    .then((data: StoreSnapshot | PublicStoreSnapshot | null) => {
      if (!data || !Array.isArray(data.vehicles) || !Array.isArray(data.users)) {
        return;
      }

      if (localHasMutations && isPristineSnapshot(data)) {
        postActionToServer({ action: "replaceState", state: localStateAtSync });
        return;
      }

      persist(normalizeSnapshot(data));
    })
    .catch(() => {
      // No server reachable — keep running on the local/optimistic cache.
    });
}

// Cached by the referential identity of `state`: as long as persist() keeps
// handing us a fresh object on every real change, this only recomputes once
// per change and returns the exact same object on every unchanged read —
// which is what useSyncExternalStore requires to avoid tearing/re-render loops.
let cachedSnapshot: StoreSnapshot | null = null;
let cachedSnapshotState: StoreState | null = null;

function getClientSnapshot(): StoreSnapshot {
  const state = getState();
  if (!cachedSnapshot || cachedSnapshotState !== state) {
    cachedSnapshot = computeSnapshot(state);
    cachedSnapshotState = state;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): StoreSnapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  syncWithServer();
  window.addEventListener(STORE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(STORE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

/**
 * SSR-safe reactive store snapshot. Server and the first client hydration
 * frame both render the deterministic seed state; once mounted, this
 * resyncs to the real localStorage-backed state, then to the server's
 * canonical state via /api/store, and re-renders on every in-tab mutation
 * (custom event) or cross-tab change (`storage` event).
 */
export function useStoreSnapshot(): StoreSnapshot {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export function useVehicles(): Vehicle[] {
  return useStoreSnapshot().vehicles;
}

export function useSourcingRequests(): SourcingRequest[] {
  return useStoreSnapshot().sourcingRequests;
}

export function getAllVehicles(): Vehicle[] {
  const state = getState();
  return state.vehicles.map((record) => joinVehicle(record, state));
}

export function getVehicleByVinOrId(query: string): Vehicle | undefined {
  const state = getState();
  const normalized = query.trim().toLowerCase();
  const record = state.vehicles.find(
    (v) => v.id.toLowerCase() === normalized || v.vin.toLowerCase() === normalized
  );
  return record ? joinVehicle(record, state) : undefined;
}

export function filterVehicles(filter: VehicleFilter = {}): Vehicle[] {
  return getAllVehicles().filter((vehicle) => {
    if (filter.status && vehicle.status !== filter.status) return false;
    if (filter.make && vehicle.make.toLowerCase() !== filter.make.toLowerCase())
      return false;
    if (
      filter.location &&
      !vehicle.location.toLowerCase().includes(filter.location.toLowerCase())
    )
      return false;
    return true;
  });
}

export function getAllUsers(): User[] {
  return getState().users;
}

export function getUserById(userId: string): User | undefined {
  return getState().users.find((user) => user.id === userId);
}

export function updateVehicleStatus(
  vehicleId: string,
  status: VehicleStatus
): Vehicle | undefined {
  const nextState = applyUpdateVehicleStatus(getState(), vehicleId, status);
  if (!nextState) return undefined;
  persist(nextState);
  postActionToServer({ action: "updateVehicleStatus", vehicleId, status });
  return getVehicleByVinOrId(vehicleId);
}

export function setVehicleOwner(
  vehicleId: string,
  ownerId: string | undefined
): Vehicle | undefined {
  const nextState = applySetVehicleOwner(getState(), vehicleId, ownerId);
  if (!nextState) return undefined;
  persist(nextState);
  return getVehicleByVinOrId(vehicleId);
}

export function addTrackingLog(
  vehicleId: string,
  entry: Omit<TrackingLog, "id" | "vehicleId">
): TrackingLog {
  const { state: nextState, log } = applyAddTrackingLog(getState(), vehicleId, entry);
  persist(nextState);
  postActionToServer({ action: "addTrackingLog", vehicleId, entry, logId: log.id });
  return log;
}

export function updateShipment(
  vehicleId: string,
  updates: Parameters<typeof applyUpdateShipment>[2]
) {
  const result = applyUpdateShipment(getState(), vehicleId, updates);
  if (!result) return undefined;
  persist(result.state);
  postActionToServer({ action: "updateShipment", vehicleId, updates });
  return result.shipment;
}

export function createShipment(
  vehicleId: string,
  shipment: Parameters<typeof applyCreateShipment>[2]
) {
  const { state: nextState, shipment: created } = applyCreateShipment(
    getState(),
    vehicleId,
    shipment
  );
  persist(nextState);
  postActionToServer(
    {
      action: "createShipment",
      vehicleId,
      shipment,
      shipmentId: created.id,
    }
  );
  return created;
}

export function addVehicle(input: NewVehicleInput): Vehicle {
  const { state: nextState, record } = applyAddVehicle(getState(), input);
  persist(nextState);
  postActionToServer({ action: "addVehicle", input, recordId: record.id });
  return joinVehicle(record, nextState);
}

export function resetStore(): void {
  const nextState = applyResetStore();
  persist(nextState);
  postActionToServer({ action: "resetStore" });
}

/**
 * Locks an AVAILABLE vehicle into RESERVED for a buyer: creates (or reuses,
 * by email) a CUSTOMER user, assigns ownership, books an initial shipment
 * at the quoted shipping method/port, and appends the opening tracking
 * milestone. All in one new StoreState so subscribers see a single,
 * consistent update.
 */
export function reserveVehicle(
  vehicleId: string,
  buyer: ReserveVehicleBuyer,
  options: ReserveVehicleOptions
): ReservationResult | undefined {
  const result = applyReserveVehicle(getState(), vehicleId, buyer, options);
  if (!result) return undefined;
  persist(result.state);
  postActionToServer({
    action: "reserveVehicle",
    vehicleId,
    buyer,
    options,
    overrides: {
      bookingReference: result.bookingReference,
      shipmentId: result.shipment.id,
      trackingLogId: result.trackingLog.id,
      newUserId: result.buyer.id,
      timestamp: result.trackingLog.timestamp,
    },
  });
  return {
    vehicle: joinVehicle(
      result.state.vehicles.find((v) => v.id === vehicleId)!,
      result.state
    ),
    buyer: result.buyer,
    shipment: result.shipment,
    trackingLog: result.trackingLog,
    bookingReference: result.bookingReference,
  };
}

export function createSourcingRequest(
  input: NewSourcingRequestInput
): SourcingRequest {
  const { state: nextState, request } = applyCreateSourcingRequest(
    getState(),
    input
  );
  persist(nextState);
  postActionToServer({
    action: "createSourcingRequest",
    input,
    overrides: { id: request.id, createdAt: request.createdAt },
  });
  return request;
}

export function updateSourcingRequestStatus(
  requestId: string,
  status: SourcingRequestStatus
): SourcingRequest | undefined {
  const nextState = applyUpdateSourcingRequestStatus(
    getState(),
    requestId,
    status
  );
  if (!nextState) return undefined;
  persist(nextState);
  postActionToServer({ action: "updateSourcingRequestStatus", requestId, status });
  return nextState.sourcingRequests.find((r) => r.id === requestId);
}
