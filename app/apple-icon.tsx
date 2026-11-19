import { ImageResponse } from "next/og";
import {
  MA_MARK_PATH_1,
  MA_MARK_PATH_2,
  MA_MARK_PATH_3,
  MA_MARK_STROKE_BAR_WIDTH,
  MA_MARK_STROKE_MAIN_WIDTH,
  MA_MARK_VIEWBOX,
} from "@/lib/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS applies its own corner rounding/mask to home-screen icons, so this is
// a plain full-bleed obsidian square — no rounded corners or border here,
// which would fight the system mask.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#101216",
        }}
      >
        <svg width="118" height="69" viewBox={MA_MARK_VIEWBOX} fill="none">
          <path
            d={MA_MARK_PATH_1}
            stroke="#FFFFFF"
            strokeWidth={MA_MARK_STROKE_MAIN_WIDTH}
            strokeLinecap="butt"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={MA_MARK_PATH_2}
            stroke="#FFFFFF"
            strokeWidth={MA_MARK_STROKE_MAIN_WIDTH}
            strokeLinecap="butt"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={MA_MARK_PATH_3}
            stroke="#FFFFFF"
            strokeWidth={MA_MARK_STROKE_BAR_WIDTH}
            strokeLinecap="butt"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
