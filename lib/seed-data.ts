import {
  Shipment,
  SourcingRequest,
  TrackingLog,
  User,
  Vehicle,
} from "./types";

export type VehicleRecord = Omit<Vehicle, "shipment" | "trackingLogs">;

export interface StoreState {
  users: User[];
  vehicles: VehicleRecord[];
  shipments: Shipment[];
  trackingLogs: TrackingLog[];
  sourcingRequests: SourcingRequest[];
}

export const SEED_USERS: User[] = [
  {
    id: "user-admin-1",
    name: "Ada Okafor",
    email: "ada.okafor@modfemautos.africa",
    role: "ADMIN",
  },
  {
    id: "user-customer-1",
    name: "Tunde Balogun",
    email: "tunde.balogun@example.com",
    role: "CUSTOMER",
  },
];

export const SEED_VEHICLES: VehicleRecord[] = [
  {
    // Real unit from Modfem's 2026-11-02 WhatsApp distress-sale flyer —
    // already landed, duty-paid, and sitting in Lagos. The flyer quotes a
    // flat ₦19,000,000 pickup price directly (not a Canada-sourcing
    // estimate), so calculateLandedCost() returns distressPriceNGN exactly
    // via its isDistressSale branch rather than computing one from
    // basePriceCAD — basePriceCAD below is only a back-solved reference
    // figure so the itemized breakdown still reads as internally consistent.
    id: "mercedes-gla250-4matic",
    vin: "WDCTG4GB0FJ123456", // TODO(UNCLE-VERIFY): Placeholder VIN — confirm real VIN
    name: "2016 Mercedes-Benz GLA250 4MATIC",
    year: 2016,
    make: "Mercedes-Benz",
    model: "GLA250 4MATIC",
    basePriceCAD: 9_470, // Back-solved reference only — see note above
    location: "Lagos, Nigeria",
    locationStatus: "AVAILABLE FOR PICK UP IN LAGOS",
    status: "DELIVERED",
    isSampleEstimate: false,
    isDistressSale: true,
    distressPriceNGN: 19_000_000,
    imageResolution: "full",
    specs: {
      engine: "2.0L Turbocharged 4-Cylinder",
      mileageKm: 98_000, // TODO(UNCLE-VERIFY): Odometer not stated on the flyer
      drivetrain: "4MATIC All-Wheel Drive (AWD)",
      exteriorColor: "Black",
    },
    verifiedSpecs: {
      engine: "2.0L Turbocharged 4-Cylinder",
      horsepower: "211 HP",
      transmission: "7-Speed Dual-Clutch (7G-DCT)",
      drivetrain: "4MATIC All-Wheel Drive (AWD)",
      features: [
        "Infotainment Display with Navigation",
        "Reverse Camera",
        "Premium Leather Seats",
        "Panoramic Sunroof",
        "Dual-Zone Climate Control",
        "Advanced Safety (Airbags, ABS, ESP, Brake Assist)",
      ],
    },
    // Real, unedited Lagos inspection photos cropped from Modfem's
    // 2026-11-02 distress-sale flyer — the "Dual-Layer Visual Truth"
    // evidence layer backing the polished hero/stage imagery.
    inspectionGallery: [
      { url: "/images/cars/mercedes-gla-front.webp", label: "Front Three-Quarter View" },
      { url: "/images/cars/gla/gla-cockpit.webp", label: "Cockpit & Dashboard" },
      { url: "/images/cars/gla/gla-engine.webp", label: "2.0L Turbo Engine Bay" },
      { url: "/images/cars/gla/gla-trunk.webp", label: "Open Trunk" },
      { url: "/images/cars/gla/gla-rear-cabin.webp", label: "Rear Leather Seats" },
      { url: "/images/cars/gla/gla-side-lagos.webp", label: "Lagos Street Side Profile" },
    ],
    frontImageUrl: "/images/cars/mercedes-gla-front.webp",
    rearImageUrl: "/images/cars/mercedes-gla-front.webp",
    thumbnailUrl: "/images/cars/mercedes-gla-front.webp",
  },
  {
    // Real unit from Modfem's WhatsApp status. basePriceCAD below is
    // back-solved through calculateLandedCost() (RoRo, Tin Can Island, the
    // default FX rate) to reproduce his flyer's landed price of ~₦11.5M —
    // the landed figure itself is still derived at render time, never
    // hand-entered, per the pricing-module rule in CLAUDE.md.
    id: "kia-sportage-2013-upgraded",
    vin: "KNDPB3AC4D7123456", // TODO(UNCLE-VERIFY): Placeholder VIN — confirm real VIN
    name: "2013 Kia Sportage (Upgraded)",
    year: 2013,
    make: "Kia",
    model: "Sportage",
    basePriceCAD: 4_630, // Back-solved to match flyer: "2013 upgraded kia sportage just for 11.5m shipping & clearing included"
    location: "Vaughan, Ontario, Canada",
    status: "AVAILABLE",
    isSampleEstimate: false,
    imageResolution: "full",
    specs: {
      engine: "2.4L Inline-4",
      mileageKm: 120_000, // TODO(UNCLE-VERIFY): Odometer not shown on the flyer
      drivetrain: "AWD",
      exteriorColor: "White",
    },
    frontImageUrl: "/images/cars/kia-sportage-front.webp",
    rearImageUrl: "/images/cars/kia-sportage-side.webp",
    thumbnailUrl: "/images/cars/kia-sportage-front.webp",
  },
  {
    // TODO(UNCLE-VERIFY): Cropped from the 6-car grid flyer thumbnail — low
    // resolution. All specs below are placeholder estimates.
    id: "toyota-camry-se",
    vin: "4T1BF1FK0HU123456",
    name: "Toyota Camry SE",
    year: 2017,
    make: "Toyota",
    model: "Camry SE",
    basePriceCAD: 14_500,
    location: "Vaughan, Ontario, Canada",
    status: "AVAILABLE",
    isSampleEstimate: true,
    imageResolution: "thumbnail",
    specs: {
      engine: "2.5L Inline-4",
      mileageKm: 110_000,
      drivetrain: "FWD",
      exteriorColor: "Silver",
    },
    frontImageUrl: "/images/cars/toyota-camry.webp",
    rearImageUrl: "/images/cars/toyota-camry.webp",
    thumbnailUrl: "/images/cars/toyota-camry.webp",
  },
  {
    // TODO(UNCLE-VERIFY): Cropped from the 6-car grid flyer thumbnail — low
    // resolution. All specs below are placeholder estimates.
    id: "lexus-rx-350",
    vin: "2T2BZMCA0JC123456",
    name: "Lexus RX 350",
    year: 2018,
    make: "Lexus",
    model: "RX 350",
    basePriceCAD: 24_800,
    location: "Tin Can Island Port, Lagos",
    status: "CLEARING",
    isSampleEstimate: true,
    imageResolution: "thumbnail",
    specs: {
      engine: "3.5L V6",
      mileageKm: 88_000,
      drivetrain: "AWD",
      exteriorColor: "Dark Grey",
    },
    frontImageUrl: "/images/cars/lexus-rx.webp",
    rearImageUrl: "/images/cars/lexus-rx.webp",
    thumbnailUrl: "/images/cars/lexus-rx.webp",
  },
  {
    // TODO(UNCLE-VERIFY): Cropped from the 6-car grid flyer thumbnail — low
    // resolution. All specs below are placeholder estimates.
    id: "toyota-venza",
    vin: "4T3BA3BB0EU123456",
    name: "Toyota Venza",
    year: 2014,
    make: "Toyota",
    model: "Venza",
    basePriceCAD: 12_200,
    location: "Vaughan, Ontario, Canada",
    status: "RESERVED",
    ownerId: "user-customer-1",
    isSampleEstimate: true,
    imageResolution: "thumbnail",
    specs: {
      engine: "3.5L V6",
      mileageKm: 135_000,
      drivetrain: "AWD",
      exteriorColor: "Dark Grey",
    },
    frontImageUrl: "/images/cars/toyota-venza.webp",
    rearImageUrl: "/images/cars/toyota-venza.webp",
    thumbnailUrl: "/images/cars/toyota-venza.webp",
  },
  {
    // TODO(UNCLE-VERIFY): Cropped from the 6-car grid flyer thumbnail — low
    // resolution. Flyer only labels this "Black Acura MDX/RDX"; exact model
    // and all specs below are placeholder estimates.
    id: "acura-mdx",
    vin: "5FRYD4H80GB123456",
    name: "Acura MDX",
    year: 2016,
    make: "Acura",
    model: "MDX",
    basePriceCAD: 19_400,
    location: "Vaughan, Ontario, Canada",
    status: "AVAILABLE",
    isSampleEstimate: true,
    imageResolution: "thumbnail",
    specs: {
      engine: "3.5L V6",
      mileageKm: 102_000,
      drivetrain: "AWD",
      exteriorColor: "Black",
    },
    frontImageUrl: "/images/cars/acura-mdx.webp",
    rearImageUrl: "/images/cars/acura-mdx.webp",
    thumbnailUrl: "/images/cars/acura-mdx.webp",
  },
];

