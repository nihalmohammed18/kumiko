// Writes src/tokens.css from src/tokens.ts. `node scripts/build-tokens.ts --check` exits 1 if the file is stale.
import { readFileSync, writeFileSync } from "node:fs";
import { colors, controls, durations, easing, fonts, radius, shadows } from "../src/tokens.ts";

const vars = (obj: Record<string, string>, prefix = "") =>
  Object.entries(obj)
    .map(([k, v]) => `  --kumiko-${prefix}${k}: ${v};`)
    .join("\n");

export function tokensCss(): string {
  return `/* Generated from src/tokens.ts by \`pnpm tokens\`. Don't edit by hand. */
:root,
.light,
[data-theme="light"] {
  color-scheme: light;
${vars(colors.light)}
${vars(shadows.light, "shadow-")}
${vars(fonts, "font-")}
  --kumiko-radius: ${radius};
${vars(controls, "control-")}
${vars(durations, "duration-")}
  --kumiko-easing: ${easing};
}

.dark,
[data-theme="dark"] {
  color-scheme: dark;
${vars(colors.dark)}
${vars(shadows.dark, "shadow-")}
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --kumiko-duration-fast: 0ms;
    --kumiko-duration-base: 0ms;
    --kumiko-duration-slow: 0ms;
  }
}
`;
}

const file = new URL("../src/tokens.css", import.meta.url);
if (import.meta.main) {
  const css = tokensCss();
  if (process.argv.includes("--check")) {
    if (readFileSync(file, "utf8") !== css) {
      console.error("src/tokens.css is stale: run `pnpm tokens`.");
      process.exit(1);
    }
  } else writeFileSync(file, css);
}
