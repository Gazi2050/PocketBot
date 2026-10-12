import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      /* convex-test simulates the Convex runtime inside edge-runtime. */
      {
        test: {
          name: "convex",
          environment: "edge-runtime",
          include: ["convex/slots/**/*.test.ts"],
        },
      },
      /* Plain unit tests over convex source; node env matches the runtime
         these tests target. */
      {
        test: {
          name: "unit",
          include: ["tests/**/*.test.ts", "convex/*.test.ts"],
        },
      },
    ],
  },
});
