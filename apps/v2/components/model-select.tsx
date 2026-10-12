"use client";

import { useMemo, useState } from "react";
import { IconCheck } from "@tabler/icons-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { LockedModelPolicy } from "@pocketbot/backend/convex/lockedPolicy";
import { filterLockedModels } from "@/lib/locked/locked-models";
import { useComposerModels } from "@/lib/model-catalog";
import type { SetModelPref } from "@/lib/model-pref";
import type { ThinkingLevel } from "@/lib/models";
import { ModelGlyph } from "./model-glyph";

const ROW =
  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13.5px]/5 transition-colors duration-100 hover:bg-accent hover:text-accent-foreground";

/* Three-mode picker: Auto / Fast / Heavy. No search, no thinking, no
   provider names — the mode label is the whole truth. Extra props are kept
   for call-site compatibility and ignored. */
export function ModelSelect({
  value,
  onValueChange,
  searchAvailable,
  searchOn,
  onSearchOnChange,
  thinking,
  onThinkingChange,
  lockedPolicy,
}: {
  value: string;
  onValueChange: SetModelPref;
  searchAvailable?: boolean;
  searchOn: boolean;
  onSearchOnChange: (on: boolean) => void;
  thinking: ThinkingLevel;
  onThinkingChange: (level: ThinkingLevel) => void;
  lockedPolicy?: LockedModelPolicy;
}) {
  void searchAvailable;
  void searchOn;
  void onSearchOnChange;
  void thinking;
  void onThinkingChange;
  const [open, setOpen] = useState(false);
  const allModels = useComposerModels();
  const models = useMemo(
    () =>
      lockedPolicy ? filterLockedModels(allModels, lockedPolicy) : allModels,
    [allModels, lockedPolicy],
  );
  const current = models.find((model) => model.key === value) ?? models[0];

  if (!current) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Choose mode"
        className="relative flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13.5px]/4 font-medium text-muted-foreground transition-colors duration-150 hover:bg-black/[0.05] hover:text-foreground data-popup-open:bg-black/[0.05] data-popup-open:text-foreground dark:hover:bg-white/[0.06] dark:data-popup-open:bg-white/[0.06]"
      >
        <ModelGlyph model={current} size={15} className="shrink-0" />
        <span className="whitespace-nowrap">{current.name}</span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-52 p-1"
      >
        {models.map((model) => (
          <button
            key={model.key}
            type="button"
            className={ROW}
            onClick={() => {
              onValueChange(model.key);
              setOpen(false);
            }}
          >
            <ModelGlyph
              model={model}
              size={15}
              className="shrink-0 text-muted-foreground"
            />
            {model.name}
            {value === model.key && (
              <IconCheck
                size={14}
                className="ml-auto shrink-0 text-muted-foreground"
              />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
