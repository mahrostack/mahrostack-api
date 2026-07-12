import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/e2e/**/*.e2e.test.ts"],
    setupFiles: ["tests/setup/vitest.env.ts"],
    environment: "node",
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
