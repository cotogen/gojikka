"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="gojikka-page">
      <main className="gojikka-container" style={{ paddingTop: "4rem" }}>
        <h1 className="text-[1.5rem] leading-[1.7] tracking-wide">
          ページの読み込みに失敗しました
        </h1>
        <p className="mt-8 text-[0.9375rem] leading-[2] gojikka-muted">
          開発サーバーが不安定なときに起こることがあります。
          <br />
          ターミナルで一度止めてから、もう一度 npm run dev を実行してください。
        </p>
        <button type="button" className="gojikka-btn mt-10" onClick={() => reset()}>
          再試行
        </button>
      </main>
    </div>
  );
}
