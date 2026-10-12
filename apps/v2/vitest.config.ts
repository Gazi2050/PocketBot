import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.?(c|m)[jt]s", "components/**/*.test.?(c|m)[jt]s"],
  },
});
