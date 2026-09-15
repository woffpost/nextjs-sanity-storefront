import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          backgroundColor: "#f6f4ef",
          color: "#1e1c19",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#3f5a48",
            marginBottom: 28,
          }}
        >
          Next.js · Sanity · Stripe
        </div>
        <div style={{ fontSize: 120, lineHeight: 1, display: "flex" }}>Storefront</div>
        <div style={{ fontSize: 30, color: "#6f6a62", marginTop: 32, maxWidth: 820, display: "flex" }}>
          An open-source commerce demo built to be read, not just run.
        </div>
      </div>
    ),
    { ...size },
  );
}
