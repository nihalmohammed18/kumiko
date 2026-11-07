import { MODES, type RULE_IDS } from "../../scripts/ux-rules.ts";
import { BLACK, contrast, deltaE, flatten, parseColor, type Rgba } from "../../src/lib/color.ts";
import { type Rect, type Sides, sameBox } from "./geometry.ts";

/** A shared UX rule id.
 * Use when: selecting a UX decision. Avoid when: naming a static source guard.
 */
export type RuleId = (typeof RULE_IDS)[number];

/** A UX test project.
 * Use when: choosing which rules run. Avoid when: describing an element state.
 */
export type Mode = (typeof MODES)[number];

/** Computed CSS values keyed by kebab-case property names.
 * Use when: passing styles from the browser glue. Avoid when: passing authored CSS shorthand.
 */
export type Style = Record<string, string>;

/** One element's styles; pseudos exist only for content other than none/normal, and marks are opaque.
 * Use when: comparing moments or peer states. Avoid when: retaining live browser elements.
 */
export interface Snapshot {
  self: Style;
  before?: Style;
  after?: Style;
  marks?: string;
}

const sides = ["top", "right", "bottom", "left"] as const;

/** The computed properties required in a style snapshot.
 * Use when: collecting browser styles. Avoid when: deciding whether a change is visible.
 */
export const STYLE_PROPS: readonly string[] = [
  "cursor",
  "pointer-events",
  "visibility",
  "display",
  "position",
  "opacity",
  "background-color",
  "background-image",
  "color",
  ...sides.flatMap((side) => ["width", "style", "color"].map((part) => `border-${side}-${part}`)),
  "outline-style",
  "outline-width",
  "outline-color",
  "outline-offset",
  "box-shadow",
  "text-decoration-line",
  "text-decoration-color",
  "text-decoration-thickness",
  "text-underline-offset",
  "transform",
  "translate",
  "scale",
  "rotate",
  "filter",
  "font-weight",
  "font-size",
  "letter-spacing",
  "transition-property",
  "transition-duration",
  "animation-name",
  "animation-duration",
  "animation-iteration-count",
  "color-scheme",
  "forced-color-adjust",
  "top",
  "right",
  "bottom",
  "left",
  "content",
];

/** The packet's visibility, accessibility, size and time thresholds.
 * Use when: evaluating a UX rule. Avoid when: defining component design tokens.
 */
export const LIMITS = {
  deltaE: 0.02,
  edgeDeltaE: 0.05,
  ringWidth: 2,
  ringContrast: 3,
  stateContrast: 3,
  transitionMs: 300,
  inputFontPx: 16,
  target: 24,
  touchTarget: 40,
  settleMs: 1600,
} as const;

const projects: Record<RuleId, readonly Mode[]> = {
  cursor: ["light", "dark", "rtl"],
  "disabled-inert": ["light", "dark", "rtl"],
  "hover-visible": ["light", "dark", "rtl"],
  "color-scheme": ["light", "dark", "rtl"],
  "press-visible": ["light", "dark", "rtl", "touch"],
  "edge-clip": ["light", "dark", "rtl", "touch"],
  "text-overflow": ["light", "dark", "rtl", "touch"],
  "no-layout-shift": ["light", "dark", "rtl", "touch", "forced"],
  "focus-ring": ["light", "dark", "rtl", "forced"],
  "reduce-no-move": ["light", "dark", "rtl", "touch", "forced"],
  "target-size": ["light", "touch"],
  "input-font": ["light", "touch"],
  "edge-visible": ["light", "dark"],
  "state-not-color": ["light", "dark", "forced"],
  directional: ["light", "rtl"],
  reflow: ["touch"],
  "no-sticky-hover": ["touch"],
  boundary: ["forced"],
  "dead-class": ["light"],
  transitions: MODES,
  settle: MODES,
  "stale-exception": MODES,
};

/** Class names a selector mentions, with CSS escapes resolved (`.hover\:bg-x` gives `hover:bg-x`).
 * Use when: collecting the classes a stylesheet can style. Avoid when: matching selectors against elements.
 */
