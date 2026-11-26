import type { Metadata } from "next";
import { Comfortaa, Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { DemoModeRibbon } from "@/components/DemoModeRibbon";
import { FloatingWhatsAppBar } from "@/components/FloatingWhatsAppBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Drives the `.serif`/`font-serif` typography on the alabaster editorial
// spread (EditorialDealerSignoff) — matches reference-arena.html's
// `.serif{font-family:'Instrument Serif',Georgia,serif}`.
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  subsets: ["latin"],
});

// A sleek, monoline, rounded-terminal geometric sans — used exclusively for
// the "MODFEM AUTOS" brand wordmark (header, preloader, nav drawer), via
// the font-[family-name:var(--font-brand)] arbitrary utility at each usage.
const comfortaa = Comfortaa({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-brand",
});

const SITE_TITLE =
  "Modfem Autos | Canadian Vehicle Sourcing, Export & Shipping to Nigeria";
const SITE_DESCRIPTION =
  "Direct Canadian & UK car sourcing, inspection, and export to Lagos. Transparent landed cost calculations, age-tiered customs duties, and live Atlantic shipment tracking.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://modfemautos.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Modfem Autos",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: "Modfem Autos",
    locale: "en_NG",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${comfortaa.variable} h-full antialiased`}
    >
      <body className="h-full overflow-x-clip bg-zinc-950">
        {/* Ambient showroom rim-light — a fixed, subtle emerald glow behind
            every page so cards and hero content read as sitting inside a
            lit studio rather than a flat dashboard background. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08), transparent 60%)",
          }}
        />
        <DemoModeRibbon />
        {children}
        <FloatingWhatsAppBar />
      </body>
    </html>
  );
}
