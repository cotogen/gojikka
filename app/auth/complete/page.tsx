import type { Metadata } from "next";
import AuthCompletePage from "./AuthCompletePage";

export const metadata: Metadata = {
  title: "保存中",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AuthCompletePage />;
}
