import { ConvexError } from "convex/values";

/* Human-readable text for a failed mutation or action. Prefers the server's
   own sentence (ConvexError carries it as `data`), then the first line of a
   client-side Error, then the caller's fallback. */
export function errorText(error: unknown, fallback: string): string {
  if (error instanceof ConvexError && typeof error.data === "string") {
    return error.data;
  }
  if (error instanceof Error && error.message) {
    const raw = error.message;
    const marker = raw.lastIndexOf("Uncaught Error: ");
    const message =
      marker >= 0 ? raw.slice(marker + "Uncaught Error: ".length) : raw;
    const line = message.split("\n")[0]?.trim();
    if (line && !line.startsWith("[CONVEX") && line !== "Server Error") {
      return line;
    }
  }
  return fallback;
}
