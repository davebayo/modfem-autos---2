// Surgical Step 9 (v2) — Stage 1: ingest the 3 pixel-registered master hero
// plates (day / dusk / night) and emit near-lossless webp derivatives for
// DistressHero's crossfade stack.
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, ".raw-assets", "2026-11-04-hero-plates-v2");
const outDir = path.join(root, "public", "images", "hero");

const PLATES = [
  { src: "Gemini_Generated_Image_s5mfvxs5mfvxs5mf.jpg", out: "gla-day.webp", label: "day (clear, headlights off)" },
  { src: "Gemini_Generated_Image_s5mfvxs5mfvxs5mf (1).jpg", out: "gla-dusk.webp", label: "dusk (golden hour, DRLs)" },
  { src: "Gemini_Generated_Image_s5mfvxs5mfvxs5mf (2).jpg", out: "gla-night.webp", label: "night (blue hour, high beams)" },
];

for (const plate of PLATES) {
  const inPath = path.join(srcDir, plate.src);
  const outPath = path.join(outDir, plate.out);
  await sharp(inPath)
    .webp({ quality: 96, smartSubsample: true })
    .toFile(outPath);
  const meta = await sharp(outPath).metadata();
  console.log(`✓ ${plate.out} — ${plate.label} (${meta.width}x${meta.height})`);
}

console.log("\nAll 3 master plates ingested at public/images/hero/.");
