/** Official "MA" monoline ribbon emblem — exact, pre-computed G1
 * tangent-continuous cubic Bezier geometry (do not recalculate the
 * coordinates). Single source of truth shared by components/ui/ModfemLogoMark.tsx
 * and every generated icon/OG-image route (app/icon.svg mirrors this literally,
 * since a static SVG file can't import a TS module — keep it byte-identical
 * by hand if these ever change). */
export const MA_MARK_VIEWBOX = "0 0 116 68";

export const MA_MARK_PATH_1 =
  "M 10 56 L 22 26 C 27.6 12 40.5 12 37 26 L 32 46 C 29.5 56 37.6 56 41.6 46 L 49.6 26 C 55.2 12 71.2 12 65.6 26 L 62.4 34";
export const MA_MARK_PATH_2 =
  "M 60 40 L 57.6 46 C 53.6 56 64.8 56 68.8 46 L 76.8 26 C 82.4 12 88.8 12 94.4 26 L 106.4 56";
export const MA_MARK_PATH_3 = "M 77.5 42.5 H 100.5";

export const MA_MARK_STROKE_MAIN_WIDTH = 7.2;
export const MA_MARK_STROKE_BAR_WIDTH = 6.8;
