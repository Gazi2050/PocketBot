# PocketBot — AI Providers & Plans

> Last verified: 2026-10-05. Model choices come from live strict testing of
> every free catalog on Oct 4–5, 2026 (scores inline in section 2). If code and this
> file disagree, fix one of them deliberately — never drift.

PocketBot is a two-plan AI chat platform on the PocketBot codebase. One rule
shapes everything: **users see modes, never models.** They compare limits and
capabilities — where PocketBot wins — never model names.

**Free** — genuinely useful at $0: text chat, image reading, voice input,
document reading. One mode (Auto), 15 messages/day.
**Premium $10/mo** — everything Free has, plus spoken replies, search,
thinking levels, Fast + Heavy modes, and 4× limits.

At launch every AI call runs on **free tiers** — total cost ≈ the domain
(~$1/mo). See section 4 for what changes and when.

---

## 1. Plans & capabilities

| Capability | Free | Premium $10/mo |
| ---------- | ---- | -------------- |
| Text chat | ✅ Auto only | ✅ Auto + **Fast** + **Heavy** |
| Image — read (photos, screenshots) | ✅ | ✅ better (Heavy's vision) |
| Image — generate | ❌ | ⏳ ships when Gemini billing is enabled (section 4) |
| Voice input (mic → text) | ✅ 10 min/day | ✅ 60 min/day |
| Spoken replies (read-aloud / TTS) | ❌ | ✅ 20/day |
| Docs — read by text extraction (PDF/DOCX/CSV) | ✅ 5 MB / 50 pages | ✅ 25 MB |
| Docs — OCR (scanned PDFs) | ❌ → upsell | ✅ via Heavy vision |
| Web search | ❌ | ✅ 10/day |
| Thinking levels | ❌ | ✅ in Heavy |
| Messages / day | 15 | 60 |

Daily caps are product design: each free limit is a paywall moment, each
premium quality jump is felt side-by-side in the same UI.

---

## 2. Routing — what serves what

Fallback fires on: `429`, `503 get_channel_failed`, an **empty `content`**
field, or a mid-stream `finish_reason: "error"` (full rules in section 5). Chains try
slots top-down.

### 2.1 Auto — free chat (everyone, both plans)

| Slot | Model | Provider | Evidence |
| ---- | ----- | -------- | -------- |
| 1 | `gpt-4o:free` | UnoRouter | 10/10 strict, 2–3 s |
| 2 | `gemini-3.6-flash:free` | UnoRouter | 9.5/10; vision-capable (see 2.4) |
| 3 | `glm-5.3:free` | UnoRouter | strong; ~45 s on a cold first call |
| 4 | `nemotron-3-ultra-550b-a55b:free` | UnoRouter | 9/10; occasional capacity flakes |

### 2.2 Fast — premium

| Slot | Model | Provider | Notes |
| ---- | ----- | -------- | ----- |
| 1 | `openai/gpt-oss-120b` | Groq | ~500 tok/s; free: 30 RPM / 1K RPD / 200K TPD |
| 2 | `openai/gpt-oss-20b` | Groq | ~1000 tok/s; separate TPD pool |

Groq's free per-model TPD ≈ 30–60 full-context turns/day per model — enough
for Fast at 10 users. If it outgrows: Groq Developer pay-as-you-go at
~$0.0013/turn, no code change.

### 2.3 Heavy — premium

| Slot | Model | Provider | Notes |
| ---- | ----- | -------- | ----- |
| 1 | `gemini-3.8-flash` | Gemini — **free tier at launch**, paid after the trigger in section 4 | thinking levels on |
| 2 | `glm-5.3:free` | UnoRouter | free overflow when the Gemini pool 429s |

Paid pricing (when billing is on): $0.75/M in, $3.75/M out — promo through
Dec 31 2026, doubles after. Model ids and prices live in config, never
hardcoded; the Jan 2027 contingency is `gemini-3.1-flash-lite` (~4× cheaper).

### 2.4 Vision & documents (reading)

| Input | Free | Premium |
| ----- | ---- | ------- |
| Image | Auto slot 2 (`gemini-3.6-flash:free`) → `llama-4-maverick:free` | Heavy — best-in-class vision |
| Digital PDF / DOCX / CSV | `@firecrawl/anydoc` extracts text at upload → any Auto model | same, then Heavy for reasoning |
| Scanned PDF | ❌ — detection: extraction returns near-empty text → "Premium reads scans" | Heavy vision reads scans natively (**this is the OCR** — no OCR service in the stack) |

A PDF counts as "scanned" only when extraction yields near-zero text — that
check decides whether OCR is needed, not the user.

### 2.5 Generation — premium

- **Images: deferred at launch.** `gemini-3.1-flash-lite-image` (Nano Banana
  Lite, $0.0336 per 1K image) is paid-only — it ships the day billing is
  enabled. Cap 60/month per user.
- **Read-aloud (TTS): live at launch.** `gemini-3.8-flash-lite-tts` —
  available on Gemini's **free tier** ($0.0015/10 s once paid). Cap 20/day.
  ⚠ verify Bengali voice quality before advertising it (section 8).

### 2.6 Voice input — everyone

| Slot | Model | Provider | Why |
| ---- | ----- | -------- | --- |
| 1 | `whisper-large-v3-turbo` | Groq | 20 RPM / 2K RPD / 400K audio-sec/hr free — built for mic bursts |
| 2 | `whisper-large-v3-turbo:free` | UnoRouter | backup only (Uno free = 1 req/min shared) |

Same model both pipes; Groq's quota is why it is primary.

### 2.7 Search — premium

- **Launch:** `gemini-2.5-flash` with Search grounding — the only Gemini
  family with a **free grounding allowance (500 requests/day)**. Cap
  10/day/user keeps 10 users inside it. Gemini 3.x grounding has no free
  tier — do not route launch search there.
- **After billing ON:** `gemini-3.8-flash` grounding — 5,000/month free
  (shared), then $14/1K. Cap rises to 15/day.

### 2.8 Invisible jobs (both plans)

| Job | Model | Provider |
| --- | ----- | -------- |
| Thread titles, compaction | `gpt-oss-20b` | Groq (tiny tokens, effectively free) |
| Quota counters | — | Convex (no LLM) |

---

## 3. Provider stack

Three AI providers plus payments. Chat endpoints are OpenAI-compatible
except Gemini (native API for TTS / grounding / images).

| Provider | Env var (Convex) | Endpoint | Jobs | Cost |
| -------- | ---------------- | -------- | ---- | ---- |
| UnoRouter | `UNOROUTER_API_KEY` | `https://api.unorouter.com/v1` | Auto chain, free vision, whisper backup | $0 |
| Groq | `GROQ_API_KEY` | `https://api.groq.com/openai/v1` | Fast, voice input, titles | $0 |
| Gemini | `GEMINI_API_KEY` | `https://generativelanguage.googleapis.com` | Heavy, TTS, search grounding, (images after billing) | $0 launch → usage |
| Creem | `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET` (Convex) · `NEXT_PUBLIC_CREEM_CHECKOUT_URL` (web) | — | $10/mo subscriptions | 3.9% + $0.40/sub |

**Payments:** Creem is merchant of record (global VAT handled). Upgrade →
Creem checkout with `metadata: { userId }` → webhook at `/api/creem-webhook`
(verify `creem-signature` HMAC-SHA256 over the **raw body**; idempotent —
Creem retries 5× and resends) → sets `users.plan = "premium"`.
`subscription.canceled` / `expired` → `"free"` respecting `current_period_end`.

**Hosting:** backend, DB, files, crons, HTTP routes on **Convex Free** (1M
calls/mo, 20 GB-h actions, 0.5 GB DB — ~2× headroom at 10 users). The Next.js
app cannot run on Convex: Cloudflare Workers (free, commercial-OK) or a
~$4/mo VPS. Vercel Hobby is non-commercial by ToS — testing only.

---

## 4. Launch phase: $0 cost

Every premium capability runs on Gemini's **free tier** until a trigger
fires. Total launch cost ≈ the domain. Three caveats, stated plainly:

1. **No image generation until billing is ON** (Nano Banana is paid-only).
   Do not substitute free SDXL models — 2022-class quality (tested, rejected).
2. **Search uses `gemini-2.5-flash` grounding** (500/day free), never 3.x.
3. **The privacy claim is deferred.** Gemini free tier may use content to
   improve Google products; "Premium = never trained on" becomes true only
   on the paid tier. Until then marketing may reference architecture (locked
   chats, encryption), never provider training.

**Enable Gemini billing when ANY of:**

| Trigger | Unlocks |
| ------- | ------- |
| Free-tier 429 reaches a user twice in one week | paid rate limits |
| First paying subscriber | privacy claim + image generation |
| Users ask for image generation | Nano Banana + 3.x search |

Billing setup: **dedicated GCP project** (Gemini limits are per project),
budget alert at $50. Expected cost after switch: ~$3/user/mo (section 7).

---

## 5. Error handling — uniform rules

| Case | Action |
| ---- | ------ |
| `429` | honor `Retry-After` if present → next model in chain |
| `503` + `get_channel_failed` | retryable → next model |
| `503` + `model_not_found` | hard error, never retried |
| `400` | never retried; readable message |
| `413` (trial size cap) | trim context / route to a slot without the cap |
| Empty `content` in a 200 | treat as failure → next model (measured failure mode) |
| Mid-stream SSE `finish_reason: "error"` | PocketBot watchdog settles the turn; retry applies |

Free-tier shapes to design against: UnoRouter **1 req/min per model per
account** (all users share one key) + per-user concurrency cap; Groq
per-model RPM/RPD/TPD; Gemini per-project limits resetting **midnight
Pacific** (user counters reset UTC — the usage bar absorbs the skew).

---

## 6. Quotas (server-enforced)

Counters in Convex, denormalized per user per UTC day (never
`collect().length`). The inference preflight checks them before any provider
call; a hit produces a friendly notice with reset time (existing
`resetNotices` pattern), never a raw error.

| Resource | Free | Premium |
| -------- | ---- | ------- |
| Messages / day | 15 | 60 |
| Heavy answers / day | — | 15 |
| Search / day | — | 10 → 15 post-billing |
| Read-aloud / day | — | 20 |
| Voice input / day | 10 min | 60 min |
| Attachments | 5 MB / 50 pages | 25 MB |
| Generated images / month | — | 60 (when shipped) |

---

## 7. Cost & margin

**Launch: $0.** Post-billing economics, pre-computed so the switch needs no
new math — per premium user / month:

| Item | Typical | Maxed-out |
| ---- | ------- | --------- |
| Heavy (~8/day) | $1.68 | $3.15 (15/day cap) |
| Images (~15/mo) | $0.51 | $2.02 (60/mo cap) |
| TTS (~5/day × 30 s) | $0.68 | $2.70 (20/day cap) |
| Fast / Auto / voice / search | $0 | $0 |
| Creem fee | $0.79 | $0.79 |
| **All-in** | **~$3.70** | **~$8.70** |

| Mix (10-user target) | Revenue | Costs | Profit | Margin |
| -------------------- | ------- | ----- | ------ | ------ |
| 10 free, 0 premium | $0 | ~$1–5 | ≈ −$5 | — |
| 3 premium | $30 | ~$12 | ~$18 | 60% |
| 5 premium | $50 | ~$20 | ~$30 | 60% |
| 10/10 premium | $100 | ~$38 | ~$62 | 62% |

Break-even: **1 subscriber.** Free users are $0-marginal marketing.

---

## 8. Day-1 verification

- [ ] UnoRouter per-account concurrency: 3 parallel `gpt-4o:free` calls
- [ ] `gemini-3.6-flash:free` accepts image input through UnoRouter (fallback
      if not: `llama-4-maverick:free`)
- [ ] Gemini free-tier RPM/RPD for `gemini-3.8-flash` + `flash-lite-tts` from
      the AI Studio dashboard — record real numbers here
- [ ] Bengali TTS quality through `flash-lite-tts`
- [ ] Groq whisper RPM on this org's limits page
- [ ] Creem test-mode checkout flips `users.plan` end-to-end

---

*Follow-ups (separate tasks): add the new env vars to
`docs/configuration.md` when the build lands; rebrand pass for `README.md`
and `apps/v2/lib/site.ts` (PocketBot → PocketBot).*
