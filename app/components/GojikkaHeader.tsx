import Link from "next/link";
import ChatHeaderActions from "@/app/components/ChatHeaderActions";

type GojikkaHeaderProps = {
  compact?: boolean;
  showChatActions?: boolean;
};

export default function GojikkaHeader({
  compact = false,
  showChatActions = false,
}: GojikkaHeaderProps) {
  return (
    <header
      className={`gojikka-container gojikka-header ${
        compact ? "gojikka-header--compact" : ""
      }`}
    >
      <div className="gojikka-header-inner">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="GOJIKKA"
            className={`gojikka-logo ${compact ? "" : "gojikka-logo--hero"}`}
          />
        </Link>
        {showChatActions && <ChatHeaderActions />}
      </div>
    </header>
  );
}
