import { ImageResponse } from "next/og";
import { getSeriesBySlug } from "@/lib/works";

export const runtime = "nodejs";
export const alt = "marahuyo — series";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { slug: string };

export default async function OG({ params }: { params: Params }) {
  const series = await getSeriesBySlug(params.slug);
  const title = series?.title ?? "Series";
  const subtitle = series?.subtitle ?? series?.excerpt ?? "an ongoing arc";
  const chapterCount = series?.chapters.length ?? 0;

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
          marahuyo · series {chapterCount > 0 ? `· ${chapterCount} chapters` : ""}
        </div>
        <div
          style={{
            fontSize: title.length > 36 ? 88 : 124,
            lineHeight: 1.02,
            fontWeight: 700,
            letterSpacing: "-0.02em"
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 36,
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
