import { VehicleStatus } from "./types";

export const ANNOUNCEMENTS = [
  "Based in Vaughan, Ontario — Direct Vehicle Sourcing & Shipping to Lagos",
  "Transparent Landed-Cost Breakdowns: Pre-Purchase Inspection, Shipping & Clearing",
];

const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: "Available to Source",
  RESERVED: "Reserved for Client",
  IN_TRANSIT: "In Transit to Lagos",
  CLEARING: "Clearing at Port",
  DELIVERED: "Delivered in Nigeria",
};

export function formatVehicleStatus(status: VehicleStatus): string {
  return VEHICLE_STATUS_LABELS[status];
}
