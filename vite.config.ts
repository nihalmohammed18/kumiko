import { readdirSync, readFileSync } from "node:fs";
import { STORYBOOK_TEST_PROVIDE_KEY } from "@storybook/addon-vitest/constants";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, type TestProjectInlineConfiguration } from "vitest/config";
import { uxForcedColors, uxMouse, uxWheel } from "./.storybook/ux/commands.ts";
import type { MODES } from "./scripts/ux-rules.ts";

type Mode = (typeof MODES)[number];

// Every package module the source imports, pre-bundled up front. Otherwise each of the six browser projects
// discovers them mid-run, Vite re-optimises and reloads the page, and tests fail to load; the forced project even
// loses its forced-colours emulation. Unit tests run in Node, so their imports don't count.
const sourceModules = [
  ...new Set(
    readdirSync("src", { recursive: true, withFileTypes: true })
      // Screenshot folders are named after story files, so keep only real files.
      .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
      .flatMap((entry) =>
        Array.from(
          readFileSync(`${entry.parentPath}/${entry.name}`, "utf8").matchAll(/from "((?:@[\w-]+\/)?[\w-][\w./-]*)"/g),
          (match) => match[1]!,
        ),
      )
      .filter((module) => !/^(?:storybook|@storybook\/|vitest)/.test(module)),
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
  /** The browser engine; the nightly WebKit run reuses a mode's conditions under its own project name. */
  browser?: "chromium" | "webkit";
  name?: string;
}

/**
 * Every story runs once per project, in real Chromium (and nightly in WebKit): play tests, axe, the UX rules (.storybook/ux) and, in CI,
 * screenshot comparisons. Each project's conditions are asserted before its first story (see vitest.setup.ts).
 */
const stories = (mode: Mode, project: Project = {}): TestProjectInlineConfiguration => {
  const {
    dir = "ltr",
    theme = "light",
    context,
    phone = false,
    vrt = "all",
    axe = true,
    browser = "chromium",
  } = project;
  // Storybook's Vitest plugin resizes the page before every story: to a named viewport from globals.viewport, or
  // else to 1200×900. mobile1 is Storybook's built-in 320×568.
  const globals = { theme, dir, ...(phone && { viewport: { value: "mobile1" } }) };
  return {
    extends: true,
    plugins: [
      storybookTest({
        configDir: ".storybook",
        initialGlobals: globals,
        tags: { exclude: mode === "light" ? [] : ["light-only"] },
      }),
    ],
    test: {
      name: project.name ?? mode,
      setupFiles: [".storybook/vitest.setup.ts"],
      provide: {
        mode,
        vrt: process.env.KUMIKO_VRT === "1" ? vrt : "none",
        // Whether axe runs. Storybook's Vitest plugin reads this run config (its UI's accessibility toggle supplies it
        // there) and overwrites any a11y.manual global with it, so this is the only switch that works.
        [STORYBOOK_TEST_PROVIDE_KEY]: { a11y: axe },
      },
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({ contextOptions: { reducedMotion: "reduce", ...context } }),
        instances: [{ browser }],
        viewport: phone ? { width: 320, height: 568 } : { width: 1200, height: 900 },
        commands: { uxForcedColors, uxMouse, uxWheel },
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
  optimizeDeps: { include: sourceModules },
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
      // axe runs in forced colours on purpose: it catches text on parts that opt out with forced-color-adjust: none.
      // It reads authored colours, so a story must not nest a data-theme section (the dark project covers dark).
      stories("forced", { context: { forcedColors: "active" }, vrt: "states" }),
      stories("motion", { context: { reducedMotion: "no-preference" }, vrt: "none", axe: false }),
      // Nightly only (KUMIKO_WEBKIT=1): the light project's play tests, axe and UX rules in WebKit, without screenshots.
      ...(process.env.KUMIKO_WEBKIT === "1"
        ? [stories("light", { browser: "webkit", name: "webkit", vrt: "none" })]
        : []),
    ],
  },
});