export const SEED_SHIPMENTS: Shipment[] = [
  {
    id: "shipment-mercedes-gla250-4matic",
    vehicleId: "mercedes-gla250-4matic",
    shippingMethod: "RoRo",
    vesselName: "Grande Lagos",
    bookingNumber: "GRIM-LAG-88213",
    departurePort: "Halifax, Canada",
    arrivalPort: "Tin Can Island, Lagos",
    departureDate: "2026-09-29",
    etaLagos: "2026-10-24",
    customsDutyNGN: 4_210_664,
    clearingFeeNGN: 1_450_000,
    billOfLadingVerified: true,
  },
  {
    id: "shipment-lexus-rx-350",
    vehicleId: "lexus-rx-350",
    shippingMethod: "Container",
    vesselName: "MSC Praia",
    bookingNumber: "MSC-APJ-40417",
    departurePort: "Montreal, Canada",
    arrivalPort: "Tin Can Island, Lagos",
    departureDate: "2026-09-02",
    etaLagos: "2026-09-28",
    customsDutyNGN: 6_332_839,
    clearingFeeNGN: 1_450_000,
    billOfLadingVerified: true,
  },
];

export const SEED_TRACKING_LOGS: TrackingLog[] = [
  {
    id: "log-gla-1",
    vehicleId: "mercedes-gla250-4matic",
    milestone: "PURCHASED_CANADA",
    title: "Vehicle Purchased",
    location: "Vaughan, Ontario",
    description: "Purchase completed and ownership transferred to Modfem Autos.",
    timestamp: "2026-09-18T14:00:00Z",
    completed: true,
  },
  {
    id: "log-gla-2",
    vehicleId: "mercedes-gla250-4matic",
    milestone: "EXPORT_INSPECTION",
    title: "Export Inspection Passed",
    location: "Vaughan, Ontario",
    description: "Pre-export condition and VIN verification inspection passed.",
    timestamp: "2026-09-22T09:30:00Z",
    completed: true,
  },
  {
    id: "log-gla-3",
    vehicleId: "mercedes-gla250-4matic",
    milestone: "AT_PORT_HALIFAX",
    title: "Arrived at Port of Halifax",
    location: "Halifax, Nova Scotia",
    description: "Vehicle received at terminal and staged for RoRo loading.",
    timestamp: "2026-09-27T11:15:00Z",
    completed: true,
  },
  {
    id: "log-gla-4",
    vehicleId: "mercedes-gla250-4matic",
    milestone: "ON_VESSEL_ATLANTIC",
    title: "Loaded Aboard Grande Lagos",
    location: "Mid-Atlantic",
    description: "Vessel Grande Lagos departed Halifax, en route to Lagos.",
    timestamp: "2026-09-29T20:00:00Z",
    completed: true,
  },
  {
    id: "log-gla-5",
    vehicleId: "mercedes-gla250-4matic",
    milestone: "ARRIVED_LAGOS_PORT",
    title: "Arrival at Tin Can Island",
    location: "Tin Can Island, Lagos",
    description: "Vessel discharged; vehicle offloaded to bonded terminal.",
    timestamp: "2026-10-24T09:00:00Z",
    completed: true,
  },
  {
    id: "log-gla-6",
    vehicleId: "mercedes-gla250-4matic",
    milestone: "CUSTOMS_CLEARANCE",
    title: "Customs Clearance Completed",
    location: "Tin Can Island, Lagos",
    description: "Nigerian Customs Service duty assessed and paid against Form M and bill of lading.",
    timestamp: "2026-10-29T15:00:00Z",
    completed: true,
  },
  {
    id: "log-gla-7",
    vehicleId: "mercedes-gla250-4matic",
    milestone: "READY_FOR_DELIVERY",
    title: "Cleared & Ready for Lagos Handover",
    location: "Lagos, Nigeria",
    description: "Cleared by NCS — available for buyer pickup in Lagos.",
    timestamp: "2026-11-02T12:00:00Z",
    completed: true,
  },
  {
    id: "log-rx-1",
    vehicleId: "lexus-rx-350",
    milestone: "PURCHASED_CANADA",
    title: "Vehicle Purchased",
    location: "Montreal, Quebec",
    description: "Purchase completed and ownership transferred to Modfem Autos.",
    timestamp: "2026-08-20T10:00:00Z",
    completed: true,
  },
  {
    id: "log-rx-2",
    vehicleId: "lexus-rx-350",
    milestone: "EXPORT_INSPECTION",
    title: "Export Inspection Passed",
    location: "Montreal, Quebec",
    description: "Pre-export condition and VIN verification inspection passed.",
    timestamp: "2026-08-25T13:45:00Z",
    completed: true,
  },
  {
    id: "log-rx-2b",
    vehicleId: "lexus-rx-350",
    milestone: "AT_PORT_HALIFAX",
    title: "Drayage & Port Reception",
    location: "Montreal, Quebec",
    description: "Vehicle received at Port of Montreal terminal, staged for container loading.",
    timestamp: "2026-08-29T09:00:00Z",
    completed: true,
  },
  {
    id: "log-rx-3",
    vehicleId: "lexus-rx-350",
    milestone: "ON_VESSEL_ATLANTIC",
    title: "Loaded Aboard MSC Praia",
    location: "Mid-Atlantic",
    description: "Vessel MSC Praia departed Montreal, en route to Lagos.",
    timestamp: "2026-09-02T18:00:00Z",
    completed: true,
  },
  {
    id: "log-rx-4",
    vehicleId: "lexus-rx-350",
    milestone: "ARRIVED_LAGOS_PORT",
    title: "Arrived at Tin Can Island",
    location: "Tin Can Island, Lagos",
    description: "Vessel discharged; vehicle offloaded to bonded terminal.",
    timestamp: "2026-09-28T07:20:00Z",
    completed: true,
  },
  {
    id: "log-rx-5",
    vehicleId: "lexus-rx-350",
    milestone: "CUSTOMS_CLEARANCE",
    title: "Customs Clearance in Progress",
    location: "Tin Can Island, Lagos",
    description: "Nigerian Customs Service assessing duty against Form M and bill of lading.",
    timestamp: "2026-10-03T12:00:00Z",
    completed: false,
  },
];

