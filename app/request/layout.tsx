import type { Metadata } from "next";
import type { ReactNode } from "react";

const TITLE = "Custom Sourcing Concierge";
const FULL_TITLE = "Custom Sourcing Concierge | Modfem Autos";
const DESCRIPTION =
  "Tell us the car you want — Modfem sources it from Canada or the UK, inspects it, and quotes a transparent all-in landed cost to Lagos. Trade-in and swap options available.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/request" },
  openGraph: { title: FULL_TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
  twitter: { title: FULL_TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
};

export default function RequestLayout({ children }: { children: ReactNode }) {
  return children;
}
