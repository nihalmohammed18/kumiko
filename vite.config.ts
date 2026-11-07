import { readdirSync, readFileSync } from "node:fs";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, type TestProjectInlineConfiguration } from "vitest/config";
import { uxMouse } from "./.storybook/ux/commands.ts";
import type { MODES } from "./scripts/ux-rules.ts";

type Mode = (typeof MODES)[number];

// Every Base UI module the components import, pre-bundled up front. Otherwise each of the six browser projects
// discovers them mid-run, Vite re-optimises and reloads, and tests fail to load.
const baseUiModules = [
  ...new Set(
    readdirSync("src", { recursive: true, withFileTypes: true })
      // Screenshot folders are named after story files, so keep only real files.
      .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
      .flatMap((entry) =>
        Array.from(
          readFileSync(`${entry.parentPath}/${entry.name}`, "utf8").matchAll(/from "(@base-ui\/react\/[\w-]+)"/g),
          (match) => match[1]!,
        ),
      ),
  ),
];

interface Project {
  dir?: "ltr" | "rtl";
  theme?: "light" | "dark";
  /** Playwright context options on top of reduced motion. */
  context?: Record<string, unknown>;
  /** A 320×568 phone instead of a 1200×900 desktop. */
  phone?: boolean;
  /** Screenshot comparisons: every story, only each component's States story, or none. */
  vrt?: "all" | "states" | "none";
  axe?: boolean;
}

/**
 * Every story runs once per project, in real Chromium: play tests, axe, the UX rules (.storybook/ux) and, in CI,
 * screenshot comparisons. Each project's conditions are asserted before its first story (see vitest.setup.ts).
 */
const stories = (mode: Mode, project: Project = {}): TestProjectInlineConfiguration => {
  const { dir = "ltr", theme = "light", context, phone = false, vrt = "all", axe = true } = project;
  // Storybook's Vitest plugin resizes the page before every story: to a named viewport from globals.viewport, or
  // else to 1200×900. mobile1 is Storybook's built-in 320×568.
  const globals = { theme, dir, ...(phone && { viewport: { value: "mobile1" } }) };
  return {
    extends: true,
    plugins: [
      storybookTest({
        configDir: ".storybook",
        // a11y.manual stops the a11y addon's automatic axe run; the three main projects already cover it.
        initialGlobals: axe ? globals : { ...globals, a11y: { manual: true } },
        tags: { exclude: mode === "light" ? [] : ["light-only"] },
      }),
    ],
    test: {
      name: mode,
      setupFiles: [".storybook/vitest.setup.ts"],
      provide: { mode, vrt: process.env.KUMIKO_VRT === "1" ? vrt : "none" },
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({ contextOptions: { reducedMotion: "reduce", ...context } }),
        instances: [{ browser: "chromium" }],
        viewport: phone ? { width: 320, height: 568 } : { width: 1200, height: 900 },
        commands: { uxMouse },
        expect: {
          toMatchScreenshot: {
            comparatorName: "pixelmatch",
            comparatorOptions: { threshold: 0.1, allowedMismatchedPixelRatio: 0.002 },
          },
        },
      },
    },
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: { include: baseUiModules },
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
      stories("light"),
      stories("dark", { theme: "dark" }),
      stories("rtl", { dir: "rtl" }),
      stories("touch", {
        context: { hasTouch: true },
        phone: true,
        vrt: "none",
        axe: false,
      }),
      stories("forced", { context: { forcedColors: "active" }, vrt: "states", axe: false }),
      stories("motion", { context: { reducedMotion: "no-preference" }, vrt: "none", axe: false }),
    ],
  },
});
