const card =
  "rounded-3xl bg-white p-5 ring-1 ring-black/7 sm:p-6 dark:bg-[#161615] dark:ring-white/8";

export function MemoryVisual() {
  return (
    <div aria-hidden className={card}>
      <div className="flex flex-col gap-3 text-[13px] leading-snug">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#0c82f2] px-3.5 py-2 text-white">
          I&apos;m training for the SF half marathon in March
        </div>
        <div className="flex items-center gap-3 py-1 text-[11px] text-neutral-400">
          <span className="h-px flex-1 bg-black/7 dark:bg-white/8" />
          two weeks later
          <span className="h-px flex-1 bg-black/7 dark:bg-white/8" />
        </div>
        <div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-md bg-black/4 px-3.5 py-2 dark:bg-white/6">
          Week 3 calls for an easy 5k today. How did Sunday&apos;s long run go?
        </div>
      </div>
    </div>
  );
}

export function ArtifactVisual() {
  const bars = [32, 44, 38, 56, 62, 74, 88];
  return (
    <div aria-hidden className={card}>
      <div className="flex items-center justify-between text-xs font-medium">
        <span>training-plan</span>
        <span className="rounded-full bg-[#0c82f2]/10 px-2 py-0.5 text-[10px] text-[#0c82f2]">
          editable
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <span className="h-2 w-4/5 rounded-full bg-black/6 dark:bg-white/8" />
        <span className="h-2 w-full rounded-full bg-black/6 dark:bg-white/8" />
        <span className="h-2 w-3/5 rounded-full bg-black/6 dark:bg-white/8" />
      </div>
      <div className="mt-5 flex h-24 items-end gap-1.5">
        {bars.map((height, index) => (
          <span
            key={height}
            style={{ height: `${height}%` }}
            className={`flex-1 rounded-t-md ${index === bars.length - 1 ? "bg-[#0c82f2]" : "bg-[#0c82f2]/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
