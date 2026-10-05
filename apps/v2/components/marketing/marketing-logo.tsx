import { PocketBotRings } from "@/components/pocketbot-rings";

export function MarketingLogo({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`relative inline-block shrink-0 ${className}`}
    >
      {/* Theme-aware fill rather than a baked brand color: the pb-logos pack
          doesn't define a marketing accent yet. */}
      <PocketBotRings layers={[{ className: "bg-foreground" }]} />
    </span>
  );
}
