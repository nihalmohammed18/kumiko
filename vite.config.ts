import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, type TestProjectInlineConfiguration } from "vitest/config";

type Mode = "light" | "dark" | "rtl";

/** Every story runs once per mode, in real Chromium: interactions, axe, and (in CI) a screenshot comparison. */
const stories = (mode: Mode, initialGlobals: Record<string, string>): TestProjectInlineConfiguration => ({
  extends: true,
  plugins: [
    storybookTest({
      configDir: ".storybook",
      initialGlobals,
      tags: { exclude: mode === "light" ? [] : ["light-only"] },
    }),
  ],
  test: {
    name: mode,
    setupFiles: [".storybook/vitest.setup.ts"],
    provide: { mode, vrt: process.env.KUMIKO_VRT === "1" },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
      instances: [{ browser: "chromium" }],
      viewport: { width: 800, height: 600 },
      expect: {
        toMatchScreenshot: {
          comparatorName: "pixelmatch",
          comparatorOptions: { threshold: 0.1, allowedMismatchedPixelRatio: 0.002 },
        },
      },
    },
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.stories.{ts,tsx}", "src/**/*.{test,spec}.{ts,tsx}", "src/tokens.ts", "src/index.ts"],
      reporter: ["text-summary", "json-summary"],
      reportsDirectory: "coverage/",
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts", "scripts/**/*.test.ts", ".storybook/**/*.test.ts"],
        },
      },
      stories("light", { theme: "light", dir: "ltr" }),
      stories("dark", { theme: "dark", dir: "ltr" }),
      stories("rtl", { theme: "light", dir: "rtl" }),
    ],
  },
});
