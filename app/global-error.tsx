"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          background: "#ffffff",
          color: "#2c2419",
          fontFamily: "serif",
        }}
      >
        <main style={{ maxWidth: "36rem", margin: "4rem auto", padding: "0 1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 400 }}>エラーが発生しました</h1>
          <p style={{ marginTop: "2rem", color: "#8a7b6b", lineHeight: 2 }}>
            ターミナルで Ctrl+C で止めてから、npm run dev をやり直してください。
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "2.5rem",
              border: "none",
              borderRadius: "9999px",
              background: "#6b5344",
              color: "#ffffff",
              padding: "0.875rem 2.5rem",
              fontSize: "0.9375rem",
              cursor: "pointer",
            }}
          >
            再試行
          </button>
        </main>
      </body>
    </html>
  );
}
