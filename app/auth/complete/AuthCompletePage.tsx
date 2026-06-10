"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import GojikkaHeader from "@/app/components/GojikkaHeader";
import {
  clearGuestData,
  loadConversation,
} from "@/lib/conversation-storage";
import { loadParentProfile } from "@/lib/parent-profile";

export default function AuthCompletePage() {
  const { status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("保存しています…");
  const started = useRef(false);

  useEffect(() => {
    if (status === "loading" || started.current) {
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    started.current = true;

    async function migrate() {
      const profile = loadParentProfile();
      const messages = loadConversation();

      if (!profile && messages.length === 0) {
        router.replace("/chat");
        return;
      }

      try {
        const response = await fetch("/api/migrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, messages }),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setMessage(data.error ?? "保存に失敗しました。");
          return;
        }

        clearGuestData();
        router.replace("/chat?saved=1");
      } catch {
        setMessage("保存に失敗しました。もう一度お試しください。");
      }
    }

    migrate();
  }, [status, router]);

  return (
    <div className="gojikka-page">
      <GojikkaHeader compact />

      <main className="gojikka-container pb-32 pt-12 sm:pt-16">
        <p className="text-[0.9375rem] leading-[2] gojikka-muted">{message}</p>
      </main>
    </div>
  );
}
