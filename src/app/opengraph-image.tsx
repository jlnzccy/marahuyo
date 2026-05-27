import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "marahuyo — to be enchanted";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FFFFFF",
          color: "#121214",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Georgia, serif"
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#94949C"
          }}
        >
          a literary archive · est. 2026
        </div>
        <div
          style={{
            fontSize: 240,
            lineHeight: 0.92,
            fontWeight: 700,
            letterSpacing: "-0.04em"
          }}
        >
          marahuyo
        </div>
        <div style={{ fontSize: 44, fontStyle: "italic", color: "#52525C" }}>
          to be enchanted —
        </div>
      </div>
    ),
    size
  );
}
