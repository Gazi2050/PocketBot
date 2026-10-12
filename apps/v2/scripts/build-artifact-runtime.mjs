/* Bundles the artifact sandbox runtime into public/artifact-runtime.js.
 *
 * The sandbox has no network, so the host inlines this file's TEXT into the
 * iframe document. That means it can't be a Next chunk — it has to be one
 * self-contained IIFE with React, Recharts and the Tailwind browser engine
 * baked in. Run via `pnpm --filter v2 build:runtime`; the app's `build` script
 * runs it first, and the committed output keeps `next dev` working without it.
 */

import { readFile, rm } from "node:fs/promises";
import path from "node:path";

import { build } from "esbuild";

const root = path.resolve(import.meta.dirname, "..");
const outdir = path.join(root, "public");
const outfile = path.join(outdir, "artifact-runtime.js");

await rm(outfile, { force: true });

await build({
  entryPoints: [path.join(root, "artifact-runtime", "index.tsx")],
  outfile,
  bundle: true,
  platform: "browser",
  format: "iife",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
});

const bytes = (await readFile(outfile)).byteLength;
console.log(
  `artifact-runtime.js: ${(bytes / 1024).toFixed(0)} KB (${(bytes / 1024 / 1024).toFixed(2)} MB)`,
);
