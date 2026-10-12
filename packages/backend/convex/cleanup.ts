// One-shot cleanup migration for the removed integrations/MCP/skills feature.
//
// Run it by hand against a deployment:
//   pnpm exec convex run cleanup:purge
// It recursively reschedules itself, processing one bounded page per target
// per run, and stops on its own once every target is exhausted. Delete this
// file once a run has completed.
//
// Targets:
//  - tables with no remaining readers, deleted outright (integrations,
//    mcpServers, mcpOAuthFlows, skills, skillInstalls, customSkills,
//    integrationScanFlows, artifactBindingCache, artifactBindingUsage);
//  - dead fields on tables that stay, unset in place (messages.integrations,
//    messages.skills, htmlArtifacts.bindings, queuedMessages.integrations,
//    queuedMessages.skills).
//
// Pagination carries each table's continueCursor between runs through the
// scheduler args; the first, manual run passes none and starts from the top.
// A cursor is what makes termination and coverage work — re-reading the
// oldest page every time would loop forever on a table whose oldest rows
// never carried the dead fields.

import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const PAGE_SIZE = 500;

const TABLES_TO_DELETE = [
  "integrations",
  "mcpServers",
  "mcpOAuthFlows",
  "skills",
  "skillInstalls",
  "customSkills",
  "integrationScanFlows",
  "artifactBindingCache",
  "artifactBindingUsage",
] as const;

const FIELDS_TO_UNSET = [
  { table: "messages", fields: ["integrations", "skills"] },
  { table: "htmlArtifacts", fields: ["bindings"] },
  { table: "queuedMessages", fields: ["integrations", "skills"] },
] as const;

export const purge = internalMutation({
  args: {
    // Per-table cursor from the previous run. Absent on the manually
    // invoked first run.
    cursors: v.optional(
      v.array(v.object({ table: v.string(), cursor: v.string() })),
    ),
  },
  handler: async (ctx, { cursors }) => {
    const at = new Map((cursors ?? []).map((c) => [c.table, c.cursor]));
    const next: { table: string; cursor: string }[] = [];

    for (const table of TABLES_TO_DELETE) {
      const page = await ctx.db
        .query(table)
        .withIndex("by_creation_time")
        .paginate({ numItems: PAGE_SIZE, cursor: at.get(table) ?? null });
      for (const row of page.page) {
        await ctx.db.delete(row._id);
      }
      if (!page.isDone) next.push({ table, cursor: page.continueCursor });
    }

    for (const { table, fields } of FIELDS_TO_UNSET) {
      const page = await ctx.db
        .query(table)
        .withIndex("by_creation_time")
        .paginate({ numItems: PAGE_SIZE, cursor: at.get(table) ?? null });
      for (const row of page.page) {
        const patch: Record<string, undefined> = {};
        for (const field of fields) {
          if ((row as Record<string, unknown>)[field] !== undefined) {
            patch[field] = undefined;
          }
        }
        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(row._id, patch as Partial<typeof row>);
        }
      }
      if (!page.isDone) next.push({ table, cursor: page.continueCursor });
    }

    if (next.length > 0) {
      await ctx.scheduler.runAfter(0, internal.cleanup.purge, {
        cursors: next,
      });
    }
  },
});
