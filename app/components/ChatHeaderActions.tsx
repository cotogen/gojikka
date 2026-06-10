"use client";

import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

export default function ChatHeaderActions() {
  return (
    <div className="gojikka-header-actions">
      <Link href="/profile/edit" className="gojikka-header-link">
        親のことを見直す
      </Link>
      <LogoutButton />
    </div>
  );
}
