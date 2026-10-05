import { RAINBOW_LAYER, PocketBotRings } from "~/components/pocketbot-rings";

/**
 * The rainbow PocketBot rings spinning as a full-page loading indicator on the
 * public share and visual pages. Center it with a flex wrapper at the call site.
 */
export function RainbowLoader({ size = 36 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <PocketBotRings spin layers={[RAINBOW_LAYER]} />
    </div>
  );
}
