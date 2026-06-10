import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import GojikkaFooter from "@/app/components/GojikkaFooter";
import GojikkaHeader from "@/app/components/GojikkaHeader";
import ParentProfileForm from "@/app/components/ParentProfileForm";
import { getParentProfileByUserId } from "@/lib/db/parent-profiles";
import { getUserIdByLineId } from "@/lib/db/users";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = {
  title: "親プロフィール",
  description: "親のことを教えてください。理解したうえで相談を始めます。",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  if (isSupabaseConfigured()) {
    const session = await auth();
    const lineUserId = session?.user?.lineUserId;

    if (lineUserId) {
      const userId =
        session?.user?.id ?? (await getUserIdByLineId(lineUserId));

      if (userId) {
        const profile = await getParentProfileByUserId(userId);
        if (profile) {
          redirect("/chat");
        }
      }
    }
  }

  return (
    <div className="gojikka-page">
      <GojikkaHeader compact />

      <main className="gojikka-container pb-32 pt-12 sm:pt-16">
        <h1 className="text-balance text-[1.5rem] leading-[1.7] tracking-wide sm:text-[1.75rem]">
          あなたから見た親を
          <br />
          教えてください
        </h1>

        <p className="mt-8 text-[0.9375rem] leading-[2] gojikka-muted">
          わかる範囲で大丈夫です。あとから変えても構いません。
        </p>

        <div className="mt-14">
          <ParentProfileForm />
        </div>
      </main>

      <GojikkaFooter />
    </div>
  );
}