export const SEED_SOURCING_REQUESTS: SourcingRequest[] = [
  {
    id: "SR-2026-7K2Q",
    createdAt: "2026-10-01T09:15:00Z",
    status: "NEW",
    mode: "DIRECT_SOURCING",
    buyer: {
      name: "Folarin Adeyemi",
      email: "folarin.adeyemi@example.com",
      phone: "+234 802 410 7731",
    },
    vehicleSpec: {
      year: 2022,
      make: "Porsche",
      model: "Cayenne Coupe",
      trimOrColor: "GTS trim, Jet Black Metallic preferred",
      maxMileageKm: 40_000,
    },
    financials: {
      totalBudgetNGN: 88_000_000,
      maxBidCAD: 50_352,
      shippingMethod: "RoRo",
      destinationPort: "Tin Can Island",
      exchangeRateUsed: 1180,
    },
    dealerNotes: "Buyer based in Victoria Island — flexible on exact trim if spec and mileage match.",
  },
  {
    id: "SR-2026-4M8T",
    createdAt: "2026-10-06T14:40:00Z",
    status: "SOURCING_AT_AUCTION",
    mode: "DIRECT_SOURCING",
    buyer: {
      name: "Zainab Bello",
      email: "zainab.bello@example.com",
      phone: "+234 705 118 2264",
    },
    vehicleSpec: {
      year: 2021,
      make: "Toyota",
      model: "Highlander XSE",
      trimOrColor: "Celestial Silver Metallic, dark interior",
      maxMileageKm: 55_000,
    },
    financials: {
      totalBudgetNGN: 46_000_000,
      maxBidCAD: 25_020,
      shippingMethod: "Container",
      destinationPort: "Apapa",
      exchangeRateUsed: 1180,
    },
    dealerNotes: "Buyer based in Abuja — two auction leads identified at ADESA Montreal, pending condition report.",
  },
];

export const SEED_STATE: StoreState = {
  users: SEED_USERS,
  vehicles: SEED_VEHICLES,
  shipments: SEED_SHIPMENTS,
  trackingLogs: SEED_TRACKING_LOGS,
  sourcingRequests: SEED_SOURCING_REQUESTS,
};

export function cloneSeed(): StoreState {
  return JSON.parse(JSON.stringify(SEED_STATE)) as StoreState;
}
