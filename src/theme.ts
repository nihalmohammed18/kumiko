import { contrast, deltaE, flatten, parseColor, type Rgba, WHITE } from "./lib/color.ts";
import { cssScope, cssVars } from "./lib/theme-css.ts";
import { colors, type fonts, type radii } from "./tokens.ts";

/** A colour role shared by Kumiko's light and dark palettes.
 * Use when: typing a colour override. Avoid when: naming fonts or radii.
 */
export type ColorKey = keyof typeof colors.light;

/** Colour, font and radius overrides applied over Kumiko's defaults.
 * Use when: giving an app its own brand. Avoid when: changing control sizes or motion budgets.
 */
export interface Theme {
  light?: Partial<Record<ColorKey, string>>;
  dark?: Partial<Record<ColorKey, string>>;
  fonts?: Partial<Record<keyof typeof fonts, string>>;
  radii?: Partial<Record<keyof typeof radii, string>>;
}

const families = ["brand", "sun", "leaf", "coral", "tide", "success", "warning", "danger", "info"] as const;
const backgrounds = ["canvas", "surface", "field"] as const;

/** Problems with a theme over Kumiko's defaults; empty when it's fine.
 * Use when: checking contrast and press edge visibility before adopting a theme. Avoid when: auditing rendered UI.
 */
export function checkTheme(theme: Theme): string[] {
  const textPairs: Array<[ColorKey, ColorKey]> = [
    ...families.flatMap(
      (name): Array<[ColorKey, ColorKey]> => [
        [`${name}-fg`, name],
        [`${name}-text`, `${name}-tint`],
        [`${name}-text`, "surface"],
      ],
    ),
    ...(["ink", "ink-muted"] as const).flatMap(
      (name): Array<[ColorKey, ColorKey]> => backgrounds.map((background) => [name, background]),
    ),
    ["strong-fg", "strong"],
  ];
  const controlPairs: Array<[ColorKey, ColorKey]> = [
    ["focus", "canvas"],
    ["focus", "surface"],
    ...backgrounds.map((background): [ColorKey, ColorKey] => ["control-line", background]),
  ];
  const problems: string[] = [];
  for (const mode of ["light", "dark"] as const) {
    const values = { ...colors[mode], ...theme[mode] };
    const palette = new Map<string, Rgba>();
    for (const [name, value] of Object.entries(values)) {
      const parsed = parseColor(value);
      if (parsed) palette.set(name, parsed);
      else problems.push(`${mode}.${name}: can't read '${value}'`);
    }
    for (const [pairs, minimum] of [
      [textPairs, 4.5],
      [controlPairs, 3],
    ] as const) {
      for (const [foreground, background] of pairs) {
        const fg = palette.get(foreground);
        const bg = palette.get(background);
        if (!fg || !bg) continue;
        const backdrop = flatten([bg, palette.get("canvas") ?? WHITE]);
        const ratio = contrast(flatten([fg], backdrop), backdrop);
        if (ratio < minimum)
          problems.push(`${mode}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1 (needs ${minimum}:1)`);
      }
    }
    const edge = palette.get("edge-neutral");
    for (const background of ["canvas", "surface"] as const) {
      const bg = palette.get(background);
      if (!edge || !bg) continue;
      const backdrop = flatten([bg, palette.get("canvas") ?? WHITE]);
      const distance = deltaE(flatten([edge], backdrop), backdrop);
      if (distance < 0.05)
        problems.push(`${mode}: edge-neutral on ${background} has deltaE ${distance.toFixed(3)} (needs 0.05)`);
    }
  }
  return problems;
}

/** The CSS that applies a theme: only the variables it overrides, in the same scopes as tokens.css.
 * Use when: applying a checked theme in an app stylesheet. Avoid when: regenerating Kumiko's default tokens.
 */
export function themeCss(theme: Theme): string {
  const globals = [cssVars(theme.fonts ?? {}, "font-"), cssVars(theme.radii ?? {}, "radius-")]
    .filter(Boolean)
    .join("\n");
  return [
    cssScope("light", cssVars(theme.light ?? {})),
    cssScope("dark", cssVars(theme.dark ?? {})),
    cssScope("globals", globals),
  ]
    .filter(Boolean)
    .join("\n");
}
