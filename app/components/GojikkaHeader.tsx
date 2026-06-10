import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

type GojikkaHeaderProps = {
  compact?: boolean;
  showLogout?: boolean;
};

export default function GojikkaHeader({
  compact = false,
  showLogout = false,
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
        {showLogout && <LogoutButton />}
      </div>
    </header>
  );
}