export function selectorClasses(selector: string): string[] {
  return Array.from(selector.matchAll(/\.((?:\\[\da-f]{1,6} ?|\\[^\da-f\n]|[\w-]|[^\p{ASCII}])+)/giu), (match) =>
    match[1]!.replace(/\\([\da-f]{1,6}) ?|\\(.)/giu, (_, hex: string | undefined, char: string | undefined) =>
      hex ? String.fromCodePoint(Number.parseInt(hex, 16)) : char!,
    ),
  );
}

/** Whether a rule runs in a test project.
 * Use when: filtering rule checks or exceptions. Avoid when: suppressing a violation without an exception.
 */
export function runs(rule: RuleId, mode: Mode): boolean {
  return projects[rule]?.includes(mode) ?? false;
}

const initial: Style = {
  cursor: "auto",
  "pointer-events": "auto",
  visibility: "visible",
  display: "inline",
  position: "static",
  opacity: "1",
  "background-color": "rgba(0, 0, 0, 0)",
  "background-image": "none",
  color: "rgb(0, 0, 0)",
  ...Object.fromEntries(
    sides.flatMap((side) => [
      [`border-${side}-width`, "0px"],
      [`border-${side}-style`, "none"],
      [`border-${side}-color`, "currentcolor"],
    ]),
  ),
  "outline-style": "none",
  "outline-width": "0px",
  "outline-color": "currentcolor",
  "outline-offset": "0px",
  "box-shadow": "none",
  "text-decoration-line": "none",
  "text-decoration-color": "currentcolor",
  "text-decoration-thickness": "auto",
  "text-underline-offset": "auto",
  transform: "none",
  translate: "none",
  scale: "none",
  rotate: "none",
  filter: "none",
  "font-weight": "400",
  "font-size": "16px",
  "letter-spacing": "normal",
  "transition-property": "all",
  "transition-duration": "0s",
  "animation-name": "none",
  "animation-duration": "0s",
  "animation-iteration-count": "1",
  "color-scheme": "normal",
  "forced-color-adjust": "auto",
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto",
  content: "normal",
};

function value(style: Style, property: string): string {
  const computed = style[property];
  const fallback = initial[property] ?? "none";
  return typeof computed === "string" ? computed : fallback === "currentcolor" ? value(style, "color") : fallback;
}

const numberPattern = "[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:e[+-]?\\d+)?";
const numeric = new RegExp(`^${numberPattern}$`, "i");
const time = new RegExp(`^(${numberPattern})(ms|s)$`, "i");
const pixels = new RegExp(`^(${numberPattern})px$`, "i");

function number(value: string, fallback = 0): number {
  const parsed = Number(value);
  return numeric.test(value) && Number.isFinite(parsed) ? parsed : fallback;
}

function px(value: string): number {
  const match = pixels.exec(value.trim());
  return match ? number(match[1]!) : 0;
}

function visible(style: Style, prefix: string): boolean {
  const kind = value(style, `${prefix}-style`);
  return kind !== "none" && kind !== "hidden" && px(value(style, `${prefix}-width`)) > 0;
}

function duration(value: string): number {
  const match = time.exec(value);
  if (!match) return 0;
  return Math.max(0, number(match[1]!) * (match[2]!.toLowerCase() === "s" ? 1000 : 1));
}

function transitions(style: Style): [string, number][] {
  const durations = value(style, "transition-duration")
    .split(",")
    .map((part) => duration(part.trim()));
  return value(style, "transition-property")
    .split(",")
    .map((part, index) => [part.trim(), durations[index % durations.length]!]);
}

/** The cursor category of an element or its associated label.
 * Use when: checking a control's cursor. Avoid when: describing its visual variant.
 */
export type Kind = "action" | "text-entry" | "label-action" | "label-text";

/** Allowed computed cursors, or null for a case the rule does not check.
 * Use when: validating action and input cursors. Avoid when: prescribing cursors for decorative elements.
 */
export function expectedCursor(kind: Kind, state: { disabled: boolean; loading: boolean }): string[] | null {
  if (kind === "label-text") return state.disabled ? ["not-allowed"] : null;
  if (kind === "text-entry") {
    if (state.loading) return null;
    return state.disabled ? ["not-allowed"] : ["text", "auto"];
  }
  if (state.loading) return ["progress"];
  return state.disabled ? ["not-allowed"] : ["pointer"];
}

