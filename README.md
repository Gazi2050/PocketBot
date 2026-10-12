<p align="center">
  <img src="brand/png/pocketbot-3d-2048.png" alt="PocketBot" width="180" />
</p>

<h1 align="center">PocketBot</h1>

<p align="center">
  The open-source AI platform that sweats the details. Three smart modes, real memory,<br />
  living artifacts, and locked chats — yours to run, yours to shape.
</p>

<p align="center">
  <a href="https://pocketbott.vercel.app">PocketBot</a> ·
  <a href="docs/self-hosting.md">Self-hosting</a> ·
  <a href="docs/architecture.md">Architecture</a> ·
  <a href="docs/configuration.md">Configuration</a>
</p>

---

Open to run, open to shape. Use PocketBot live at
[pocketbot](https://pocketbott.vercel.app), or clone it and shape
it your way — your keys, your deployment, your rules. The whole stack ships
under the MIT license — web app and backend today; the **mobile app is under
active development and coming soon**.

## Features

- **Three chat modes** — Auto, Fast, and Heavy — with the model choice handled
  for you. No provider names, no thinking dials, nothing to tune.
- **Living artifacts:** documents, charts, and full interactive pages that
  stay editable in a side panel and can be shared by link.
- **Long-term memory** that carries preferences and projects across chats.
- **Locked chats**, encrypted on your device with a password the server never
  sees, answered only by zero-retention models.
- **Incognito mode**, message queueing, voice input, image generation, file
  attachments, folders, sharing, and a lot of care around motion and polish.
- **Light and dark mode**, accent colors, and an installable mobile web app.

## Tech stack

| Layer     | What it uses                                                         |
| --------- | -------------------------------------------------------------------- |
| Web app   | [Next.js 16](https://nextjs.org), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Motion](https://motion.dev/) |
| Backend   | [Convex](https://convex.dev): database, functions, streaming, crons  |
| Auth      | [Clerk](https://clerk.com)                                           |
| Models    | [AI SDK](https://ai-sdk.dev) on [Hyper](https://hyper.charm.land/)   |
| Tooling   | [pnpm](https://pnpm.io) workspaces, [TypeScript](https://www.typescriptlang.org/) |

Everything beyond Convex, Clerk, and Hyper is **optional** and switches on
with its own keys: billing (Autumn), memory (Supermemory), analytics
(PostHog, Axiom), tracing (Braintrust), email (Resend), and the support
agent (Median). Leave them out and PocketBot hides the features they power.
See [docs/configuration.md](docs/configuration.md).

## Quick start

You'll need [pnpm](https://pnpm.io), a free [Convex](https://convex.dev)
account, a [Clerk](https://clerk.com) application, and a
[Hyper](https://hyper.charm.land/) API key.

```sh
git clone https://github.com/pocketbot/pocketbot.git
cd pocketbot
pnpm install
```

**1. Push the backend.** The first run creates your Convex project:

```sh
cd packages/backend
pnpm exec convex dev
```

**2. Give it its secrets.** In a second terminal, while the first one keeps
watching:

```sh
pnpm exec convex env set CLERK_JWT_ISSUER_DOMAIN https://your-instance.clerk.accounts.dev
pnpm exec convex env set HYPER_API_KEY sk-hyper-...
```

**3. Point the web app at Convex and Clerk.**

```sh
cd ../../apps/v2
cp .env.example .env.local   # then fill in the four values
```

**4. Run it**, from the repository root:

```sh
cd ../..
pnpm dev
```

Open [localhost:3000](http://localhost:3000) and say hi. The
[self-hosting guide](docs/self-hosting.md) covers each step in detail,
including the Clerk JWT template Convex needs and how to deploy to
production.

## Repository layout

```
apps/
  v2/         The web app (Next.js). This is the one in production.
  mobile/     Native app (Expo) — under active development, coming soon.
packages/
  backend/    Convex backend: schema, functions, and the AI pipeline
docs/         Guides for self-hosting, configuration, and architecture
brand/        Logo, colors, banners, and app icons
```

## Documentation

- [Self-hosting](docs/self-hosting.md): run PocketBot locally and in production
- [Configuration](docs/configuration.md): every environment variable and
  what it switches on
- [Architecture](docs/architecture.md): how a message travels from the
  composer to the model and back
