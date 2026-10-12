# Architecture

A tour of how PocketBot fits together, for anyone about to change it.

## The pieces

```
┌────────────────────┐   queries, mutations    ┌──────────────────────────┐
│  apps/v2 (Next.js) │ ◀─────── websocket ───▶ │  packages/backend        │
│  React 19 client   │                         │  (Convex)                │
└────────┬───────────┘                         │                          │
         │ sign-in                             │  schema + functions      │
┌────────▼───────────┐   JWT (template         │  scheduled AI actions    │
│       Clerk        │ ──── "convex") ───────▶ │  HTTP routes, crons      │
└────────────────────┘                         └────────────┬─────────────┘
                                                            │
                          Hyper (chat models) · OpenRouter (aux models,
                          images) · Supermemory (memory) · Autumn (billing)
```

- **`apps/v2`** is the web app. Pages are thin; nearly all state is live
  Convex queries, so every open tab updates the moment the backend does.
- **`packages/backend`** holds the Convex schema (`convex/schema.ts`) and
  every query, mutation, action, HTTP route, and cron. The apps import its
  generated bindings from `@pocketbot/backend/convex/_generated/api`.
- **`apps/console`** is the admin console, talking to the same deployment.
  Admin-only functions check the Clerk `role` claim (`convex/admin.ts`).

## How a message travels

1. **Send.** The composer calls the `messages.sendUserMessage` mutation. It
   writes the user's message and an empty assistant message, opens a text
   stream, and schedules `inference.runAssistantTurn` to start immediately
   (`convex/turns.ts`).
2. **Preflight.** The action (`convex/inference/stream.ts`) checks the
   deployment's configuration, the user's plan and gates (when billing is
   on), and the free-tier overload throttle. A failure here settles the
   message with a readable error instead of leaving it spinning.
3. **Prompt.** It assembles the system prompt (`convex/prompts.ts`), thread
   history (compacted when long, `convex/threadCompaction.ts`), attachments,
   memory context, and the tools this turn can use.
4. **Generate.** The AI SDK's `streamText` runs against Hyper. Text
   deltas are appended to the stream in batches; tool calls (charts,
   documents, HTML and React artifacts, history search, weather, image
   generation) record **phases** on the assistant message, which the client
   renders as live activity rows. The lineup is exactly three text-only
   modes — Auto, Fast, Heavy (`MODEL_IDS` in `convex/inference/billing.ts`);
   any stale model pick from history folds into Auto at request time.
5. **Watch.** Every open tab subscribes to `messages.getStreamBody` and
   `messages.listForThread`, so the reply streams into all of them at once,
   whichever tab sent it.
6. **Finalize.** `convex/inference/finalize.ts` records token counts and
   cost, charges usage through the ledger (`convex/usageLedger.ts`), stores
   the turn in memory, names new threads, and starts the next queued message
   if there is one (`convex/messageQueue.ts`).

If the action dies mid-turn, nothing would ever mark the message finished.
The live handler stamps a heartbeat about every 25 seconds, and the
`streamWatchdog` cron settles any turn that stops beating: partial text
becomes a stopped reply, an empty one becomes a retryable error.

## Locked chats

Locked chats are encrypted in the browser with a key derived from the user's
password; the server stores ciphertext it can't read. Because the server
can't build the prompt, the tab does: it decrypts the history, sends it to
the `/locked-stream` HTTP route (`convex/lockedInference.ts`), and encrypts
the reply as it streams back. Only models OpenRouter reports as zero
retention are allowed (`convex/zeroRetention.ts`, `convex/lockedPolicy.ts`).

## Artifacts

Replies can produce **documents**, **charts**, and **HTML or React pages**
that open in a side panel and stay editable.

- Metadata lives in `documents` and `htmlArtifacts`; the bodies live in
  side tables (`documentContents`, `htmlArtifactContents`) so list queries
  stay small.
- React artifacts are compiled by the host page with Sucrase and run inside a
  sandboxed, CSP-locked `/artifact-frame` route, never `srcdoc`.
- An artifact can read live data from the user's integrations only through
  declared bindings the host runs (`convex/artifactData.ts`). There is no
  general-purpose call channel out of the frame.

## Retired: integrations and skills

Integrations (MCP servers) and skills used to ride into turns as tools —
`mcp_list_tools`/`mcp_call_tool` and `load_skill` — but chat no longer wires
them. Their tables, admin surfaces, and helpers (`convex/inference/mcp.ts`,
`convex/skillStore.ts`, `convex/customSkills.ts`) remain so history keeps
rendering, and a fresh turn never sees them. Web search is retired the same
way: the Exa helpers in `convex/inference/search.ts` and
`convex/inference/webFetch.ts` are no longer handed to a turn.

## Optional services

`convex/features.ts` reports which optional services the deployment has keys
for, and the web app hides what it can't use (`apps/v2/lib/deployment-features.ts`).
On the backend, each integration degrades on its own terms:

| Missing          | Behaviour                                                          |
| ---------------- | ------------------------------------------------------------------ |
| Autumn           | Everyone is treated as paid; no gates, no deductions (`createBillingClient` in `convex/inference/billing.ts`) |
| Supermemory      | Memory stays off                                                   |
| PostHog, Axiom, Braintrust | Instrumentation becomes a no-op                          |

## Background jobs

Defined in `convex/crons.ts`:

| Job                               | Why                                                    |
| --------------------------------- | ------------------------------------------------------ |
| Reap dead assistant turns         | Settles replies whose action stopped heartbeating      |
| Settle pending usage charges      | Retries billing charges Autumn didn't confirm          |
| Refresh free-user server load     | Feeds the free-tier overload throttle                  |
| Refresh zero-retention models     | Keeps the locked-chat model list current               |
| Categorize store listings         | Sorts new integrations and skills into store sections  |
| Sweep Kirkify counters            | Clears old daily quotas                                |

## Front-end conventions

- **Instant paint.** Lists render from a localStorage cache first and are
  replaced by the live query when it lands, so repeat visits never show a
  skeleton.
- **One shell, two faces.** The chat and settings/store views are both kept
  mounted in `AppShell` and slide between each other; the URL decides which
  is showing.
- **Long-lived tabs.** Tabs stay open for hours, so every listener, timer,
  and module-level cache has a teardown or eviction path. Leaks are bugs.
- **Motion** lives in `apps/v2/lib/motion.ts`: one shared entrance, blur
  that's always handed back as `filter: none`, and a raster pin that stops
  the one-pixel snap at the end of transforms.
