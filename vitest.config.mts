import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/fixtures/server-only.ts", import.meta.url)),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    include: ["tests/**/*.test.{ts,tsx,mjs}"],
    restoreMocks: true,
  },
});
