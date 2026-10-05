import { Svg, G, Path } from "react-native-svg";

/**
 * The PocketBot mark (brand/pb-logos): three rounded strokes pinwheeling
 * around the center, one arm generated at 0°/120°/240°. Geometry is lifted
 * verbatim from brand/pb-logos/logo/app-icons/source/logo.svg — regenerate
 * from that file rather than hand-editing these numbers.
 */
const ARM =
  "M-41.66 21.54V-43.42A46.77 46.77 0 0 1 28.49 -83.92L81.47 -53.34";
const ANGLES = [0, 120, 240];

export function PocketBotMark({ size = 96, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <G transform="translate(256 256) scale(1.74355) translate(2.5 -3.57)">
        <G
          fill="none"
          stroke={color}
          strokeWidth={31.95}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ANGLES.map((angle) => (
            <Path key={angle} d={ARM} transform={`rotate(${angle})`} />
          ))}
        </G>
      </G>
    </Svg>
  );
}
