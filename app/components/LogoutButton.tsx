"use client";

import { signOut, useSession } from "next-auth/react";

export default function LogoutButton() {
  const { data: session } = useSession();

  if (!session?.user?.lineUserId) {
    return null;
  }

  function handleLogout() {
    signOut({ callbackUrl: "/" });
  }

  return (
    <button
      type="button"
      className="gojikka-logout"
      onClick={handleLogout}
    >
      ログアウト
    </button>
  );
}
