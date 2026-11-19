import { ImageResponse } from "next/og";
import {
  MA_MARK_PATH_1,
  MA_MARK_PATH_2,
  MA_MARK_PATH_3,
  MA_MARK_STROKE_BAR_WIDTH,
  MA_MARK_STROKE_MAIN_WIDTH,
  MA_MARK_VIEWBOX,
} from "@/lib/brand-mark";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Modfem Autos — Direct Canadian & UK Car Sourcing, Inspection & Export";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0A0B0E",
          padding: "40px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#101216",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "24px",
            padding: "56px",
          }}
        >
          {/* Top-left brand row */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <svg width="62" height="36" viewBox={MA_MARK_VIEWBOX} fill="none">
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
            <span
              style={{
                display: "flex",
                color: "#FFFFFF",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              MODFEM AUTOS
            </span>
          </div>

          {/* Centered headline + status pill */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#FFFFFF",
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                width: "920px",
              }}
            >
              Direct Canadian & UK Car Sourcing, Inspection & Export
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 22px",
                borderRadius: "999px",
                backgroundColor: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.4)",
              }}
            >
              <span
                style={{
                  display: "flex",
                  color: "#10B981",
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              >
                VERIFIED LANDED COST · LAGOS PICKUP &amp; CUSTOMS CLEARING
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
