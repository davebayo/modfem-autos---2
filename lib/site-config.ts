/**
 * Centralized, quarantined source of truth for real operator/business
 * details pulled from Modfem's WhatsApp flyers and statuses.
 * Every `TODO(UNCLE-VERIFY)` below must be confirmed with him before launch.
 */

export const IS_DEMO_MODE = true;

export const SITE_CONFIG = {
  operatorName: "Modupe", // TODO(UNCLE-VERIFY): Confirm full legal surname to display
  businessName: "Modfem Autos Canada",
  location: "Vaughan, Ontario, Canada",

  whatsappCanada: "+14377765303",
  whatsappCanadaDisplay: "+1 (437) 776-5303",

  // TODO(UNCLE-VERIFY): Flyer shows 10 digits (+234 807 42961) instead of the
  // 11 digits a Nigerian mobile number requires. Confirm the missing digit.
  // Until verified, treat whatsappCanada as the primary wa.me target.
  whatsappNigeria: "+23480742961",
  whatsappNigeriaDisplay: "+234 807 42961",

  email: "Modfemtidings@yahoo.com", // TODO(UNCLE-VERIFY): Upgrade to a custom-domain email before launch

  registrationNumber: "ON-PENDING-VERIFY", // TODO(UNCLE-VERIFY): Confirm Ontario business registration / OMVIC status

  services: [
    "Car Sourcing",
    "Pre-Purchase Inspection",
    "Purchase Support",
    "Shipping to Nigeria (RoRo & Container)",
    "Car Swapping & Upgrading",
    "Financing Support",
  ],

  // Short form used in telemetry-style UI labels (e.g. "ORIGIN: VAUGHAN, ON").
  originShort: "VAUGHAN, ON",
} as const;

/**
 * Builds a wa.me deep link to the primary (Canada) WhatsApp line with a
 * prefilled, context-specific message.
 */
export function getWhatsAppUrl(message: string): string {
  const digits = SITE_CONFIG.whatsappCanada.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a wa.me deep link prefilled with a vehicle-specific availability
 * inquiry — the primary CTA on vehicle cards and the landed-cost drawer.
 */
export function getVehicleInquiryUrl(
  vehicleName: string,
  landedLabel: string
): string {
  return getWhatsAppUrl(
    `Hi Modfem, I saw the ${vehicleName} (${landedLabel} landed) on Modfem Autos and want to confirm availability.`
  );
}
