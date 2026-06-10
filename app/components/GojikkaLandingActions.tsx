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
      <Link href="/profile" className="gojikka-btn">
        無料で始める
      </Link>
      <button
        type="button"
        className="gojikka-btn-secondary"
        onClick={() => signIn("line", { callbackUrl: "/chat" })}
      >
        ログインして続きを話す
      </button>
    </div>
  );
}