/** Problems with non-zero transition-all or transitions beyond the time budget.
 * Use when: checking interface transition declarations. Avoid when: checking animation keyframes.
 */
export function transitionProblems(style: Style): string[] {
  const problems: string[] = [];
  for (const [property, ms] of transitions(style)) {
    if (property === "all" && ms > 0) problems.push("transition all must name explicit properties");
    if (ms > LIMITS.transitionMs)
      problems.push(`${property} transition lasts ${ms}ms (limit ${LIMITS.transitionMs}ms)`);
  }
  return problems;
}

function moves(property: string): boolean {
  return (
    /^(?:all|transform|translate|scale|rotate|top|right|bottom|left|flex-basis|perspective)$/.test(property) ||
    /^(?:inset|margin|padding)(?:-|$)/.test(property) ||
    /^(?:(?:min|max)-)?(?:width|height|inline-size|block-size)$/.test(property) ||
    property.startsWith("offset-")
  );
}

/** Moving or resizing properties with positive transition durations.
 * Use when: enforcing reduced motion. Avoid when: checking colour-only transitions.
 */
export function movingTransitions(style: Style): string[] {
  return transitions(style)
    .filter(([property, ms]) => ms > 0 && moves(property))
    .map(([property]) => property);
}

/** Moving keyframe keys, matched as kebab-case CSS properties without changing the returned keys.
 * Use when: inspecting reduced-motion animations. Avoid when: treating keyframe metadata as styles.
 */
export function movingKeyframeProps(keys: string[]): string[] {
  return keys.filter(
    (key) =>
      !["offset", "easing", "composite", "computedOffset"].includes(key) &&
      moves(key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)),
  );
}

/** One computed box shadow with pixel geometry.
 * Use when: inspecting press edges and focus rings. Avoid when: passing authored shadow tokens.
 */
export interface Shadow {
  color: Rgba;
  x: number;
  y: number;
  blur: number;
  spread: number;
  inset: boolean;
}

function shadowList(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    if (char === "(") depth++;
    else if (char === ")") {
      depth--;
      if (depth < 0) return [];
    } else if (char === "," && depth === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }
  if (depth !== 0) return [];
  return [...parts, value.slice(start)];
}

/** Parses computed box shadows, dropping shadows with unsupported colours; none becomes an empty list.
 * Use when: collecting edge or ring geometry. Avoid when: parsing text shadows.
 */
export function parseShadows(value: string): Shadow[] {
  if (typeof value !== "string") return [];
  return shadowList(value).flatMap((part) => {
    const tokens = part.trim().match(/[^\s()]+\([^()]*\)|[^\s]+/g) ?? [];
    const inset = tokens.includes("inset");
    const components = tokens.filter((token) => token !== "inset");
    const first = parseColor(components[0] ?? "");
    const color = first ?? parseColor(components.at(-1) ?? "");
    if (!color) return [];
    const lengths = first ? components.slice(1) : components.slice(0, -1);
    if (lengths.length < 2 || lengths.length > 4) return [];
    return [
      {
        color,
        x: px(lengths[0]!),
        y: px(lengths[1]!),
        blur: px(lengths[2] ?? "0px"),
        spread: px(lengths[3] ?? "0px"),
        inset,
      },
    ];
  });
}

/** The first non-inset, unblurred, unspread shadow pointing straight down.
 * Use when: checking the Playground press edge. Avoid when: identifying elevation shadows.
 */
export function edge(style: Style): { height: number; color: Rgba } | null {
  const shadow = parseShadows(value(style, "box-shadow")).find(
    (shadow) => !shadow.inset && shadow.x === 0 && shadow.y > 0 && shadow.blur === 0 && shadow.spread === 0,
  );
  return shadow ? { height: shadow.y, color: shadow.color } : null;
}

/** Problems when a composited press edge is too close to its backdrop or face.
 * Use when: checking edge visibility in both themes. Avoid when: checking clipping geometry.
 */
