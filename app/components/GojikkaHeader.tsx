import Link from "next/link";

type GojikkaHeaderProps = {
  compact?: boolean;
};

export default function GojikkaHeader({ compact = false }: GojikkaHeaderProps) {
  return (
    <header
      className={`gojikka-container gojikka-header ${
        compact ? "gojikka-header--compact" : ""
      }`}
    >
      <Link href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="GOJIKKA"
          className={`gojikka-logo ${compact ? "" : "gojikka-logo--hero"}`}
        />
      </Link>
    </header>
  );
}
