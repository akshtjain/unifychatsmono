import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default async function Icon() {
  // Read the SVG file and convert to base64 data URI
  const svgPath = join(process.cwd(), "public", "logos", "unify-chats-app.svg");
  const svgContent = readFileSync(svgPath, "utf-8");
  const base64Svg = Buffer.from(svgContent).toString("base64");
  const dataUri = `data:image/svg+xml;base64,${base64Svg}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090a",
          borderRadius: 40,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUri}
          alt="UnifyChats"
          width={160}
          height={160}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