export function edgeProblems(edge: { height: number; color: Rgba }, face: Rgba, backdrop: Rgba): string[] {
  const rendered = flatten([edge.color], backdrop);
  const problems: string[] = [];
  if (deltaE(rendered, backdrop) < LIMITS.edgeDeltaE) problems.push("press edge is too close to the backdrop");
  if (deltaE(rendered, face) < LIMITS.edgeDeltaE) problems.push("press edge is too close to the face");
  return problems;
}

/** A forced-colours boundary problem, or null for four visible borders or a visible outline.
 * Use when: checking control boundaries in forced colours. Avoid when: checking focus-ring contrast.
 */
export function boundaryProblem(style: Style): string | null {
  const borders = sides.every(
    (side) => visible(style, `border-${side}`) && px(value(style, `border-${side}-width`)) >= 1,
  );
  return borders || visible(style, "outline") ? null : "control needs a visible border on every side or an outline";
}

/** Whether the product of the separate scale x and computed matrix x scale is negative.
 * Use when: checking directional icons in RTL. Avoid when: parsing authored transform functions.
 */
export function flipped(style: Style): boolean {
  const scale = value(style, "scale").trim().split(/\s+/)[0] ?? "none";
  const x = scale.endsWith("%") ? number(scale.slice(0, -1), 100) / 100 : number(scale, 1);
  const match = /^matrix(3d)?\(([^()]*)\)$/.exec(value(style, "transform"));
  let matrixX = 1;
  if (match) {
    const parts = match[2]!.split(",").map((part) => part.trim());
    if (
      parts.length === (match[1] ? 16 : 6) &&
      parts.every((part) => numeric.test(part) && Number.isFinite(Number(part)))
    )
      matrixX = Number(parts[0]);
  }
  return x * matrixX < 0;
}

/** A colour-scheme problem, or null when it names exactly the theme; only is ignored.
 * Use when: checking native browser theming. Avoid when: selecting component colours.
 */
export function colorSchemeProblem(value: string, theme: "light" | "dark"): string | null {
  const schemes = value
    .trim()
    .split(/\s+/)
    .filter((scheme) => scheme !== "only");
  return schemes.length === 1 && schemes[0] === theme ? null : `color-scheme is "${value}" (expected "${theme}")`;
}

/** Indices whose parallel boxes moved or resized beyond the tolerance, defaulting to 0.5px.
 * Use when: checking layout stability. Avoid when: comparing computed styles.
 */
export function shifted(rest: Rect[], state: Rect[], tolerance = 0.5): number[] {
  return Array.from({ length: Math.max(rest.length, state.length) }, (_, index) => index).filter(
    (index) => !rest[index] || !state[index] || !sameBox(rest[index]!, state[index]!, tolerance),
  );
}

function color(style: Style, property: string): Rgba {
  const parsed = parseColor(value(style, property));
  if (parsed) return parsed;
  if (property === "background-color") return { ...BLACK, a: 0 };
  return parseColor(value(style, "color")) ?? BLACK;
}

function face(style: Style, backdrop: Rgba): Rgba {
  return flatten([color(style, "background-color")], backdrop);
}

function colorChanged(a: Rgba, b: Rgba, backdropA: Rgba, backdropB = backdropA): boolean {
  return deltaE(flatten([a], backdropA), flatten([b], backdropB)) >= LIMITS.deltaE;
}

function sameShadowGeometry(a: Shadow, b: Shadow): boolean {
  return a.x === b.x && a.y === b.y && a.blur === b.blur && a.spread === b.spread && a.inset === b.inset;
}

function different(a: Style, b: Style, properties: string[]): boolean {
  return properties.some((property) => value(a, property) !== value(b, property));
}

