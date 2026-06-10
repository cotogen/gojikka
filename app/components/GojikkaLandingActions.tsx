"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function GojikkaLandingActions() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <p className="text-[0.9375rem] leading-[2] gojikka-muted">読み込み中…</p>
    );
  }

  if (session?.user?.lineUserId) {
    return (
      <Link href="/chat" className="gojikka-btn">
        続きを話す
      </Link>
    );
  }

  return (
    <div className="gojikka-landing-actions">
      <button
        type="button"
        className="gojikka-btn"
        onClick={() => signIn("line", { callbackUrl: "/chat" })}
      >
        ログインして続きを話す
      </button>
      <Link href="/profile" className="gojikka-btn-secondary">
        無料で始める
      </Link>
    </div>
  );
}
