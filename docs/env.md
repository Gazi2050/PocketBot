# Env Files

Where which env lives. `.example` files are committed templates, `.local` files are gitignored local overrides (see `.gitignore`).

Backend server secrets never go in a file — set them with `bunx convex env set NAME value` from `packages/backend`. See `docs/configuration.md` for the full reference and `docs/self-hosting.md` for the Clerk JWT template.

### packages/backend/.env.example
```
# Deployment used by `bunx convex dev` (written automatically on first run).
CONVEX_DEPLOYMENT=dev:your-deployment

# Set on the Convex deployment itself, listed here so you know what the backend reads:
# Required: CLERK_JWT_ISSUER_DOMAIN, OPENROUTER_API_KEY, SITE_URL
# Optional: MCP_ENCRYPTION_KEY, EXA_API_KEY, SUPERMEMORY_API_KEY,
# AUTUMN_SECRET_KEY, COMPOSIO_API_KEY,
# POSTHOG_PROJECT_TOKEN, POSTHOG_HOST, POSTHOG_LLM_PRIVACY_MODE,
# POSTHOG_PERSONAL_API_KEY, POSTHOG_FREE_COST_ENDPOINT,
# BRAINTRUST_API_KEY, BRAINTRUST_PROJECT_ID, BRAINTRUST_PROJECT_NAME,
# AXIOM_TOKEN, AXIOM_DATASET, AXIOM_HOST,
# CLERK_WEBHOOK_SECRET, RESEND_API_KEY, RESEND_AUDIENCE_ID, RESEND_FROM_EMAIL,
# VERCEL_WEBHOOK_SECRET, MEDIAN_KEY, MEDIAN_SUPPORT_SECRET, KIRKIFY_SECRET
```

### packages/backend/.env.local
```
# Gitignored. Your Convex dev deployment pointer.
CONVEX_DEPLOYMENT=dev:your-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
```

### apps/v2/.env.example
```
# Required: Convex deployment + Clerk + public origin.
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_SITE_URL=https://your-domain

# Optional: NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, NEXT_PUBLIC_POSTHOG_HOST,
# AXIOM_TOKEN, AXIOM_DATASET, MEDIAN_KEY, MEDIAN_SUPPORT_SECRET,
# KIRKIFY_SECRET, GIT_COMMIT_SHA, DEV_ALLOWED_ORIGINS
```

### apps/v2/.env.local
```
# Gitignored. Copy from .env.example and fill with dev values.
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### apps/console/.env.example
```
# Same Convex deployment + Clerk instance as apps/v2.
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
# VITE_APP_URL=https://your-domain
# VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
# VITE_POSTHOG_HOST=https://us.i.posthog.com
# DEV_ALLOWED_ORIGINS=my-laptop.local
```

### apps/console/.env.local
```
# Gitignored. Same deployment + Clerk as apps/v2.
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_APP_URL=http://localhost:3000
```

### apps/mobile/.env.example
```
# Same Convex deployment + Clerk instance as apps/v2.
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_SITE_URL=https://your-domain
```

### apps/mobile/.env.local
```
# Gitignored. Same deployment + Clerk as apps/v2.
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_SITE_URL=http://localhost:3000
```

### apps/waitlist/.env.example
```
# Resend only. No .env.local committed.
RESEND_API_KEY=
RESEND_AUDIENCE_ID=
```
