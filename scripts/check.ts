// Guards that keep Kumiko consistent, beyond what lint and types catch.
//   node scripts/check.ts         checks src/
//   node scripts/check.ts --dist  checks the build (run after tsc)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { tokensCss } from "./build-tokens.ts";

const root = new URL("..", import.meta.url).pathname;

/** Rules for class names inside string literals of component code. */
const classRules: Array<[RegExp, string]> = [
  [
    /(?<![\w[])-?(?:m|p|scroll-m|scroll-p)[lr]-|(?<![\w[])(?:left|right)-|(?<![\w[])(?:border|rounded)-(?:[lr]|[tb][lr])(?![\w])|(?<![\w[])(?:text|float|clear)-(?:left|right)\b/,
    "physical direction class; use start/end (ms-, pe-, start-, border-s, rounded-s, text-start) so right-to-left works",
  ],
  [
    /(?<![\w-])(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|divide|accent|caret|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|(?<![\w-])(?:bg|text|border|ring|outline|fill|stroke)-(?:black|white)\b/,
    "raw Tailwind palette colour; use a theme token (bg-surface, text-fg-muted, border-line…)",
  ],
  [/-\[(?:#|rgb|hsl|oklch|color-mix)/, "arbitrary colour; add a token to src/tokens.ts instead"],
  [/#[0-9a-fA-F]{3,8}\b/, "hex colour in a component; colours come from tokens"],
];

/** Problems in one component source file. Exported for the unit test. */
export function lintComponent(text: string, file: string): string[] {
  const problems: string[] = [];
  text.split("\n").forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    for (const literal of line.match(/"[^"]*"|'[^']*'|`[^`]*`/g) ?? []) {
      for (const [re, why] of classRules) if (re.test(literal)) problems.push(`${file}:${i + 1}: ${why}: ${literal}`);
      if (literal.startsWith("`") && /[a-z]-\$\{/.test(literal))
        problems.push(
          `${file}:${i + 1}: class name built from a string; Tailwind can't see it. Write each class out in full: ${literal}`,
        );
    }
  });
  return problems;
}

/** Stories may only turn accessibility checks off with a stated reason on the line above. */
export function lintStory(text: string, file: string): string[] {
  const lines = text.split("\n");
  return lines.flatMap((line, i) =>
    /a11y\s*:\s*\{[^}]*(?:test\s*:\s*["'](?:off|todo)["']|disable\s*:\s*true)/.test(line) &&
    !/a11y-exception:/.test(`${lines[i - 1] ?? ""} ${line}`)
      ? [`${file}:${i + 1}: accessibility check turned off without an "// a11y-exception: <reason>" comment`]
      : [],
  );
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function checkSource(): string[] {
  const problems: string[] = [];
  if (readFileSync(join(root, "src/tokens.css"), "utf8") !== tokensCss())
    problems.push("src/tokens.css is stale: run `pnpm tokens`");
  for (const path of walk(join(root, "src"))) {
    const file = relative(root, path);
    const text = readFileSync(path, "utf8");
    if (file.endsWith(".stories.tsx")) problems.push(...lintStory(text, file));
    else if (/\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file) && file !== "src/tokens.ts")
      problems.push(...lintComponent(text, file));
  }
  return problems;
}

function checkDist(): string[] {
  const problems: string[] = [];
  for (const path of walk(join(root, "src"))) {
    const file = relative(root, path);
    if (!/\.tsx?$/.test(file) || /\.(stories|test)\.tsx?$/.test(file)) continue;
    if (!readFileSync(path, "utf8").startsWith('"use client"')) continue;
    const out = join(root, file.replace(/^src\//, "dist/").replace(/\.tsx?$/, ".js"));
    if (!readFileSync(out, "utf8").startsWith('"use client"'))
      problems.push(`${relative(root, out)} lost its "use client" line`);
  }
  return problems;
}

if (import.meta.main) {
  const problems = process.argv.includes("--dist") ? checkDist() : checkSource();
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(process.argv.includes("--dist") ? "dist checks passed" : "source checks passed");
}
