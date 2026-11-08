/**
 * Kumiko's design tokens: the single source of truth for colours, type, radii, controls, layers and motion.
 * `pnpm tokens` writes src/tokens.css and src/theme.css from this file (CI fails if either is stale).
 * Apps that send email or draw Open Graph images import it as `kumiko-ui/tokens` for plain values.
 *
 * Apps wear their own brand by overriding the --kumiko-* colour, font and radius variables.
 */

export { type ColorKey, checkTheme, type Theme, themeCss } from "./theme.ts";

/** Colour roles for light and dark mode.
 * Use when: reading plain colour values for email or images. Avoid when: styling components; use theme classes.
 */
export const colors = {
  light: {
    canvas: "#F3F1FC",
    surface: "#FFFFFF",
    field: "#F0EDFA",
    line: "#D5CFEA",
    "skeleton-highlight": "#FFFFFF",
    "control-line": "#6E6094",
    ink: "#26203C",
    "ink-muted": "#665B79",
    strong: "#26203C",
    "strong-fg": "#FFFFFF",
    "edge-neutral": "#A2A2A5",
    focus: "#4F46E5",
    scrim: "rgba(26, 21, 45, 0.5)",
    "disabled-fill": "#E2DFEC",
    "disabled-text": "#61596F",
    "disabled-line": "#8A809F",
    brand: "#4F46E5",
    "brand-fg": "#FFFFFF",
    "brand-tint": "#C8C2FF",
    "brand-text": "#392DB2",
    sun: "#FFC844",
    "sun-fg": "#26203C",
    "sun-tint": "#FFE298",
    "sun-text": "#6C4200",
    leaf: "#73CE8F",
    "leaf-fg": "#26203C",
    "leaf-tint": "#C5EED0",
    "leaf-text": "#195D32",
    coral: "#FF896F",
    "coral-fg": "#26203C",
    "coral-tint": "#FFD0C5",
    "coral-text": "#963520",
    tide: "#62C9F2",
    "tide-fg": "#26203C",
    "tide-tint": "#B7E8FB",
    "tide-text": "#075879",
    success: "#267444",
    "success-fg": "#FFFFFF",
    "success-tint": "#C5EED0",
    "success-text": "#195D32",
    warning: "#9A5B00",
    "warning-fg": "#FFFFFF",
    "warning-tint": "#FFE298",
    "warning-text": "#6C4200",
    danger: "#B62B3F",
    "danger-fg": "#FFFFFF",
    "danger-tint": "#FFE0E4",
    "danger-text": "#962238",
    info: "#075879",
    "info-fg": "#FFFFFF",
    "info-tint": "#B7E8FB",
    "info-text": "#075879",
  },
  dark: {
    canvas: "#151828",
    surface: "#202539",
    field: "#292E45",
    line: "#48516E",
    "skeleton-highlight": "#F3EFFF",
    "control-line": "#8E95B3",
    ink: "#F3EFFF",
    "ink-muted": "#C3BCD9",
    strong: "#ECE6FF",
    "strong-fg": "#26203C",
    "edge-neutral": "#48516E",
    focus: "#B5ACFF",
    scrim: "rgba(6, 8, 18, 0.5)",
    "disabled-fill": "#333547",
    "disabled-text": "#C3BDD5",
    "disabled-line": "#8D879C",
    brand: "#ADA5FF",
    "brand-fg": "#211654",
    "brand-tint": "#37345C",
    "brand-text": "#C5BEFF",
    sun: "#E9BC53",
    "sun-fg": "#151828",
    "sun-tint": "#514322",
    "sun-text": "#FFE5A2",
    leaf: "#80CEA0",
    "leaf-fg": "#151828",
    "leaf-tint": "#254631",
    "leaf-text": "#B6E8C6",
    coral: "#EE9C87",
    "coral-fg": "#151828",
    "coral-tint": "#4E3032",
    "coral-text": "#FFC7B7",
    tide: "#7ACCEB",
    "tide-fg": "#151828",
    "tide-tint": "#234456",
    "tide-text": "#B1E6FA",
    success: "#79DA9D",
    "success-fg": "#102B1B",
    "success-tint": "#193E2C",
    "success-text": "#A5EABD",
    warning: "#E9BC53",
    "warning-fg": "#2B1D00",
    "warning-tint": "#514322",
    "warning-text": "#FFE5A2",
    danger: "#FF96A6",
    "danger-fg": "#36101B",
    "danger-tint": "#542634",
    "danger-text": "#FFBAC5",
    info: "#8AD7FA",
    "info-fg": "#0B2737",
    "info-tint": "#173D50",
    "info-text": "#A8E4FF",
  },
} as const;

/** Fixed face colours, art mix endpoints and the calendar's SVG type scale.
 * Use when: drawing palette-derived art that keeps its face colours in both themes.
 * Avoid when: styling text or controls; use the semantic colours.
 */
export const art = {
  ink: "#26203C",
  white: "#FFFFFF",
  black: "#000000",
  blush: "#F4A4B7",
  "blush-strong": "#F28BA9",
  "calendar-font-size": "7px",
  "calendar-font-weight": 800,
} as const;

/** Font stacks for display, body and code text.
 * Use when: choosing a type role. Avoid when: assuming these values install the fonts.
 */
export const fonts = {
  display: "'Fredoka Variable', 'Baloo Bhaijaan 2 Variable', ui-rounded, system-ui, sans-serif",
  body: "'Nunito Variable', 'Baloo Bhaijaan 2 Variable', ui-sans-serif, system-ui, sans-serif",
  code: "ui-monospace, 'SF Mono', Menlo, monospace",
} as const;

