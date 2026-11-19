import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents / partialPrefetching are deliberately OFF. Under the
  // Cloudflare Workers runtime (OpenNext), Cache Components' request-time
  // render relies on Node's setTimeout() task semantics, which workerd
  // doesn't match — every page render hung until workerd cancelled it
  // (Error 1101 / "code had hung"). Next.js warns about exactly this at
  // runtime. Nothing here uses "use cache"/cacheLife/connection() — pages
  // hydrate client-side from /api/store — so the conventional renderer
  // loses nothing. Don't re-enable without verifying under `preview:cf`.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          // Vercel's edge already forces HTTPS, but this makes it explicit
          // and keeps the same guarantee on any other host.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          // This app never uses the camera, microphone, or geolocation —
          // deny them outright rather than leave the default (allowed to
          // same-origin) open.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
