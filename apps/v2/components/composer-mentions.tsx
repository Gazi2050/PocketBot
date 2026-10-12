"use client";

import { Fragment, type RefObject, useState } from "react";
import { IconPlugConnected } from "@tabler/icons-react";

import type { MentionSegment } from "@/lib/mentions";
import { isImageLoaded, markImageLoaded } from "@/lib/image-cache";

/* The composer's mention chips: a metrics-identical layer painted behind
   the textarea. While a mention is live the textarea's own glyphs go
   transparent and THIS layer draws all the text — plain runs in the
   normal ink, mentions as a Slack-style chip: tinted pill, blue text,
   and the thumbnail drawn inside the "@" glyph's cell. Only colors
   change (never weight or spacing), so the layout the textarea computes
   for caret/wrap/selection matches what's on screen pixel for pixel.
   The one-character caret behavior lives in the composer's handlers;
   this layer is pure paint. */

/* The chip's thumbnail: the attached image itself, else a plug. Same
   skeleton-then-fade behavior the old integration logo had, minus the
   monochrome-SVG middle tier (image tags have no iconSvg). */
function MentionThumb({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(() =>
    logoUrl && isImageLoaded(logoUrl) ? logoUrl : null,
  );
  if (logoUrl && !failed) {
    const loaded = loadedSrc === logoUrl || isImageLoaded(logoUrl);
    const settle = (node: HTMLImageElement) => {
      node.decode().then(
        () => {
          markImageLoaded(logoUrl);
          setLoadedSrc(logoUrl);
        },
        () => setFailed(true),
      );
    };
    return (
      <span
        title={name}
        className="relative block max-w-none shrink-0 overflow-hidden ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
        style={{ width: 13, height: 13, borderRadius: 3 }}
      >
        {!loaded && (
          <span className="absolute inset-0 block animate-pulse bg-black/[0.05] dark:bg-white/[0.08]" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          draggable={false}
          ref={(node) => {
            if (node?.complete && !loaded) settle(node);
          }}
          onLoad={(event) => settle(event.currentTarget)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full max-w-none object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    );
  }
  return <IconPlugConnected size={13} stroke={2} className="max-w-none" />;
}

export function MentionHighlight({
  segments,
  value,
  highlightRef,
}: {
  segments: MentionSegment[];
  value: string;
  highlightRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={highlightRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden px-1.5 py-1.5 field-text break-words whitespace-pre-wrap text-foreground"
    >
      {segments.map((segment, index) =>
        segment.mention ? (
          /* Real padding would shift glyphs out of sync with the textarea's
             layout, so the pill's breathing room is a zero-blur shadow
             spread: same tint painted 3px past the text box, no metric
             change. The logo sits in the "@" glyph's cell. */
          <span
            key={index}
            className="rounded-[6px] box-decoration-clone bg-[rgba(12,130,242,0.1)] text-[#0c82f2] shadow-[0_0_0_3px_rgba(12,130,242,0.1)] dark:bg-[rgba(12,130,242,0.22)] dark:text-[#6db4f8] dark:shadow-[0_0_0_3px_rgba(12,130,242,0.22)]"
          >
            <span className="relative text-transparent">
              @
              {/* The wrapper owns the absolute placement — an in-flow
                  replaced element here would fragment the line box and
                  desync this layer from the textarea. */}
              <span className="absolute top-[53%] left-[44%] -translate-x-1/2 -translate-y-1/2">
                {/* max-w-none: preflight's img { max-width: 100% } would
                    clamp the logo to the "@" glyph's ~9px cell and squish
                    it. */}
                <MentionThumb
                  name={segment.mention.name}
                  logoUrl={segment.mention.logoUrl}
                />
              </span>
            </span>
            {segment.text.slice(1)}
          </span>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
      {value.endsWith("\n") ? " " : ""}
    </div>
  );
}
