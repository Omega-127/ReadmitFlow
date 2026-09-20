/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate browser APIs (localStorage, DOM)
    environment: "jsdom",
    globals: true,
    setupFiles: ["./setup.ts"],
    include: ["tests/frontend/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "frontend/components/**",
        "frontend/lib/**",
        "frontend/hooks/**",
      ],
      exclude: ["frontend/app/**", "frontend/public/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../frontend"),
    },
  },
});
