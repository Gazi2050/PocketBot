import type { Infer } from "convex/values";
import { PersistentTextStreaming } from "@convex-dev/persistent-text-streaming";

import { components, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type {
  attachmentValidator,
  sendOptionsValidator,
} from "./validators";

/* Starting a reply, and asking whether one is in flight.

   Two callers write a user turn: sendUserMessage (the composer) and the
   message queue (a turn that waited its turn). They share the writes here
   so a queued message starts its reply exactly the way a typed one does —
   same rows, same stream, same scheduled action. */

const persistentTextStreaming = new PersistentTextStreaming(
  components.persistentTextStreaming,
);

export type SendOptions = Infer<typeof sendOptionsValidator>;
export type SendAttachment = Infer<typeof attachmentValidator>;

const RUNNING_STATUSES = new Set(["thinking", "searching", "streaming"]);

/** True while the thread's newest assistant turn is still being written. */
export async function isThreadRunning(
  ctx: QueryCtx | MutationCtx,
  threadId: Id<"threads">,
): Promise<boolean> {
  const latest = await latestAssistantMessage(ctx, threadId);
  return latest !== null && RUNNING_STATUSES.has(latest.status ?? "");
}

export async function latestAssistantMessage(
  ctx: QueryCtx | MutationCtx,
  threadId: Id<"threads">,
): Promise<Doc<"messages"> | null> {
  return await ctx.db
    .query("messages")
    .withIndex("by_thread_role", (q) =>
      q.eq("threadId", threadId).eq("role", "assistant"),
    )
    .order("desc")
    .first();
}

/** The sender's display name for the prompt. Read while there is an
 *  identity to read it from — a scheduled action has none. */
export async function displayNameFromIdentity(
  ctx: MutationCtx,
): Promise<string | undefined> {
  const identity = await ctx.auth.getUserIdentity();
  const name =
    [identity?.givenName, identity?.familyName].filter(Boolean).join(" ") ||
    identity?.name ||
    undefined;
  return typeof name === "string" && name !== "" ? name : undefined;
}

// Kick off the server-driven turn for a freshly minted stream. Generation
// runs in a scheduled action from here on (W-134) — the sender's tab merely
// watches the reactive stream query — so a turn survives whatever happens to
// the tab that asked for it.
export async function scheduleAssistantTurn(
  ctx: MutationCtx,
  {
    streamId,
    userId,
    userName,
  }: { streamId: string; userId: string; userName?: string },
) {
  await ctx.scheduler.runAfter(0, internal.inference.runAssistantTurn, {
    streamId,
    userId,
    ...(userName !== undefined ? { userName } : {}),
  });
}

/**
 * Write a user turn into a thread that already exists and start its reply:
 * the user row, an empty assistant row on a fresh stream, and the scheduled
 * action. The caller has already checked ownership and the lock, resolved
 * the model, and touched the thread's `updatedAt`.
 */
export async function appendUserTurn(
  ctx: MutationCtx,
  {
    threadId,
    userId,
    content,
    attachments,
    options,
    model,
    userName,
    now,
  }: {
    threadId: Id<"threads">;
    userId: string;
    content: string;
    attachments: SendAttachment[] | undefined;
    options: SendOptions | undefined;
    model: string;
    userName: string | undefined;
    now: number;
  },
) {
  const status = options?.thinking ? "thinking" : "streaming";
  const streamId = await persistentTextStreaming.createStream(ctx);

  const userMessageId = await ctx.db.insert("messages", {
    threadId,
    userId,
    role: "user",
    content,
    createdAt: now,
    updatedAt: now,
    attachments,
  });

  const assistantId = await ctx.db.insert("messages", {
    threadId,
    userId,
    role: "assistant",
    content: "",
    createdAt: now + 1,
    updatedAt: now + 1,
    status,
    phases: [],
    streamId,
    model,
    thinking: options?.thinking ?? false,
    search: options?.search ?? false,
  });

  await scheduleAssistantTurn(ctx, { streamId, userId, userName });

  return { userMessageId, assistantId, streamId };
}
