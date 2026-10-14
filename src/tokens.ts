/**
 * Kumiko's design tokens: the single source of truth for colours, type, radius, shadows and motion.
 * `pnpm tokens` writes src/tokens.css from this file (CI fails if it's stale), and apps that send email or draw
 * Open Graph images import it as `kumiko-ui/tokens` for plain values.
 *
 * Apps wear their own brand by overriding five CSS variables: --kumiko-brand, --kumiko-brand-fg,
 * --kumiko-font-sans, --kumiko-font-display and --kumiko-radius.
 */

/** Colour roles, as hex, for light and dark mode. */
export const colors = {
  light: {
    canvas: "#FFFFFF",
    surface: "#F6F6F7",
    raised: "#FFFFFF",
    field: "#FFFFFF",
    fg: "#111113",
    "fg-muted": "#63636B",
    line: "#E4E4E7",
    "line-strong": "#8A8A93",
    brand: "#111113",
    "brand-fg": "#FFFFFF",
    highlight: "#111113",
    "highlight-fg": "#FFFFFF",
    focus: "#111113",
    success: "#157F3B",
    "success-subtle": "#E9F6EE",
    "success-fg": "#FFFFFF",
    warning: "#8F5400",
    "warning-subtle": "#FFF4E0",
    "warning-fg": "#FFFFFF",
    danger: "#C0262D",
    "danger-subtle": "#FDECEC",
    "danger-fg": "#FFFFFF",
    info: "#1F5FBF",
    "info-subtle": "#EAF1FD",
    "info-fg": "#FFFFFF",
    "series-1": "#111113",
    "series-2": "#3A63D8",
    "series-3": "#63636B",
    "series-4": "#B45309",
    "series-5": "#8A8A93",
    "series-6": "#157F3B",
    scrim: "rgba(17, 17, 19, 0.45)",
  },
  dark: {
    canvas: "#0B0B0D",
    surface: "#141417",
    raised: "#1B1B1F",
    field: "#0B0B0D",
    fg: "#EDEDEF",
    "fg-muted": "#9A9AA3",
    line: "#26262B",
    "line-strong": "#6B6B74",
    brand: "#EDEDEF",
    "brand-fg": "#0B0B0D",
    highlight: "#EDEDEF",
    "highlight-fg": "#0B0B0D",
    focus: "#EDEDEF",
    success: "#4ADE80",
    "success-subtle": "#0F2A1A",
    "success-fg": "#0B0B0D",
    warning: "#FBBF24",
    "warning-subtle": "#2E2209",
    "warning-fg": "#0B0B0D",
    danger: "#F87171",
    "danger-subtle": "#2D1314",
    "danger-fg": "#0B0B0D",
    info: "#7AA7FF",
    "info-subtle": "#13213D",
    "info-fg": "#0B0B0D",
    "series-1": "#EDEDEF",
    "series-2": "#7AA7FF",
    "series-3": "#9A9AA3",
    "series-4": "#F59E0B",
    "series-5": "#6B6B74",
    "series-6": "#4ADE80",
    scrim: "rgba(0, 0, 0, 0.6)",
  },
} as const;

export type ColorRole = keyof (typeof colors)["light"];

/** Shadows differ per mode: dark surfaces need deeper, darker shadows to read at all. */
export const shadows = {
  light: { raised: "none", overlay: "0 12px 32px rgb(17 17 19 / 0.12), 0 2px 6px rgb(17 17 19 / 0.06)" },
  dark: { raised: "none", overlay: "0 12px 32px rgb(0 0 0 / 0.5), 0 2px 6px rgb(0 0 0 / 0.3)" },
} as const;

export const fonts = {
  sans: "'Geist', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif",
  display: "'Geist', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace",
} as const;

/** Base corner radius. Cards and overlays derive larger radii from it, so one value reshapes everything. */
export const radius = "6px";

/** Type scale: [font size, line height]. */
export const text = {
  caption: ["0.75rem", "1rem"],
  label: ["0.8125rem", "1.125rem"],
  "body-sm": ["0.8125rem", "1.25rem"],
  body: ["0.875rem", "1.375rem"],
  "title-sm": ["1rem", "1.5rem"],
  title: ["1.25rem", "1.75rem"],
  headline: ["1.75rem", "2.25rem"],
  display: ["2.5rem", "2.75rem"],
} as const;

/** Control heights for size sm, md and lg. */
export const controls = { sm: "2rem", md: "2.25rem", lg: "2.75rem" } as const;

/** Motion stays between 150 and 250ms, and drops to 0 when someone asks for reduced motion. */
export const durations = { fast: "150ms", base: "200ms", slow: "250ms" } as const;
export const easing = "cubic-bezier(0.2, 0, 0, 1)";

/** Names Tailwind classes use, so the class merger knows `text-fg` is a colour and `text-body` a size. */
export const themeNames = {
  color: [...Object.keys(colors.light), "brand-hover", "brand-subtle", "brand-text", "surface-hover", "danger-hover"],
  text: Object.keys(text),
  radius: ["control", "card", "overlay"],
  shadow: ["raised", "overlay"],
  spacing: ["control", "control-sm", "control-lg"],
  font: ["display", "code"],
};
