// Writes src/tokens.css and src/theme.css. `node scripts/build-tokens.ts --check` fails if either is stale.
import { readFileSync, writeFileSync } from "node:fs";
import { cssScope, cssVars } from "../src/lib/theme-css.ts";
import {
  art,
  border,
  colors,
  controls,
  distances,
  durations,
  easings,
  edge,
  fonts,
  forcedColors,
  layers,
  radii,
  ring,
  scales,
  text,
} from "../src/tokens.ts";

const themeVars = (names: string[], prefix: string, tokenPrefix = prefix) =>
  names.map((name) => `  --${prefix}${name}: var(--kumiko-${tokenPrefix}${name});`).join("\n");

/** Generates theme colour scopes and raw global variables.
 * Use when: regenerating src/tokens.css. Avoid when: adding handwritten component styles.
 */
export function tokensCss(): string {
  const globals = [
    cssVars(art, "art-"),
    cssVars(forcedColors),
    cssVars(fonts, "font-"),
    cssVars(
      Object.fromEntries(
        Object.entries(text).flatMap(([name, [size, leading]]) => [
          [name, size],
          [`${name}-leading`, leading],
        ]),
      ),
      "text-",
    ),
    cssVars(radii, "radius-"),
    `  --kumiko-border: ${border};`,
    `  --kumiko-edge-h: ${edge};`,
    cssVars(ring, "ring-"),
    cssVars(controls, "control-"),
    cssVars(layers, "layer-"),
    cssVars(durations, "duration-"),
    cssVars(easings, "ease-"),
    cssVars(scales, "scale-"),
    cssVars(distances, "distance-"),
  ].join("\n");
  return (
    "/* Generated from src/tokens.ts by `pnpm tokens`. Don't edit by hand. */\n" +
    [
      cssScope("light", `  color-scheme: light;\n${cssVars(colors.light)}`),
      cssScope("dark", `  color-scheme: dark;\n${cssVars(colors.dark)}`),
      cssScope("globals", globals),
    ].join("\n")
  );
}

/** Generates Tailwind v4 theme mappings and named duration and layer utilities.
 * Use when: regenerating src/theme.css. Avoid when: overriding an application's theme scales.
 */
export function themeCss(): string {
  return `/* Generated from src/tokens.ts by \`pnpm tokens\`. Don't edit by hand. */
@theme inline {
${themeVars([...Object.keys(colors.light), ...Object.keys(forcedColors)], "color-", "")}
${themeVars(Object.keys(radii), "radius-")}
  --spacing-control-sm: var(--kumiko-control-sm);
  --spacing-control: var(--kumiko-control-md);
  --spacing-control-lg: var(--kumiko-control-lg);
${themeVars(Object.keys(fonts), "font-")}
${Object.keys(text)
  .map(
    (name) =>
      `  --text-${name}: var(--kumiko-text-${name});\n  --text-${name}--line-height: var(--kumiko-text-${name}-leading);`,
  )
  .join("\n")}
${themeVars(Object.keys(easings), "ease-")}
}

${Object.keys(durations)
  .map((name) => `@utility duration-${name} {\n  transition-duration: var(--kumiko-duration-${name});\n}`)
  .join("\n")}

${Object.keys(layers)
  .map((name) => `@utility z-${name} {\n  z-index: var(--kumiko-layer-${name});\n}`)
  .join("\n")}
`;
}

if (import.meta.main) {
  for (const [name, css] of [
    ["tokens.css", tokensCss()],
    ["theme.css", themeCss()],
  ] as const) {
    const file = new URL(`../src/${name}`, import.meta.url);
    if (process.argv.includes("--check")) {
      if (readFileSync(file, "utf8") !== css) {
        console.error(`src/${name} is stale: run \`pnpm tokens\`.`);
        process.exitCode = 1;
      }
    } else writeFileSync(file, css);
  }
}
