import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/e2e/**/*.e2e.test.ts"],
    setupFiles: ["dotenv/config", "tests/setup/vitest.env.ts"],
    environment: "node",
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    hookTimeout: 120_000,
    testTimeout: 120_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