/** System colour roles for controls in forced-colours mode.
 * Use when: preserving checked fills, marks and focus in high contrast. Avoid when: colouring a regular theme.
 */
export const forcedColors = {
  "forced-fill": "Highlight",
  "forced-fg": "HighlightText",
  "forced-ink": "CanvasText",
  "forced-surface": "Canvas",
  "forced-disabled": "GrayText",
} as const;

/** Type scale: [font size, line height].
 * Use when: reading a text role's dimensions. Avoid when: sizing controls; use controls.
 */
export const text = {
  caption: ["0.75rem", "1rem"],
  label: ["0.875rem", "1.25rem"],
  button: ["0.9375rem", "1.25rem"],
  "body-sm": ["0.875rem", "1.375rem"],
  body: ["1rem", "1.5rem"],
  "title-sm": ["1.125rem", "1.5rem"],
  title: ["1.375rem", "1.75rem"],
  headline: ["1.875rem", "2.25rem"],
  display: ["2.5rem", "2.75rem"],
  hero: ["4rem", "4.25rem"],
} as const;

/** Corner radii for controls, cards, overlays and pills.
 * Use when: choosing a shape by role. Avoid when: deriving unrelated radii from a control.
 */
export const radii = {
  choice: "7px",
  thumb: "12px",
  control: "14px",
  card: "20px",
  overlay: "24px",
  pill: "9999px",
} as const;

/** Control border width.
 * Use when: drawing a control boundary. Avoid when: sizing the press edge or focus ring.
 */
export const border = "2px";

/** Press edge height.
 * Use when: building the shared press recipe. Avoid when: adding elevation shadows.
 */
export const edge = "4px";

/** Keyboard focus ring width and gap.
 * Use when: drawing visible keyboard focus. Avoid when: showing a ring after a pointer click.
 */
export const ring = { width: "3px", gap: "2px" } as const;

/** Control heights for size sm, md and lg.
 * Use when: sizing interactive controls. Avoid when: fixing the height of wrapping content.
 */
export const controls = { sm: "2.5rem", md: "3rem", lg: "3.5rem" } as const;

/** Stacking layers for sticky content and overlays.
 * Use when: placing a part above another layer. Avoid when: introducing arbitrary z-index values.
 */
export const layers = { base: 0, sticky: 100, overlay: 200, popup: 300, toast: 400, tooltip: 500 } as const;

/** Transition budgets by interaction, decorative number counts and the Skeleton loading loop.
 * Use when: timing interface feedback. Avoid when: relying on durations to suppress reduced-motion movement.
 */
export const durations = {
  "press-in": "60ms",
  "press-out": "140ms",
  hover: "120ms",
  "popup-in": "160ms",
  "popup-out": "110ms",
  "dialog-in": "220ms",
  "dialog-out": "150ms",
  "toast-in": "240ms",
  "toast-out": "160ms",
  move: "200ms",
  sheet: "300ms",
  "count-up": "600ms",
  "streak-pop": "240ms",
  "celebration-anticipation": "120ms",
  "celebration-rise": "240ms",
  "celebration-fall": "240ms",
  "celebration-landing": "100ms",
  "celebration-settle": "140ms",
  "celebration-progress": "300ms",
  skeleton: "1400ms",
} as const;

/** Millisecond offsets for the celebration's staged feedback and completion.
 * Use when: scheduling celebration cues. Avoid when: setting CSS transition durations; use durations.
 */
export const celebrationCues = { streak: 980, increment: 1100, end: 1300 } as const;

/** Easing curves by motion purpose.
 * Use when: shaping interruptible transitions. Avoid when: animating keyboard-driven highlights.
 */
export const easings = {
  enter: "cubic-bezier(0.23, 1, 0.32, 1)",
  move: "cubic-bezier(0.65, 0, 0.35, 1)",
  sheet: "cubic-bezier(0.32, 0.72, 0, 1)",
  pop: "cubic-bezier(0.34, 1.3, 0.64, 1)",
  rise: "cubic-bezier(0.3333333333333333, 0.6666666666666666, 0.6666666666666666, 1)",
  fall: "cubic-bezier(0.3333333333333333, 0, 0.6666666666666666, 0.3333333333333333)",
} as const;

/** Scale factors for streak feedback and the celebration's squash and ground shadow.
 * Use when: sizing the peak and starting pose of delight motion. Avoid when: scaling pressable controls.
 */
export const scales = {
  "streak-peak": 1.15,
  "increment-from": 0.75,
  "celebration-anticipation-x": 1.06,
  "celebration-anticipation-y": 0.92,
  "celebration-landing-x": 1.08,
  "celebration-landing-y": 0.9,
  "celebration-shadow": 0.6,
} as const;

/** Travel distances for decorative motion.
 * Use when: playing the celebration's hop. Avoid when: translating pressable controls; use the press recipe.
 */
export const distances = { "celebration-hop": "24px" } as const;

/** Theme names the class merger uses to separate colours, text sizes and other scales.
 * Use when: configuring tailwind-merge. Avoid when: registering duration or layer classes; use class groups.
 */
export const themeNames = {
  color: [...Object.keys(colors.light), ...Object.keys(forcedColors)],
  text: Object.keys(text),
  radius: Object.keys(radii),
  spacing: ["control-sm", "control", "control-lg"],
  font: Object.keys(fonts),
  ease: Object.keys(easings),
};
