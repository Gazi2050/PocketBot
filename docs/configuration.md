# Configuration

PocketBot reads its configuration from environment variables in two places:

- **The Convex deployment**, for everything the backend does. Set these with
  `pnpm exec convex env set NAME value` from `packages/backend` (add `--prod` for
  production), or in the Convex dashboard. They never go in a file.
- **The web app** (`apps/v2/.env.local` locally, your host's settings in
  production).

A few secrets have to match on both sides; they're marked _shared_ below.

## The minimum

| Where    | Variable                            | What it's for                                         |
| -------- | ----------------------------------- | ----------------------------------------------------- |
| Convex   | `CLERK_JWT_ISSUER_DOMAIN`           | Your Clerk Frontend API URL, so Convex trusts sign-ins |
| Convex   | `HYPER_API_KEY`                     | Chat turns. All three modes — Auto, Fast, Heavy — run through [Hyper](https://hyper.charm.land/) |
| Convex   | `OPENROUTER_API_KEY`                | Everything around chat: thread titles, voice transcription, locked chats, home suggestions, HTML compaction, image generation |
| Convex   | `SITE_URL`                          | The web app's public origin, for share links, OAuth returns, and emails. Defaults to `http://localhost:3000` |
| Web app  | `NEXT_PUBLIC_CONVEX_URL`            | Your deployment's `.convex.cloud` URL                 |
| Web app  | `NEXT_PUBLIC_CONVEX_SITE_URL`       | Your deployment's `.convex.site` URL                  |
| Web app  | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                                 |
| Web app  | `CLERK_SECRET_KEY`                  | Clerk secret key                                      |
| Web app  | `NEXT_PUBLIC_SITE_URL`              | Public origin for canonical URLs and share cards. Filled in automatically on Vercel |
| Web app  | `NEXT_PUBLIC_CLERK_PROXY_URL`       | Production only: serves Clerk through your own domain at `/__clerk`. Leave unset in dev |

With just these, you get the full chat experience: the three modes (Auto,
Fast, Heavy), artifacts, sharing, folders, locked and incognito chats, and
image generation.

## Optional features

Each of these switches on with its keys. Until then, PocketBot hides the
controls it can't honor instead of letting them fail.

| Feature              | Where  | Variables                                  | Without it                                                          |
| -------------------- | ------ | ------------------------------------------ | ------------------------------------------------------------------- |
| Long-term memory     | Convex | `SUPERMEMORY_API_KEY`                      | Memory stays off                                                    |
| Billing              | Convex | `AUTUMN_SECRET_KEY`                        | Everyone gets every feature, nothing is metered, and plan UI hides |
| Support agent        | Both   | `MEDIAN_KEY`, `MEDIAN_SUPPORT_SECRET` (shared) | The Support menu item hides                                     |
| Kirkify              | Both   | `KIRKIFY_SECRET` (shared)                  | `/kirkify` returns 404 and drops out of the nav and sitemap         |

Web search is retired for now: chat turns run text-only, and no search tool
is wired with or without `EXA_API_KEY`. Leave it unset.

### Billing

Billing runs on [Autumn](https://useautumn.com), with Stripe behind it. If
you set `AUTUMN_SECRET_KEY`, your Autumn account needs these products and
features, because the gates in
[`convex/inference/billing.ts`](../packages/backend/convex/inference/billing.ts)
look them up by id.

**Products**

| Id              | Role                                                    |
| --------------- | ------------------------------------------------------- |
| `mini`, `turbo`, `mega` | The paid plans, smallest to largest             |
| `platinum`, `platinum_max` | The invite-only premium line (`convex/platinum.ts`) |
| `extra_usage`   | A top-up add-on                                         |

**Features**

| Id                               | Type                | Role                                           |
| -------------------------------- | ------------------- | ---------------------------------------------- |
| `messages`                       | Metered, count      | The free plan's message allowance              |
| `usage`                          | Metered, USD        | The paid plans' shared usage pool              |
| `extra_usage`                    | Metered, USD        | The top-up balance, drawn after `usage`        |
| `ai_cost`, `search`              | Metered, USD        | What turns and searches deduct from the pool   |
| `basic`, `pro`, `max`            | Boolean             | Plan entitlements (any one means "paid")       |

The pricing page reads its plans from Autumn, so names, prices, and
allowances are yours to set.

## Observability

All optional, all off by default.

| Service      | Where   | Variables                                                         |
| ------------ | ------- | ----------------------------------------------------------------- |
| PostHog      | Web app | `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`  |
| PostHog      | Convex  | `POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST`, `POSTHOG_LLM_PRIVACY_MODE` |
| Axiom        | Web app | `AXIOM_TOKEN`, `AXIOM_DATASET`                                    |
| Axiom        | Convex  | `AXIOM_TOKEN`, `AXIOM_DATASET`, `AXIOM_HOST`                      |
| Braintrust   | Convex  | `BRAINTRUST_API_KEY`, plus `BRAINTRUST_PROJECT_ID` or `BRAINTRUST_PROJECT_NAME` (default `PocketBot`) |

Set `POSTHOG_LLM_PRIVACY_MODE=true` to keep prompt and reply text out of
PostHog's LLM analytics events.

### The free-tier overload throttle

When billing is on, PocketBot can tighten free users' daily message cap while
free traffic is expensive. It reads today's free-tier spend from a saved
PostHog endpoint:

| Variable                     | Value                                                          |
| ---------------------------- | -------------------------------------------------------------- |
| `POSTHOG_PERSONAL_API_KEY`   | A personal API key with read access                            |
| `POSTHOG_FREE_COST_ENDPOINT` | The endpoint's `/run` URL, returning today's free spend in USD |

Leave either unset and the throttle never engages.

## Email

| Variable               | Where  | What it's for                                                        |
| ---------------------- | ------ | -------------------------------------------------------------------- |
| `RESEND_API_KEY`       | Convex | Sending through [Resend](https://resend.com)                         |
| `RESEND_FROM_EMAIL`    | Convex | The sender, on a domain verified in Resend, like `PocketBot <hello@your-domain>` |
| `RESEND_AUDIENCE_ID`   | Convex | The audience new sign-ups are added to                               |
| `CLERK_WEBHOOK_SECRET` | Convex | Verifies Clerk's webhook at `https://<name>.convex.site/api/clerk-webhook` |

## Deployment

| Variable                 | Where   | What it's for                                                                  |
| ------------------------ | ------- | ------------------------------------------------------------------------------ |
| `VERCEL_WEBHOOK_SECRET`  | Convex  | Verifies Vercel's deploy webhook at `/api/deploy-hook`, which prompts open tabs to refresh after a release |
| `GIT_COMMIT_SHA`         | Web app | The build's version, for that same prompt. Vercel provides its own              |
| `DEV_ALLOWED_ORIGINS`    | Web app | Extra hosts allowed to reach the dev server, comma-separated            |

Older deployments may still set the site origin as `POCKETBOT_SITE_URL`,
`APP_ORIGIN`, or `CLIENT_ORIGIN`. Those keep working, but `SITE_URL` wins
when it's set.

## Other apps

**Mobile** (`apps/mobile/.env.local`)

| Variable                            | What it's for                     |
| ----------------------------------- | --------------------------------- |
| `EXPO_PUBLIC_CONVEX_URL`            | Same deployment as the web app    |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Same Clerk instance               |
| `EXPO_PUBLIC_SITE_URL`              | The web app's origin, for share links |

