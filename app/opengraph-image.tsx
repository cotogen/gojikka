import { ImageResponse } from "next/og";

export const alt = "GOJIKKA｜実家に帰りたいのに、帰れないあなたへ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#ffffff",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 48,
            letterSpacing: "0.15em",
            color: "#6b5344",
            marginBottom: 48,
          }}
        >
          GOJIKKA
        </div>
        <div
          style={{
            fontSize: 52,
            lineHeight: 1.6,
            color: "#2c2419",
            maxWidth: 900,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div>実家に帰りたいのに、</div>
          <div>帰れないあなたへ</div>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 28,
            lineHeight: 1.7,
            color: "#8a7b6b",
            maxWidth: 900,
          }}
        >
          そっと話を聞く相談相手
        </div>
      </div>
    ),
    { ...size }
  );
}
