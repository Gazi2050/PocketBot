"use client";

import { PocketBotRings } from "./pocketbot-rings";

export function PocketBotLogo({
  size = 20,
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
      <PocketBotRings layers={[{ className: "bg-foreground-soft" }]} />
    </span>
  );
}