function styleChanges(a: Style, b: Style, backdropA: Rgba, backdropB: Rgba): string[] {
  const kinds: string[] = [];
  const faceA = face(a, backdropA);
  const faceB = face(b, backdropB);
  const changedColor = (property: string) => colorChanged(color(a, property), color(b, property), faceA, faceB);
  if (deltaE(faceA, faceB) >= LIMITS.deltaE) kinds.push("background");
  if (different(a, b, ["background-image"])) kinds.push("background-image");
  if (changedColor("color")) kinds.push("color");

  let borderChanged = false;
  let borderColorChanged = false;
  for (const side of sides) {
    const prefix = `border-${side}`;
    const shownA = visible(a, prefix);
    const shownB = visible(b, prefix);
    if (
      shownA !== shownB ||
      ((shownA || shownB) && px(value(a, `${prefix}-width`)) !== px(value(b, `${prefix}-width`)))
    )
      borderChanged = true;
    if ((shownA || shownB) && changedColor(`${prefix}-color`)) borderColorChanged = true;
  }
  if (borderChanged) kinds.push("border");
  if (borderColorChanged) kinds.push("border-color");

  const outlineA = visible(a, "outline");
  const outlineB = visible(b, "outline");
  if (
    outlineA !== outlineB ||
    ((outlineA || outlineB) &&
      ["outline-width", "outline-offset"].some((property) => px(value(a, property)) !== px(value(b, property))))
  )
    kinds.push("outline");
  if ((outlineA || outlineB) && changedColor("outline-color")) kinds.push("outline-color");

  const shadowsA = parseShadows(value(a, "box-shadow"));
  const shadowsB = parseShadows(value(b, "box-shadow"));
  if (
    shadowsA.length !== shadowsB.length ||
    shadowsA.some((shadow, index) => !sameShadowGeometry(shadow, shadowsB[index]!))
  )
    kinds.push("shadow");
  else if (shadowsA.some((shadow, index) => colorChanged(shadow.color, shadowsB[index]!.color, backdropA, backdropB)))
    kinds.push("shadow-color");

  const lineA = value(a, "text-decoration-line");
  const lineB = value(b, "text-decoration-line");
  const decorated = lineA !== "none" || lineB !== "none";
  if (
    lineA !== lineB ||
    (decorated &&
      ["text-decoration-thickness", "text-underline-offset"].some(
        (property) => px(value(a, property)) !== px(value(b, property)),
      ))
  )
    kinds.push("decoration");
  if (decorated && changedColor("text-decoration-color")) kinds.push("decoration-color");
  if (different(a, b, ["transform", "translate", "scale", "rotate"])) kinds.push("move");
  if (Math.abs(number(value(a, "opacity"), 1) - number(value(b, "opacity"), 1)) + Number.EPSILON >= 0.05)
    kinds.push("opacity");
  if (different(a, b, ["filter"])) kinds.push("filter");
  if (different(a, b, ["font-weight", "letter-spacing"])) kinds.push("text");
  if (different(a, b, ["visibility", "display"])) kinds.push("visibility");
  return kinds;
}

/** Visible change kinds, ordered by property group and then by pseudo element.
 * Use when: checking hover, press or state feedback. Avoid when: requiring exact style equality.
 */
export function changes(rest: Snapshot, state: Snapshot, backdrop: Rgba): string[] {
  const kinds = styleChanges(rest.self, state.self, backdrop, backdrop);
  const restFace = face(rest.self, backdrop);
  const stateFace = face(state.self, backdrop);
  for (const pseudo of ["before", "after"] as const) {
    const a = rest[pseudo];
    const b = state[pseudo];
    if (!a && !b) continue;
    if (!a || !b) kinds.push(`::${pseudo}`);
    else kinds.push(...styleChanges(a, b, restFace, stateFace).map((kind) => `::${pseudo} ${kind}`));
  }
  return kinds;
}

function styleDifferences(a: Style, b: Style): string[] {
  return STYLE_PROPS.filter(
    (property) =>
      property !== "cursor" &&
      !/^(?:transition|animation)-/.test(property) &&
      value(a, property) !== value(b, property),
  );
}

/** Exact snapshot differences, excluding cursor, transition and animation properties.
 * Use when: enforcing disabled inertness. Avoid when: deciding whether enabled feedback is visible.
 */
export function differences(rest: Snapshot, state: Snapshot): string[] {
  const properties = styleDifferences(rest.self, state.self);
  for (const pseudo of ["before", "after"] as const) {
    const a = rest[pseudo];
    const b = state[pseudo];
    if (!a && !b) continue;
    if (!a || !b) properties.push(`::${pseudo}`);
    else properties.push(...styleDifferences(a, b).map((property) => `::${pseudo} ${property}`));
  }
  return properties;
}

