import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, it } from "vitest";
import { themeCss as tailwindThemeCss, tokensCss } from "../scripts/build-tokens.ts";
import { readPaletteNames } from "../scripts/check.ts";
import { cn } from "./lib/tv.ts";
import { checkTheme, colors } from "./tokens.ts";

it("meets text and control contrast thresholds in both themes", () => {
  expect(checkTheme({})).toEqual([]);
});

it("avoids Tailwind palette and shadcn colour names", () => {
  const forbidden = readPaletteNames(
    readFileSync(createRequire(import.meta.url).resolve("tailwindcss/theme.css"), "utf8"),
  );
  const shadcn = [
    "background",
    "foreground",
    "card",
    "popover",
    "primary",
    "secondary",
    "muted",
    "accent",
    "destructive",
    "border",
    "input",
    "ring",
    "chart",
    "sidebar",
  ];
  for (const name of ["black", "white", ...shadcn, ...shadcn.map((name) => `${name}-foreground`)]) forbidden.add(name);
  for (const palette of Object.values(colors)) {
    for (const name of Object.keys(palette)) expect(forbidden.has(name), name).toBe(false);
  }
});

it("merges conflicting theme classes without mixing colour and text size", () => {
  for (const [first, last] of [
    ["bg-brand", "bg-sun"],
    ["text-caption", "text-body"],
    ["rounded-control", "rounded-pill"],
    ["duration-hover", "duration-move"],
    ["z-sticky", "z-tooltip"],
    ["press-primary", "press-danger"],
  ])
    expect(cn(first, last)).toBe(last);
  expect(cn("text-ink", "text-body")).toBe("text-ink text-body");
  expect(cn("press", "press-secondary")).toBe("press press-secondary");
});

it("generates colour scopes, isolated globals and a theme backed only by Kumiko variables", () => {
  const css = tokensCss();
  const light = css.match(/:root,\s*\.light,\s*\[data-theme="light"\] \{([^}]+)\}/)?.[1] ?? "";
  const dark = css.match(/\.dark,\s*\[data-theme="dark"\] \{([^}]+)\}/)?.[1] ?? "";
  const globals = css.match(/^:root \{([^}]+)\}/m)?.[1] ?? "";
  expect(light).toContain("color-scheme: light;");
  expect(dark).toContain("color-scheme: dark;");
  expect(css).not.toContain("prefers-reduced-motion");
  // Forced colours are left to the browser: remapping text variables to system colours hid labels behind Chrome's
  // text backplate. Parts that keep their fill (checkbox, switch) get their own forced-colour variables later.
  expect(css).not.toContain("forced-colors");

  const globalNames = globals.match(/--kumiko-[\w-]+:/g) ?? [];
  expect(globalNames).toEqual(
    expect.arrayContaining([
      "--kumiko-font-body:",
      "--kumiko-text-hero:",
      "--kumiko-text-hero-leading:",
      "--kumiko-radius-pill:",
      "--kumiko-border:",
      "--kumiko-edge-h:",
      "--kumiko-ring-width:",
      "--kumiko-ring-gap:",
      "--kumiko-control-md:",
      "--kumiko-layer-overlay:",
      "--kumiko-duration-hover:",
      "--kumiko-ease-enter:",
    ]),
  );
  for (const name of globalNames) expect(css.match(new RegExp(name, "g")), name).toHaveLength(1);

  const theme = tailwindThemeCss();
  expect(theme).toContain("@theme inline");
  const values = Array.from(theme.matchAll(/:\s*([^;{}]+);/g), (match) => match[1]!);
  expect(values.length).toBeGreaterThan(0);
  for (const value of values) expect(value).toMatch(/^var\(--kumiko-[\w-]+\)$/);
  expect(theme).not.toContain("--font-sans");
});
