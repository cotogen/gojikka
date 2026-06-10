import type { Metadata } from "next";
import ProfileEditScreen from "./ProfileEditScreen";

export const metadata: Metadata = {
  title: "親プロフィールの編集",
  robots: { index: false, follow: false },
};

export default function ProfileEditPage() {
  return <ProfileEditScreen />;
}
