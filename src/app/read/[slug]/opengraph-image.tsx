import { ImageResponse } from "next/og";
import { getStandaloneBySlug } from "@/lib/works";

export const runtime = "nodejs"; // needs supabase client → not edge-compatible without env
export const alt = "marahuyo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { slug: string };

export default async function OG({ params }: { params: Params }) {
  const work = await getStandaloneBySlug(params.slug);
  const title = work?.title ?? "marahuyo";
  const subtitle = work?.subtitle ?? "to be enchanted —";
  const kindLabel = work?.kind?.toUpperCase() ?? "";

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
          marahuyo {kindLabel ? `· ${kindLabel}` : ""}
        </div>
        <div
          style={{
            fontSize: title.length > 40 ? 80 : 112,
            lineHeight: 1.04,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textWrap: "balance"
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
