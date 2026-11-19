import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Modfem Autos",
    short_name: "Modfem",
    description:
      "Direct Canadian & UK car sourcing, inspection, and export to Lagos, Nigeria — transparent landed cost, every time.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0B0E",
    theme_color: "#0A0B0E",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
