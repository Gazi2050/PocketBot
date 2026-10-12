import { httpRouter } from "convex/server";

import { clerkWebhook } from "./clerk";
import { vercelDeployHook } from "./deployment";
import { streamAssistant, streamAssistantOptions } from "./inference";
import {
  streamLockedTurn,
  streamLockedTurnOptions,
} from "./lockedInference";

const http = httpRouter();

http.route({
  path: "/assistant-stream",
  method: "POST",
  handler: streamAssistant,
});

// Locked threads generate in the tab that holds the key, so this one really
// is client-anchored: the browser POSTs its opened transcript and reads the
// reply back down the same connection. Nothing about the turn is stored on
// the way through. See convex/lockedInference.ts.
http.route({
  path: "/locked-stream",
  method: "POST",
  handler: streamLockedTurn,
});

http.route({
  path: "/locked-stream",
  method: "OPTIONS",
  handler: streamLockedTurnOptions,
});

// Vercel deployment webhook → records the live production version so clients
// get pushed an "update available" prompt.
http.route({
  path: "/api/deploy-hook",
  method: "POST",
  handler: vercelDeployHook,
});

http.route({
  path: "/assistant-stream",
  method: "OPTIONS",
  handler: streamAssistantOptions,
});

// Clerk webhook → syncs newly-created users into a Resend audience. Verifies
// the Svix signature before acting.
http.route({
  path: "/api/clerk-webhook",
  method: "POST",
  handler: clerkWebhook,
});

export default http;