/** The six colour-only kinds, with self, before and after prefixes.
 * Use when: checking whether colour alone communicates state. Avoid when: classifying all style differences.
 */
export const COLOR_KINDS: ReadonlySet<string> = new Set(
  ["", "::before ", "::after "].flatMap((prefix) =>
    ["background", "color", "border-color", "outline-color", "shadow-color", "decoration-color"].map(
      (kind) => prefix + kind,
    ),
  ),
);

/** A problem for identical peers or low-contrast colour-only changes with equal descendant marks.
 * Use when: checking selected or checked state indicators. Avoid when: comparing sequential hover states.
 */
export function stateProblem(a: Snapshot, b: Snapshot, backdrop: Rgba): string | null {
  if ((a.marks ?? "") !== (b.marks ?? "")) return null;
  const kinds = changes(a, b, backdrop);
  if (kinds.length === 0) return "states look identical";
  const ratio = contrast(face(a.self, backdrop), face(b.self, backdrop));
  return kinds.every((kind) => COLOR_KINDS.has(kind)) && ratio < LIMITS.stateContrast
    ? `states differ only by colour (face contrast ${ratio.toFixed(2)}:1; minimum ${LIMITS.stateContrast}:1)`
    : null;
}

/** A detected focus ring with pixel band width, colour and per-side outsets.
 * Use when: checking focus-ring size, contrast and clipping. Avoid when: representing the control's press edge.
 */
export interface Ring {
  source: "outline" | "box-shadow" | "::before" | "::after";
  width: number;
  color: Rgba;
  outset: Sides;
}

function sameColor(a: Rgba, b: Rgba): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

function uniformBorder(style: Style): boolean {
  const width = px(value(style, "border-top-width"));
  return (
    width > 0 &&
    sides.every((side) => visible(style, `border-${side}`) && px(value(style, `border-${side}-width`)) === width)
  );
}

/** The widest outline, concentric shadow band or pseudo border that appears on focus.
 * Use when: finding keyboard focus feedback. Avoid when: accepting an unchanged resting border as a ring.
 */
export function ring(rest: Snapshot, focused: Snapshot): Ring | null {
  const candidates: Ring[] = [];
  const a = rest.self;
  const b = focused.self;
  const width = px(value(b, "outline-width"));
  const offset = px(value(b, "outline-offset"));
  const outlineColor = color(b, "outline-color");
  if (
    visible(b, "outline") &&
    (value(a, "outline-style") !== value(b, "outline-style") ||
      px(value(a, "outline-width")) !== width ||
      px(value(a, "outline-offset")) !== offset ||
      !sameColor(color(a, "outline-color"), outlineColor))
  ) {
    const amount = width + offset;
    candidates.push({
      source: "outline",
      width,
      color: outlineColor,
      outset: { top: amount, right: amount, bottom: amount, left: amount },
    });
  }

  const oldShadows = parseShadows(value(a, "box-shadow"));
  const newShadows = parseShadows(value(b, "box-shadow"))
    .filter(
      (shadow) => !oldShadows.some((old) => sameShadowGeometry(shadow, old) && sameColor(shadow.color, old.color)),
    )
    .filter((shadow) => !shadow.inset && shadow.x === 0 && shadow.y === 0 && shadow.blur === 0 && shadow.spread > 0)
    .sort((first, second) => second.spread - first.spread);
  const outer = newShadows[0];
  if (outer) {
    const inner = newShadows.find((shadow) => shadow.spread < outer.spread);
    const amount = outer.spread;
    candidates.push({
      source: "box-shadow",
      width: amount - (inner?.spread ?? 0),
      color: outer.color,
      outset: { top: amount, right: amount, bottom: amount, left: amount },
    });
  }

  for (const pseudo of ["before", "after"] as const) {
    const before = rest[pseudo];
    const after = focused[pseudo];
    if (!after || !uniformBorder(after)) continue;
    const appeared = !before || !sides.every((side) => visible(before, `border-${side}`));
    const changed =
      before &&
      sides.some(
        (side) => deltaE(color(before, `border-${side}-color`), color(after, `border-${side}-color`)) >= LIMITS.deltaE,
      );
    if (!appeared && !changed) continue;
    const outset: Sides = { top: 0, right: 0, bottom: 0, left: 0 };
    if (["absolute", "fixed"].includes(value(after, "position"))) {
      // Insets are measured from the element's padding box, inside its border, so the border width counts too.
      for (const side of sides) outset[side] = -px(value(after, side)) - px(value(b, `border-${side}-width`)) || 0;
    }
    candidates.push({
      source: `::${pseudo}`,
      width: px(value(after, "border-top-width")),
      color: color(after, "border-top-color"),
      outset,
    });
  }
  // A fully transparent outline isn't a ring: the press recipe keeps one so Windows high contrast can show focus.
  return candidates
    .filter((candidate) => candidate.color.a > 0)
    .reduce<Ring | null>((widest, candidate) => (!widest || candidate.width > widest.width ? candidate : widest), null);
}

