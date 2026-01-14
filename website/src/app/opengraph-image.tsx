import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

export const alt = "UnifyChats - Navigate Your AI Conversations";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  // Read the SVG file and convert to base64 data URI
  const svgPath = join(process.cwd(), "public", "logos", "unify-chats-app.svg");
  const svgContent = readFileSync(svgPath, "utf-8");
  const base64Svg = Buffer.from(svgContent).toString("base64");
  const dataUri = `data:image/svg+xml;base64,${base64Svg}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #1a1a2e 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUri}
            alt="UnifyChats"
            width={140}
            height={140}
            style={{ objectFit: "contain" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            color: "#fafaf9",
            marginBottom: 16,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          UnifyChats
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#a8a29e",
            textAlign: "center",
            maxWidth: 800,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Navigate Your AI Conversations
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
          }}
        >
          {["ChatGPT", "Claude", "Gemini", "Grok", "Perplexity"].map(
            (name, i) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 24px",
                  borderRadius: 50,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: ["#10a37f", "#d97757", "#4285f4", "#ffffff", "#20b8cd"][
                    i
                  ],
                  fontSize: 20,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {name}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
