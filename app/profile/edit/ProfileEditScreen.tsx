"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GojikkaFooter from "@/app/components/GojikkaFooter";
import GojikkaHeader from "@/app/components/GojikkaHeader";
import ParentProfileForm from "@/app/components/ParentProfileForm";
import {
  loadParentProfile,
  ParentProfile,
} from "@/lib/parent-profile";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    async function init() {
      const loggedIn = Boolean(session?.user?.lineUserId);
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        try {
          const response = await fetch("/api/me");
          if (response.ok) {
            const data = (await response.json()) as {
              profile: ParentProfile | null;
            };

            if (data.profile) {
              setProfile(data.profile);
              setReady(true);
              return;
            }
          }
        } catch {
          // localStorage にフォールバック
        }
      }

      const saved = loadParentProfile();
      if (!saved) {
        router.replace("/profile");
        return;
      }

      setProfile(saved);
      setReady(true);
    }

    init();
  }, [router, session, sessionStatus]);

  if (!ready || !profile) {
    return (
      <div className="gojikka-page">
        <GojikkaHeader compact />
        <main className="gojikka-container pb-32 pt-12 sm:pt-16">
          <p className="text-[0.9375rem] leading-[2] gojikka-muted">
            読み込み中…
          </p>
        </main>
        <GojikkaFooter />
      </div>
    );
  }

  return (
    <div className="gojikka-page">
      <GojikkaHeader compact />

      <main className="gojikka-container pb-32 pt-12 sm:pt-16">
        <h1 className="text-balance text-[1.5rem] leading-[1.7] tracking-wide sm:text-[1.75rem]">
          親のことを
          <br />
          見直す
        </h1>

        <p className="mt-8 text-[0.9375rem] leading-[2] gojikka-muted">
          わかる範囲で大丈夫です。変更は次の相談から反映されます。
        </p>

        <div className="mt-14">
          <ParentProfileForm
            mode="edit"
            initialProfile={profile}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </main>

      <GojikkaFooter />
    </div>
  );
}
