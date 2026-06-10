"use client";

import { signIn, useSession } from "next-auth/react";

type SaveConversationButtonProps = {
  disabled?: boolean;
};

export default function SaveConversationButton({
  disabled = false,
}: SaveConversationButtonProps) {
  const { data: session } = useSession();

  if (session?.user?.lineUserId) {
    return null;
  }

  function handleSave() {
    signIn("line", { callbackUrl: "/auth/complete" });
  }

  return (
    <button
      type="button"
      className="gojikka-btn-secondary mb-4"
      onClick={handleSave}
      disabled={disabled}
    >
      この会話を残す
    </button>
  );
}
