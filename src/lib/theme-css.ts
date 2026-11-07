const selectors = {
  light: ':root,\n.light,\n[data-theme="light"]',
  dark: '.dark,\n[data-theme="dark"]',
  globals: ":root",
};

/** Writes Kumiko custom property declarations with an optional token family prefix.
 * Use when: generating defaults or theme overrides. Avoid when: writing Tailwind theme mappings.
 */
export function cssVars(values: Record<string, string | number>, prefix = ""): string {
  return Object.entries(values)
    .map(([name, value]) => `  --kumiko-${prefix}${name}: ${value};`)
    .join("\n");
}

/** Wraps declarations in Kumiko's colour or global scope, omitting empty blocks.
 * Use when: generating defaults or theme overrides. Avoid when: scoping component styles.
 */
export function cssScope(scope: keyof typeof selectors, declarations: string): string {
  return declarations ? `${selectors[scope]} {\n${declarations}\n}\n` : "";
}
