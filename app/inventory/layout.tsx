import type { Metadata } from "next";
import type { ReactNode } from "react";

const TITLE = "Inventory";
const FULL_TITLE = "Inventory | Modfem Autos";
const DESCRIPTION =
  "Browse verified Canadian inventory with live landed-cost pricing to Lagos — itemized freight, customs duty, and port clearing for every vehicle.";

export const metadata: Metadata = {
  // openGraph/twitter titles don't inherit the root's title.template, so they
  // spell out the full "X | Modfem Autos" string themselves. Likewise, a
  // route that sets its own openGraph object doesn't inherit the root's
  // auto-attached app/opengraph-image.tsx, so it's referenced explicitly —
  // and the canonical path is this route's own, not the root's "/".
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/inventory" },
  openGraph: { title: FULL_TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
  twitter: { title: FULL_TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

export default function InventoryLayout({ children }: { children: ReactNode }) {
  return children;
}
