import {
  IconBarbellFilled,
  IconBoltFilled,
  IconSparklesFilled,
  type Icon,
} from "@tabler/icons-react";

/* The chat lineup is exactly three text-only modes. Keys mirror the
   backend's MODEL_IDS keys (convex/inference/billing.ts) — they're what
   gets persisted, so never rename them. No provider names, no search, no
   thinking, no vision/files — the picker shows only Auto/Fast/Heavy. */

export type ChatModelKey = "Auto" | "Fast" | "Basic" | "Max" | "Image";

export type ThinkingLevel = "none" | "low" | "medium" | "high";

export const THINKING_LABELS: Record<ThinkingLevel, string> = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
};

export type ChatModel = {
  key: ChatModelKey;
  name: string;
  icon: Icon;
  /** Kept for search-compat; modes carry no provider aliases now. */
  aliases: string[];
  /** Text-only: always false. Kept so callers don't churn. */
  vision: boolean;
  /** Text-only: always false. */
  files: boolean;
  /** Text-only: always false. */
  imageOutput: boolean;
  /** Always ["none"] — thinking is gone. */
  thinkingLevels: ThinkingLevel[];
  /** No badge — we don't disclose the underlying model. */
  whiteLabel: boolean;
  /** Always false — no auto gates UI. */
  autoGates: boolean;
};

export const CHAT_MODELS: ChatModel[] = [
  {
    key: "Auto",
    name: "Auto",
    icon: IconSparklesFilled,
    aliases: ["auto"],
    vision: false,
    files: false,
    imageOutput: false,
    thinkingLevels: ["none"],
    whiteLabel: false,
    autoGates: false,
  },
  {
    key: "Basic",
    name: "Fast",
    icon: IconBoltFilled,
    aliases: ["fast"],
    vision: false,
    files: false,
    imageOutput: false,
    thinkingLevels: ["none"],
    whiteLabel: false,
    autoGates: false,
  },
  {
    key: "Max",
    name: "Heavy",
    icon: IconBarbellFilled,
    aliases: ["heavy"],
    vision: false,
    files: false,
    imageOutput: false,
    thinkingLevels: ["none"],
    whiteLabel: false,
    autoGates: false,
  },
];

/* Where a composer starts, and where a never-chosen preference lands:
   Auto picks the model so nobody has to (lib/model-pref.ts). */
export const DEFAULT_MODEL_KEY: ChatModelKey = "Auto";

/** The free plan's tier — the one model a free user can actually reach,
 *  and so the one a never-chosen preference is allowed to keep. */
export const FREE_MODEL_KEY: ChatModelKey = "Fast";

/* What the picker actually renders: the static lineup above, tier entries
   re-skinned by an admin override, and admin-added catalog models. Catalog
   models are keyed by their OpenRouter slug (always contains "/", so they
   can never collide with the tier keys), wear an uploaded monochrome SVG
   instead of a Tabler glyph, and carry their company for search and
   subtitles. */
export type ComposerModel = Omit<ChatModel, "key" | "icon"> & {
  key: string;
  icon?: Icon;
  iconSvg?: string;
  company?: string;
  /** The maker's full model name ("Claude Fable 5") — what the search
   *  list shows. Absent on white-labeled tiers, which go by `name`. */
  fullName?: string;
  /** Admin-retired: hidden from the picker's lists until a typed search
   *  matches it. Still fully usable once picked. */
  legacy?: boolean;
};

/** Catalog models are keyed by slug; tier keys never contain a slash. */
export function isCustomModelKey(key: string): boolean {
  return key.includes("/");
}
