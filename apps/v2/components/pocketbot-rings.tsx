"use client";

import type { CSSProperties } from "react";

/* The PocketBot mark ships static (brand/pb-logos), so the old
   counter-rotating ring rig is retired. The component keeps its name and
   `layers` fill mechanism — the mark is drawn through a CSS mask so the
   layers (usually bg-current / bg-foreground-soft) keep driving its color
   in both themes. `spin`, `breathe`, and `continuityId` are accepted and
   ignored so every call site stays untouched.
   ponytail: no motion until animated brand art exists; upgrade path is
   reintroducing the rotation rig inside this component only.
   TODO(pocketbot-brand): animated mark. */
const MARK_MASK: CSSProperties = {
  WebkitMaskImage: "url(/pocketbot.svg)",
  maskImage: "url(/pocketbot.svg)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
};

export type RingLayer = {
  className?: string;
  style?: CSSProperties;
};

export function PocketBotRings({
  layers,
  className = "",
}: {
  /** Accepted for API compatibility; ignored (nothing spins). */
  spin?: boolean;
  /** Accepted for API compatibility; ignored (nothing breathes). */
  breathe?: boolean;
  layers: RingLayer[];
  className?: string;
  /** Accepted for API compatibility; ignored (no pose to resume). */
  continuityId?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={MARK_MASK}
    >
      {layers.map((layer, i) => (
        <span
          key={i}
          className={`absolute inset-0 ${layer.className ?? ""}`}
          style={layer.style}
        />
      ))}
    </span>
  );
}
