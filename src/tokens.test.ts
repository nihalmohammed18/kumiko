import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, it } from "vitest";
import { contrast } from "../.storybook/ux/color.ts";
import { themeCss, tokensCss } from "../scripts/build-tokens.ts";
import { readPaletteNames } from "../scripts/check.ts";
import { cn } from "./lib/tv.ts";
import { colors } from "./tokens.ts";

const rgb = (hex: string) => ({
  r: Number.parseInt(hex.slice(1, 3), 16),
  g: Number.parseInt(hex.slice(3, 5), 16),
  b: Number.parseInt(hex.slice(5, 7), 16),
  a: 1,
});

it("meets text and control contrast thresholds in both themes", () => {
  const families = ["brand", "sun", "leaf", "coral", "tide", "success", "warning", "danger", "info"];
  const textPairs: Array<[string, string]> = [
    ...families.flatMap(
      (name): Array<[string, string]> => [
        [`${name}-fg`, name],
        [`${name}-text`, `${name}-tint`],
        [`${name}-text`, "surface"],
      ],
    ),
    ...["ink", "ink-muted"].flatMap(
      (name): Array<[string, string]> => ["canvas", "surface", "field"].map((background) => [name, background]),
    ),
    ["strong-fg", "strong"],
  ];
  const controlPairs: Array<[string, string]> = [
    ["focus", "canvas"],
    ["focus", "surface"],
    ...["canvas", "surface", "field"].map((background): [string, string] => ["control-line", background]),
  ];
  for (const [theme, values] of Object.entries(colors)) {
    const palette: Record<string, string> = values;
    for (const [pairs, minimum] of [
      [textPairs, 4.5],
      [controlPairs, 3],
    ] as const) {
      for (const [foreground, background] of pairs) {
        expect(
          contrast(rgb(palette[foreground]!), rgb(palette[background]!)),
          `${theme}: ${foreground} on ${background}`,
        ).toBeGreaterThanOrEqual(minimum);
      }
    }
  }
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
  ])
    expect(cn(first, last)).toBe(last);
  expect(cn("text-ink", "text-body")).toBe("text-ink text-body");
});

it("generates colour scopes, isolated globals and a theme backed only by Kumiko variables", () => {
  const css = tokensCss();
  const light = css.match(/:root,\s*\.light,\s*\[data-theme="light"\] \{([^}]+)\}/)?.[1] ?? "";
  const dark = css.match(/\.dark,\s*\[data-theme="dark"\] \{([^}]+)\}/)?.[1] ?? "";
  const globals = css.match(/^:root \{([^}]+)\}/m)?.[1] ?? "";
  const forced = css.slice(css.indexOf("@media (forced-colors: active)"));
  expect(light).toContain("color-scheme: light;");
  expect(dark).toContain("color-scheme: dark;");
  expect(forced).toMatch(/:root,\s*\.light,\s*\[data-theme="light"\],\s*\.dark,\s*\[data-theme="dark"\]/);
  expect(forced).toContain("--kumiko-brand-fg: HighlightText;");
  expect(forced).toContain("--kumiko-disabled-text: GrayText;");
  expect(css).not.toContain("prefers-reduced-motion");

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

  const theme = themeCss();
  expect(theme).toContain("@theme inline");
  const values = Array.from(theme.matchAll(/:\s*([^;{}]+);/g), (match) => match[1]!);
  expect(values.length).toBeGreaterThan(0);
  for (const value of values) expect(value).toMatch(/^var\(--kumiko-[\w-]+\)$/);
  expect(theme).not.toContain("--font-sans");
});