/** Problems with a focus ring's band width and contrast against its opaque backdrop.
 * Use when: enforcing the 2px and 3:1 focus thresholds. Avoid when: checking ring clipping or hit tests.
 */
export function ringProblems(ring: Ring | null, backdrop: Rgba): string[] {
  if (!ring) return ["no visible focus ring"];
  const problems: string[] = [];
  if (ring.width < LIMITS.ringWidth)
    problems.push(`focus ring is ${ring.width}px wide (minimum ${LIMITS.ringWidth}px)`);
  const ratio = contrast(flatten([ring.color], backdrop), backdrop);
  if (ratio < LIMITS.ringContrast)
    problems.push(`focus ring contrast is ${ratio.toFixed(2)}:1 (minimum ${LIMITS.ringContrast}:1)`);
  return problems;
}

/** A reasoned, selector-scoped UX exception, optionally limited to projects.
 * Use when: processing validated story exceptions. Avoid when: suppressing an entire project or rule.
 */
export interface Exception {
  rule: RuleId;
  selector: string;
  reason: string;
  debt?: string;
  projects?: Mode[];
}

/** A UX rule failure tied to a reportable target.
 * Use when: reporting collected rule failures. Avoid when: storing live browser elements.
 */
export interface Violation {
  rule: RuleId;
  target: string;
  message: string;
}

/** Suppresses applicable exceptions and reports each one that suppressed nothing as stale. Debt exceptions are
 * never stale: they may span stories that don't all trigger them, and closing their debt removes them.
 * Use when: applying validated exceptions with the glue's closest matcher. Avoid when: validating exception shapes.
 */
export function applyExceptions(
  violations: Violation[],
  exceptions: Exception[],
  mode: Mode,
  matches: (violation: Violation, selector: string) => boolean,
): Violation[] {
  const applicable = exceptions.filter(
    (entry) => runs(entry.rule, mode) && (!entry.projects || entry.projects.includes(mode)),
  );
  const used = applicable.map(() => false);
  const remaining = violations.filter((violation) => {
    let suppressed = false;
    applicable.forEach((entry, index) => {
      if (entry.rule === violation.rule && matches(violation, entry.selector)) {
        used[index] = true;
        suppressed = true;
      }
    });
    return !suppressed;
  });
  applicable.forEach((entry, index) => {
    if (!used[index] && entry.debt === undefined)
      remaining.push({
        rule: "stale-exception",
        target: entry.selector,
        message: `exception suppressed no ${entry.rule} violation in ${mode}: ${entry.reason}`,
      });
  });
  return remaining;
}

/** Expected fixture rules that run in this project but produced no violation.
 * Use when: validating failing UX fixtures. Avoid when: deciding which normal stories pass.
 */
export function missingExpected(violations: Violation[], expected: RuleId[], mode: Mode): RuleId[] {
  return expected.filter((rule) => runs(rule, mode) && !violations.some((violation) => violation.rule === rule));
}

/** One readable line per violation, sorted by rule and then target.
 * Use when: emitting a UX failure report. Avoid when: serializing structured results for later processing.
 */
export function format(violations: Violation[]): string {
  return [...violations]
    .sort((a, b) => a.rule.localeCompare(b.rule) || a.target.localeCompare(b.target))
    .map((violation) => `${violation.rule}  ${violation.target}  ${violation.message}`)
    .join("\n");
}
