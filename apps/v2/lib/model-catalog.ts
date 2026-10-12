"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@pocketbot/backend/convex/_generated/api";
import {
  CHAT_MODELS,
  type ComposerModel,
  type ThinkingLevel,
} from "@/lib/models";

/* Admin-curated models from the console's Models tab (convex/models.ts):
   custom OpenRouter models that join the composer's search list, plus
   overrides that re-skin a preset tier. Cached in localStorage (mirrors
   lib/plan-cache.ts) so the full catalog paints instantly on repeat visits —
   picking a model never waits on the network; the live subscription
   replaces the cache silently. */

const CACHE_KEY = "model-catalog";

export type AdminModel = {
  /** Preset tier this entry overrides; absent for catalog models. */
  tier?: "Fast" | "Basic" | "Max" | "Image";
  slug: string;
  displayName: string;
  company: string;
  modelName: string;
  iconSvg?: string;
  capabilities: {
    vision: boolean;
    files: boolean;
    audio: boolean;
    reasoning: boolean;
    tools: boolean;
    imageOutput: boolean;
    contextLength: number;
  };
  /** Admin-retired to search-only. Optional so pre-flag caches still parse. */
  legacy?: boolean;
  /** Row age for newest-first ordering. Optional for pre-flag caches. */
  createdAt?: number;
};

function isAdminModel(value: unknown): value is AdminModel {
  if (value === null || typeof value !== "object") return false;
  const model = value as Partial<AdminModel>;
  return (
    typeof model.slug === "string" &&
    typeof model.displayName === "string" &&
    typeof model.company === "string" &&
    typeof model.modelName === "string" &&
    model.capabilities !== null &&
    typeof model.capabilities === "object"
  );
}

function readCatalogCache(): AdminModel[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAdminModel);
  } catch {
    return [];
  }
}

/** Strip the wire row down to what we render and cache. */
function toAdminModel(row: {
  tier?: "Fast" | "Basic" | "Max" | "Image";
  slug: string;
  displayName: string;
  company: string;
  modelName: string;
  iconSvg?: string;
  capabilities: AdminModel["capabilities"];
  legacy?: boolean;
  createdAt?: number;
}): AdminModel {
  return {
    tier: row.tier,
    slug: row.slug,
    displayName: row.displayName,
    company: row.company,
    modelName: row.modelName,
    iconSvg: row.iconSvg,
    capabilities: row.capabilities,
    legacy: row.legacy,
    createdAt: row.createdAt,
  };
}

/** Cache-then-replace: last known catalog immediately, live rows on arrival. */
function useAdminModels(): AdminModel[] {
  const [cached, setCached] = useState<AdminModel[]>([]);

  /* Read a frame after mount so SSR and hydration never touch storage —
     mirrors lib/name-cache.ts. */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setCached(readCatalogCache());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const live = useQuery(api.models.listEnabled);

  useEffect(() => {
    if (!live) return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(live.map(toAdminModel)));
    } catch {
      // private mode etc. — next visit just loads the slow way
    }
  }, [live]);

  return useMemo(
    () => (live ? live.map(toAdminModel) : cached),
    [live, cached],
  );
}

/* Admin models can't tell us a thinking wheel, only whether reasoning is
   supported at all — so a reasoning-capable one gets the full ladder and
   the rest just carry ["none"]. */
const REASONING_LEVELS: ThinkingLevel[] = ["none", "low", "medium", "high"];
const NO_REASONING: ThinkingLevel[] = ["none"];

function toComposerModel(model: AdminModel): ComposerModel {
  /* A catalog model that paints rides the Image tier's pipeline server-side
     (no thinking, no search) — so it wears the Image tier's composer face
     too: gates blanked, wheel pinned to none. */
  const paints = model.capabilities.imageOutput;
  return {
    key: model.slug,
    name: model.displayName,
    fullName: model.modelName,
    iconSvg: model.iconSvg,
    company: model.company,
    aliases: [
      model.slug,
      model.company.toLowerCase(),
      model.modelName.toLowerCase(),
    ],
    vision: model.capabilities.vision,
    files: model.capabilities.files,
    imageOutput: paints,
    thinkingLevels:
      !paints && model.capabilities.reasoning ? REASONING_LEVELS : NO_REASONING,
    whiteLabel: false,
    autoGates: paints,
    legacy: model.legacy,
  };
}

/** A preset tier entry wearing its admin override: name, icon, company and
 * capabilities from the override; identity (key, gates, badge) unchanged. */
function applyOverride(
  model: (typeof CHAT_MODELS)[number],
  override: AdminModel,
): ComposerModel {
  return {
    ...model,
    name: override.displayName,
    fullName: override.modelName,
    iconSvg: override.iconSvg,
    company: override.company,
    aliases: [
      ...new Set([
        ...model.aliases,
        override.slug,
        override.company.toLowerCase(),
        override.modelName.toLowerCase(),
      ]),
    ],
    vision: override.capabilities.vision,
    files: override.capabilities.files,
    imageOutput: override.capabilities.imageOutput,
    // The Image tier never thinks regardless of what serves it.
    thinkingLevels:
      model.key === "Image"
        ? model.thinkingLevels
        : override.capabilities.reasoning
          ? REASONING_LEVELS
          : NO_REASONING,
  };
}

/**
 * Whether a stored message model key names something that paints — the
 * Image tier or an imageOutput catalog model. A deleted catalog model
 * resolves false, which is fine: finished paints still render via their
 * image attachments.
 */
export function useIsImageModelKey(key: string | undefined): boolean {
  const models = useComposerModels();
  return useMemo(
    () =>
      key !== undefined &&
      models.some((model) => model.key === key && model.imageOutput),
    [models, key],
  );
}

/**
 * The composer's model lineup: exactly the three static text-only modes.
 * Admin catalog/overrides are ignored — the picker never shows provider
 * models. Kept as a hook so callers don't churn.
 */
export function useComposerModels(): ComposerModel[] {
  return useMemo(() => [...CHAT_MODELS], []);
}
