import { ImageResponse } from "next/og";
import { getChapter } from "@/lib/works";

export const runtime = "nodejs";
export const alt = "marahuyo — chapter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { slug: string; chapter: string };

export default async function OG({ params }: { params: Params }) {
  const found = await getChapter(params.slug, params.chapter);
  const title = found?.chapter.title ?? "Chapter";
  const series = found?.series.title ?? "Series";
  const number = found ? String(found.chapter.number).padStart(2, "0") : "01";
  const subtitle = found?.chapter.subtitle ?? "";

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
          {series} · chapter {number}
        </div>
        <div
          style={{
            fontSize: title.length > 36 ? 84 : 116,
            lineHeight: 1.02,
            fontWeight: 700,
            letterSpacing: "-0.02em"
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 34,
            fontStyle: "italic",
            color: "#52525C",
            maxWidth: 1040
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    size
  );
}
