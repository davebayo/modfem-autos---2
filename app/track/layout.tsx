import type { Metadata } from "next";
import type { ReactNode } from "react";

const TITLE = "Track Your Shipment";
const FULL_TITLE = "Track Your Shipment | Modfem Autos";
const DESCRIPTION =
  "Look up your VIN or booking reference for live milestone tracking — from Canadian export through Atlantic transit to customs clearing in Lagos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/track" },
  openGraph: { title: FULL_TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
  twitter: { title: FULL_TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

export default function TrackLayout({ children }: { children: ReactNode }) {
  return children;
}
