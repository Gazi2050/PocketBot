import { PlasmaWave } from "@/components/marketing/plasma-wave";

export function HeroArt() {
  return (
    <div className="relative mt-8 aspect-[5/2] overflow-hidden rounded-3xl bg-neutral-950 ring-1 ring-black/7 sm:aspect-[4/1] dark:ring-white/8">
      <PlasmaWave className="absolute inset-0" />
      {/* Static brand mark (brand/pb-logos); the dark hero keeps the
          light-on-dark artwork legible, the scale lands it in the wave. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/pocketbot.svg"
        alt="PocketBot"
        width={512}
        height={512}
        className="pointer-events-none absolute top-1/2 left-1/2 h-auto w-16 -translate-x-1/2 -translate-y-1/2 sm:w-24"
      />
    </div>
  );
}
