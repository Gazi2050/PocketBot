# Env Files

Where which env lives. `.example` files are committed templates, `.local`
files are gitignored local overrides (see `.gitignore`). Both `.example`
files keep a commented reference block for the other environments — blank
slots, never values.

Backend server secrets never go in a file — set them with
`pnpm exec convex env set NAME value` from `packages/backend`. See
`docs/configuration.md` for the full reference and `docs/self-hosting.md`
for the Clerk JWT template.

### packages/backend/.env.example
```
# Convex CLI pointer — the deployment `convex dev`/`run`/`deploy` talk to.
# Secrets live on each deployment (`convex env set NAME value`), not here.

CONVEX_DEPLOYMENT=dev:your-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site

# --- Deployment env reference -----------------------------------------------
# local
# CLERK_JWT_ISSUER_DOMAIN=
# HYPER_API_KEY=
# SITE_URL=http://localhost:3000
#
# dev
# CLERK_JWT_ISSUER_DOMAIN=
# HYPER_API_KEY=
# SITE_URL=
#
# prod
# CLERK_JWT_ISSUER_DOMAIN=
# HYPER_API_KEY=
# SITE_URL=
```

The deployment also reads `OPENROUTER_API_KEY` (titles, voice, locked chats,
images) and the optional service keys — those live on the deployment too,
listed in [configuration.md](configuration.md).

### packages/backend/.env.local
```
# Gitignored. Your deployment pointer, written by the CLI on first run.
CONVEX_DEPLOYMENT=dev:your-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
```

### apps/v2/.env.example
```
# Web app, local dev. Prod env lives in your host's settings.

NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# --- Prod reference -----------------------------------------------------------
# NEXT_PUBLIC_CONVEX_URL=
# NEXT_PUBLIC_CONVEX_SITE_URL=
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
# CLERK_SECRET_KEY=
# NEXT_PUBLIC_SITE_URL=
# NEXT_PUBLIC_CLERK_PROXY_URL=
```

`NEXT_PUBLIC_CLERK_PROXY_URL` is production-only: it serves Clerk through
your own domain at `/__clerk`. Leave it unset in dev, where the publishable
key's own development instance is used directly.

### apps/v2/.env.local
```
# Gitignored. Copy from .env.example and fill with dev values.
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
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
