import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@background": resolve(__dirname, "src/background"),
      "@content": resolve(__dirname, "src/content"),
      "@popup": resolve(__dirname, "src/popup"),
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/vite-env.d.ts", "src/popup/**"],
    },
  },
});
