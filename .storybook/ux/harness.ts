// Browser side of the UX rules: after each story it reads computed styles, layout boxes, hit tests and screenshot
// pixels, drives real hover, press and Tab, and reports what rules.ts decides. Every decision lives in rules.ts,
// which is unit-tested in Node; this file only collects facts and must stay boring.
import { commands, page, userEvent } from "vitest/browser";
import { validateUxExcept } from "../../scripts/ux-rules.ts";
import { contrast, flatten, parseColor, type Rgba, WHITE } from "../../src/lib/color.ts";
import { mirrorDemoStates } from "../demo-states.ts";
import { outset, plusPoints, type Rect, undersized } from "./geometry.ts";
import {
  applyExceptions,
  boundaryProblem,
  changes,
  colorSchemeProblem,
  differences,
  type Exception,
  edge,
  edgeProblems,
  expectedCursor,
  flipped,
  format,
  type Kind,
  LIMITS,
  type Mode,
  missingExpected,
  movingKeyframeProps,
  movingTransitions,
  type RuleId,
  ring,
  ringProblems,
  runs,
  type Snapshot,
  STYLE_PROPS,
  type Style,
  shifted,
  stateProblem,
  transitionProblems,
  type Violation,
} from "./rules.ts";

/** `parameters.ux` on a story or component. */
export interface UxParameters {
  /** Reviewed exceptions. Each needs a reason a reviewer can judge (see AGENTS.md). */
  except?: Exception[];
  /** Fixture stories only: rules this story must trigger in every project where they run. */
  expect?: RuleId[];
}

const ROLES = `button link checkbox radio switch tab menuitem menuitemcheckbox menuitemradio option slider spinbutton
  combobox treeitem`.split(/\s+/);
const ACTIONABLE = [
  "button",
  "a[href]",
  "input:not([type=hidden])",
  "select",
  "textarea",
  "summary",
  "[contenteditable]:not([contenteditable=false])",
  ...ROLES.map((role) => `[role=${role}]`),
].join(",");
const NOT_TEXT = new Set(["button", "submit", "reset", "checkbox", "radio", "range", "color", "file", "image"]);
const STATE_ATTRIBUTES = [
  "aria-pressed",
  "aria-checked",
  "aria-selected",
  "aria-current",
  "data-pressed",
  "data-checked",
  "data-selected",
];
const MAX_DEMO = 40;
const TAB_STOPS = 3;
const FREEZE = "*, *::before, *::after { transition: none !important; animation: none !important; }";

type Add = (rule: RuleId, element: Element, message: string, part?: string) => void;
interface Shot {
  data: ImageData;
  left: number;
  top: number;
  scale: number;
}

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Blurs focus and moves Chrome's Tab starting point back to the top: after blur() alone, Tab resumes from the
 * element that last had focus. */
function resetFocus() {
  const start = document.createElement("span");
  start.tabIndex = -1;
  document.body.prepend(start);
  start.focus();
  start.remove();
}
const asRect = ({ left, top, width, height }: DOMRect): Rect => ({ left, top, width, height });

/** Rendered and at least 2×2px (visually hidden inputs are 1px). Decorative aria-hidden parts count. */
function visible(element: Element): boolean {
  if (!element.checkVisibility({ checkVisibilityCSS: true })) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 1 && rect.height > 1;
}

/** Visible and something people can reach: not aria-hidden, not inert. */
function exposed(element: Element): boolean {
  return visible(element) && !element.closest("[aria-hidden=true], [inert]");
}

function describe(element: Element): string {
  if (element === document.documentElement) return "html";
  const slot = element.getAttribute("data-slot");
  const text = (element.getAttribute("aria-label") ?? element.textContent ?? "").trim().replace(/\s+/g, " ");
  const name = text.length > 32 ? `${text.slice(0, 31)}…` : text;
  return `${element.localName}${slot ? `[data-slot=${slot}]` : ""}${name ? ` "${name}"` : ""}`;
}

function read(style: CSSStyleDeclaration): Style {
  return Object.fromEntries(STYLE_PROPS.map((property) => [property, style.getPropertyValue(property)]));
}

function pseudo(element: Element, which: "::before" | "::after"): Style | undefined {
  const style = getComputedStyle(element, which);
  const content = style.getPropertyValue("content");
  return content && content !== "none" && content !== "normal" ? read(style) : undefined;
}

function snap(element: Element): Snapshot {
  const marks = Array.from(element.querySelectorAll("*"), (child) => (visible(child) ? child.localName : ""));
  return {
    self: read(getComputedStyle(element)),
    before: pseudo(element, "::before"),
    after: pseudo(element, "::after"),
    marks: marks.filter(Boolean).join(","),
  };
}

/** The opaque colour behind an element: its ancestors' backgrounds, composited. */
function backdrop(element: Element): Rgba {
  const layers: Rgba[] = [];
  for (let node = element.parentElement; node; node = node.parentElement) {
    const color = parseColor(getComputedStyle(node).backgroundColor);
    if (!color || color.a === 0) continue;
    layers.push(color);
    if (color.a === 1) break;
  }
  return flatten(layers, WHITE);
}

function kindOf(element: Element): Kind {
  if (element instanceof HTMLTextAreaElement) return "text-entry";
  if (element instanceof HTMLInputElement) return NOT_TEXT.has(element.type) ? "action" : "text-entry";
  return element instanceof HTMLElement && element.isContentEditable ? "text-entry" : "action";
}

function stateOf(element: Element) {
  return {
    disabled:
      element.matches(":disabled") ||
      element.getAttribute("aria-disabled") === "true" ||
      element.hasAttribute("data-disabled"),
    loading: element.hasAttribute("data-loading") || element.getAttribute("aria-busy") === "true",
  };
}

function actionables(): Element[] {
  return Array.from(document.body.querySelectorAll(ACTIONABLE)).filter(exposed);
}

/** Every rendered HTML element, for layout-shift comparisons. */
function boxScope(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll("*")).filter(
    (element): element is HTMLElement => element instanceof HTMLElement && visible(element),
  );
}

/** Layout position and size, ignoring transforms: a press may translate, but must not move layout. */
function layoutBox(element: HTMLElement): Rect {
  let left = 0;
  let top = 0;
  for (let node: Element | null = element; node instanceof HTMLElement; node = node.offsetParent) {
    left += node.offsetLeft;
    top += node.offsetTop;
  }
  return { left, top, width: element.offsetWidth, height: element.offsetHeight };
}

/** Padding boxes of the ancestors that clip their content. */
function clips(element: Element): Rect[] {
  const rects: Rect[] = [];
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    const clipping =
      style.overflowX !== "visible" || style.overflowY !== "visible" || /paint|strict|content/.test(style.contain);
    if (!clipping) continue;
    const rect = node.getBoundingClientRect();
    rects.push({
      left: rect.left + node.clientLeft,
      top: rect.top + node.clientTop,
      width: node.clientWidth,
      height: node.clientHeight,
    });
  }
  return rects;
}

/** A link inside running text is exempt from target size (WCAG 2.5.8's inline exception). */
function inSentence(element: Element): boolean {
  if (getComputedStyle(element).display !== "inline") return false;
  return Array.from(element.parentElement?.childNodes ?? []).some(
    (node) => node !== element && node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim(),
  );
}

/** True when every point lands on the target, inside it, or on a label that activates it. */
function hits(target: Element, points: Array<{ x: number; y: number }>): boolean {
  return points.every(({ x, y }) => {
    const hit = document.elementFromPoint(x, y);
    if (!hit) return false;
    if (hit === target || target.contains(hit)) return true;
    return hit.closest("label")?.control === target;
  });
}

async function shoot(): Promise<Shot> {
  const html = document.documentElement;
  const base64 = await page.screenshot({ element: html, save: false });
  const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("UX harness: no 2D canvas");
  context.drawImage(bitmap, 0, 0);
  const rect = html.getBoundingClientRect();
  return {
    data: context.getImageData(0, 0, bitmap.width, bitmap.height),
    left: rect.left,
    top: rect.top,
    scale: bitmap.width / rect.width,
  };
}

function pixel(shot: Shot, x: number, y: number): Rgba | null {
  const column = Math.floor((x - shot.left) * shot.scale);
  const row = Math.floor((y - shot.top) * shot.scale);
  if (column < 0 || row < 0 || column >= shot.data.width || row >= shot.data.height) return null;
  const i = (row * shot.data.width + column) * 4;
  const [r = 0, g = 0, b = 0] = shot.data.data.subarray(i, i + 3);
  return { r, g, b, a: 1 };
}

/** Sides of a ring whose pixels don't change enough between two screenshots: clipped, covered or too faint.
 * Samples the middle fifth of each side, so rounded corners and pill ends don't count. */
function hiddenSides(before: Shot, after: Shot, rect: Rect, width: number): string[] {
  const mid = width / 2;
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  const along = (start: number, length: number, t: number) => start + length * (0.4 + t * 0.2);
  const sides: Array<[string, (t: number) => [number, number]]> = [
    ["top", (t) => [along(rect.left, rect.width, t), rect.top + mid]],
    ["bottom", (t) => [along(rect.left, rect.width, t), bottom - mid]],
    ["left", (t) => [rect.left + mid, along(rect.top, rect.height, t)]],
    ["right", (t) => [right - mid, along(rect.top, rect.height, t)]],
  ];
  return sides
    .filter(([, at]) => {
      let changed = 0;
      for (let i = 0; i < 5; i++) {
        const [x, y] = at(i / 4);
        const a = pixel(before, x, y);
        const b = pixel(after, x, y);
        if (a && b && contrast(a, b) >= LIMITS.ringContrast) changed++;
      }
      return changed < 4;
    })
    .map(([side]) => side);
}

/** Text nodes laid out by this element (not by a block-level descendant) must stay inside its padding box. */
function textOverflow(element: Element, style: CSSStyleDeclaration, add: Add) {
  if (!(element instanceof HTMLElement) || ["inline", "contents"].includes(style.display)) return;
  if (/auto|scroll/.test(`${style.overflowX} ${style.overflowY}`)) return;
  if (style.textOverflow === "ellipsis" && style.overflowX !== "visible") return;
  if (style.getPropertyValue("-webkit-line-clamp") !== "none") return;
  const box = element.getBoundingClientRect();
  const left = box.left + element.clientLeft;
  const top = box.top + element.clientTop;
  const clipsY = style.overflowY !== "visible";
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    let owner = node.parentElement;
    while (owner && owner !== element && getComputedStyle(owner).display === "inline") owner = owner.parentElement;
    if (owner !== element) continue;
    range.selectNodeContents(node);
    const text = range.getBoundingClientRect();
    const outX = text.left < left - 1 || text.right > left + element.clientWidth + 1;
    const outY = clipsY && (text.top < top - 2 || text.bottom > top + element.clientHeight + 2);
    if (outX || outY) {
      add("text-overflow", element, `text runs outside its box ("${node.textContent.trim().slice(0, 24)}")`);
      return;
    }
  }
}

function checkCursor(element: Element, kind: Kind, state: { disabled: boolean; loading: boolean }, add: Add) {
  const allowed = expectedCursor(kind, state);
  if (!allowed) return;
  const own = getComputedStyle(element);
  if (own.pointerEvents === "none") {
    add("cursor", element, "has pointer-events: none, so its cursor never shows and clicks fall through");
    return;
  }
  const expected = allowed.join(" or ");
  if (!allowed.includes(own.cursor)) add("cursor", element, `cursor is ${own.cursor}, expected ${expected}`);
  for (const child of element.querySelectorAll("*")) {
    const style = getComputedStyle(child);
    if (style.pointerEvents === "none" || !visible(child) || allowed.includes(style.cursor)) continue;
    add("cursor", child, `cursor is ${style.cursor} inside ${describe(element)}, expected ${expected}`);
  }
}

/** Animations that loop, move under reduced motion, or don't finish within the budget. */
async function settle(mode: Mode, add: Add) {
  const animations = document.getAnimations();
  const finite: Animation[] = [];
  for (const animation of animations) {
    const effect = animation.effect;
    if (!(effect instanceof KeyframeEffect) || !effect.target) continue;
    const part = effect.pseudoElement ? ` ${effect.pseudoElement}` : "";
    if (mode !== "motion") {
      const moving = movingKeyframeProps(effect.getKeyframes().flatMap((keyframe) => Object.keys(keyframe)));
      if (moving.length)
        add("reduce-no-move", effect.target, `animates ${moving.join(", ")} under reduced motion`, part);
    }
    if (effect.getComputedTiming().iterations !== Number.POSITIVE_INFINITY) finite.push(animation);
    else if (!effect.target.closest('[data-slot="spinner"], [data-slot="skeleton"]'))
      add("settle", effect.target, "animates forever; only Spinner and Skeleton may loop", part);
  }
  const budget = new Promise((resolve) => setTimeout(resolve, LIMITS.settleMs));
  await Promise.race([Promise.allSettled(finite.map((animation) => animation.finished)), budget]);
  for (const animation of finite) {
    const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
    if (target && animation.playState === "running")
      add("settle", target, `still animating after ${LIMITS.settleMs}ms`);
  }
  for (const element of document.querySelectorAll("[data-starting-style], [data-ending-style]"))
    add("settle", element, "stuck with data-starting-style or data-ending-style");
}

/** One pass over the rendered DOM at rest, with real transitions. */
function scan(mode: Mode, add: Add) {
  const html = document.documentElement;
  for (const element of [html, ...document.body.querySelectorAll(".dark, .light, [data-theme]")]) {
    const theme = element.classList.contains("dark") || element.getAttribute("data-theme") === "dark";
    const problem = colorSchemeProblem(getComputedStyle(element).colorScheme, theme ? "dark" : "light");
    if (problem) add("color-scheme", element, problem);
  }

  const scope = Array.from(document.body.querySelectorAll("*")).filter(visible);
  if (runs("reflow", mode) && html.scrollWidth > html.clientWidth + 0.5) {
    const wide = scope.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > html.clientWidth + 0.5 || rect.left < -0.5;
    });
    const innermost = wide.filter((element) => !wide.some((other) => other !== element && element.contains(other)));
    for (const element of innermost.slice(0, 3))
      add("reflow", element, `sticks out of the ${html.clientWidth}px viewport, so the page scrolls sideways`);
    if (!innermost.length) add("reflow", html, "the page scrolls sideways");
  }

  for (const element of scope) {
    const style = getComputedStyle(element);
    const self = read(style);
    const parts: Array<[string, Style | undefined]> = [
      ["", self],
      [" ::before", pseudo(element, "::before")],
      [" ::after", pseudo(element, "::after")],
    ];
    for (const [part, partStyle] of parts) {
      if (!partStyle) continue;
      for (const message of transitionProblems(partStyle)) add("transitions", element, message, part);
      const moving = mode === "motion" ? [] : movingTransitions(partStyle);
      if (moving.length) add("reduce-no-move", element, `transitions ${moving.join(", ")} under reduced motion`, part);
    }
    if (element.hasAttribute("data-icon-directional")) {
      const rtl = style.direction === "rtl";
      if (flipped(self) !== rtl) add("directional", element, rtl ? "isn't mirrored in right-to-left" : "is mirrored");
    }
    const pressEdge = edge(self);
    if (pressEdge) {
      const behind = backdrop(element);
      const face = flatten([parseColor(style.backgroundColor) ?? { r: 0, g: 0, b: 0, a: 0 }], behind);
      for (const problem of edgeProblems(pressEdge, face, behind)) add("edge-visible", element, problem);
      const rect = element.getBoundingClientRect();
      const cut = clips(element).some(({ top, height }) => {
        const limit = top + height + 0.5;
        return rect.bottom <= limit && rect.bottom + pressEdge.height > limit;
      });
      if (cut) add("edge-clip", element, `its ${pressEdge.height}px edge is cut off by a clipping container`);
    }
    textOverflow(element, style, add);
  }

  const targets: Element[] = [];
  for (const element of actionables()) {
    const kind = kindOf(element);
    const style = getComputedStyle(element);
    checkCursor(element, kind, stateOf(element), add);
    if (
      (kind === "text-entry" || element instanceof HTMLSelectElement) &&
      parseFloat(style.fontSize) < LIMITS.inputFontPx
    )
      add("input-font", element, `font size is ${style.fontSize}; phones zoom in below ${LIMITS.inputFontPx}px`);
    const nativeCheck = element instanceof HTMLInputElement && ["checkbox", "radio"].includes(element.type);
    const link = element instanceof HTMLAnchorElement || element.getAttribute("role") === "link";
    const problem = runs("boundary", mode) && !nativeCheck && !link ? boundaryProblem(read(style)) : null;
    if (problem) add("boundary", element, problem);
    if (!inSentence(element)) targets.push(element);
  }
  for (const label of document.body.querySelectorAll("label")) {
    const control = label.control;
    if (!control || !exposed(label)) continue;
    const kind = kindOf(control) === "text-entry" ? "label-text" : "label-action";
    checkCursor(label, kind, stateOf(control), add);
  }

  if (runs("target-size", mode)) {
    const spaced = new Set(undersized(targets.map((target) => asRect(target.getBoundingClientRect()))));
    targets.forEach((target, index) => {
      target.scrollIntoView({ block: "center", inline: "center" });
      const rect = target.getBoundingClientRect();
      const touch = mode === "touch" && kindOf(target) === "action";
      const min = touch ? LIMITS.touchTarget : LIMITS.target;
      if (hits(target, plusPoints(asRect(rect), min)) || (!touch && !spaced.has(index))) return;
      const size = `${Math.round(rect.width)}×${Math.round(rect.height)}`;
      add("target-size", target, `its hit area is under ${min}×${min}px (${size}) without enough spacing`);
    });
    scrollTo(0, 0);
  }

  const stateful = Array.from(document.body.querySelectorAll(STATE_ATTRIBUTES.map((name) => `[${name}]`).join(",")));
  const key = (element: Element) => STATE_ATTRIBUTES.map((name) => element.getAttribute(name) ?? "").join("|");
  // Compare each pair of states once per group: one group passing says nothing about the next.
  const compared = new Map<Element | null, Set<string>>();
  for (const a of stateful.filter(exposed)) {
    for (const b of stateful.filter(exposed)) {
      if (a === b || a.parentElement !== b.parentElement || a.localName !== b.localName) continue;
      if (a.getAttribute("data-slot") !== b.getAttribute("data-slot") || key(a) === key(b)) continue;
      const pair = [key(a), key(b)].sort().join(" vs ");
      const seen = compared.get(a.parentElement) ?? new Set<string>();
      if (seen.has(pair)) continue;
      compared.set(a.parentElement, seen.add(pair));
      const problem = stateProblem(snap(a), snap(b), backdrop(a));
      if (problem) add("state-not-color", a, problem);
    }
  }
}

/** Hover, press and focus drawn through the data-demo mirror on every control (transitions frozen). */
function demoStates(mode: Mode, add: Add) {
  const scope = boxScope();
  const boxes = () => scope.map(layoutBox);
  for (const element of actionables().slice(0, MAX_DEMO)) {
    if (element.hasAttribute("data-demo") || kindOf(element) === "text-entry") continue;
    const { disabled, loading } = stateOf(element);
    const behind = backdrop(element);
    const rest = snap(element);
    const restBoxes = boxes();
    const states: Array<[string, string]> = [
      ["hover", "hover"],
      ["press", "hover active"],
    ];
    if (!element.matches(":disabled")) states.push(["focus", "focus"]);
    const seen = new Map<string, Snapshot>();
    for (const [name, value] of states) {
      element.setAttribute("data-demo", value);
      seen.set(name, snap(element));
      for (const index of shifted(restBoxes, boxes()))
        add("no-layout-shift", scope[index]!, `moves or resizes when ${describe(element)} shows ${name}`);
    }
    element.removeAttribute("data-demo");
    const hover = seen.get("hover")!;
    const press = seen.get("press")!;
    const focus = seen.get("focus");
    if (disabled || loading) {
      const why = loading ? "loading" : "disabled";
      for (const [name, state] of [
        ["hover", hover],
        ["press", press],
      ] as const) {
        const changed = differences(rest, state);
        if (changed.length) add("disabled-inert", element, `${name} changes ${changed.join(", ")} while ${why}`);
      }
    } else {
      if (!changes(rest, hover, behind).length) add("hover-visible", element, "hover doesn't visibly change it");
      if (!changes(mode === "touch" ? rest : hover, press, behind).length)
        add("press-visible", element, "pressing doesn't visibly change it");
    }
    const sticky = mode === "touch" ? differences(rest, hover) : [];
    if (sticky.length) add("no-sticky-hover", element, `hover styles apply on a touch screen: ${sticky.join(", ")}`);
    if (focus) for (const problem of ringProblems(ring(rest, focus), behind)) add("focus-ring", element, problem);
  }
}

/** Real mouse hover and press on one enabled and one disabled (or loading) button. */
async function realPointer(mode: Mode, add: Add) {
  const buttons = actionables().filter(
    (element) => kindOf(element) === "action" && !element.matches("a") && !element.hasAttribute("data-demo"),
  );
  const inert = (element: Element) => stateOf(element).disabled || stateOf(element).loading;
  const scope = boxScope();
  const boxes = () => scope.map(layoutBox);
  for (const element of [buttons.find((button) => !inert(button)), buttons.find(inert)]) {
    if (!element) continue;
    const state = stateOf(element);
    const behind = backdrop(element);
    const rest = snap(element);
    const restBoxes = boxes();
    element.setAttribute("data-ux-probe", "");
    try {
      await commands.uxMouse("move", "[data-ux-probe]");
      await frame();
      const hover = snap(element);
      const hoverBoxes = boxes();
      const rect = element.getBoundingClientRect();
      const under = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const cursor = under ? getComputedStyle(under).cursor : "none";
      await commands.uxMouse("down");
      await frame();
      const press = snap(element);
      const pressBoxes = boxes();
      await commands.uxMouse("park");
      const allowed = expectedCursor("action", state);
      if (allowed && !allowed.includes(cursor))
        add("cursor", element, `the pointer shows ${cursor} over it, expected ${allowed.join(" or ")}`);
      for (const [name, measured] of [
        ["hovered", hoverBoxes],
        ["pressed", pressBoxes],
      ] as const)
        for (const index of shifted(restBoxes, measured))
          add("no-layout-shift", scope[index]!, `moves or resizes when ${describe(element)} is ${name}`);
      if (inert(element)) {
        const changed = [...differences(rest, hover), ...differences(rest, press)];
        if (changed.length) add("disabled-inert", element, `a real hover or press changes ${[...new Set(changed)]}`);
      } else {
        if (!changes(rest, hover, behind).length) add("hover-visible", element, "a real hover doesn't change it");
        if (!changes(mode === "touch" ? rest : hover, press, behind).length)
          add("press-visible", element, "a real press doesn't change it");
      }
    } finally {
      element.removeAttribute("data-ux-probe");
    }
  }
}

/** Real Tab stops: a visible, unclipped, uncovered ring with no layout shift. (No ring after a mouse press is a
 * static check: rings use focus-visible:, never focus:, see scripts/check.ts.) */
async function realFocus(mode: Mode, add: Add) {
  if (!runs("focus-ring", mode)) return;
  resetFocus();
  const focusable = Array.from(document.body.querySelectorAll("*")).filter(
    (element): element is HTMLElement => element instanceof HTMLElement && element.tabIndex >= 0 && exposed(element),
  );
  // A story that pins an element's look with data-demo shows its ring at rest, so real focus changes nothing.
  const pinned = (element: Element) => element.hasAttribute("data-demo");
  const rests = new Map(focusable.map((element) => [element as Element, snap(element)]));
  const scope = boxScope();
  const restBoxes = scope.map(layoutBox);
  const before = await shoot();
  const seen = new Set<Element>();
  for (let stop = 0; stop < TAB_STOPS; stop++) {
    await userEvent.tab();
    const element = document.activeElement;
    if (!element || element === document.body || seen.has(element)) break;
    seen.add(element);
    const rest = rests.get(element);
    if (!rest || pinned(element)) continue;
    if (!element.matches(":focus-visible")) {
      add("focus-ring", element, "keyboard focus doesn't match :focus-visible");
      continue;
    }
    for (const index of shifted(restBoxes, scope.map(layoutBox)))
      add("no-layout-shift", scope[index]!, `moves or resizes when ${describe(element)} gets keyboard focus`);
    const found = ring(rest, snap(element));
    const problems = ringProblems(found, backdrop(element));
    for (const problem of problems) add("focus-ring", element, problem);
    if (!found || problems.length) continue;
    const area = outset(asRect(element.getBoundingClientRect()), found.outset);
    const hidden = hiddenSides(before, await shoot(), area, found.width);
    if (hidden.length) add("focus-ring", element, `the ring is clipped, covered or faint on the ${hidden.join(", ")}`);
  }
}

/** Runs every UX rule for the current story and throws a readable report if any fail. */
export async function checkUx(mode: Mode, parameters: UxParameters = {}): Promise<void> {
  const exceptions = parameters.except ?? [];
  const invalid = validateUxExcept(exceptions);
  if (invalid.length) throw new Error(`Invalid parameters.ux.except:\n${invalid.join("\n")}`);
  if (parameters.expect && !parameters.expect.some((rule) => runs(rule, mode))) return;
  mirrorDemoStates(); // picks up stylesheets the story itself rendered
  // Measure from rest, not from wherever the play test left the pointer and focus.
  await commands.uxMouse("park");
  resetFocus();
  await frame();

  const found: Array<{ violation: Violation; element: Element }> = [];
  const add: Add = (rule, element, message, part = "") => {
    if (runs(rule, mode)) found.push({ violation: { rule, target: describe(element) + part, message }, element });
  };

  await settle(mode, add);
  scan(mode, add);
  const freeze = document.createElement("style");
  freeze.textContent = FREEZE;
  document.head.append(freeze);
  try {
    demoStates(mode, add);
    await realPointer(mode, add);
    await realFocus(mode, add);
  } finally {
    freeze.remove();
    await commands.uxMouse("park");
    resetFocus();
    scrollTo(0, 0);
    // The probes end with mouse input, which leaves Chrome in pointer mode: the next story's Tab would then focus
    // without :focus-visible. A key press puts it back in keyboard mode.
    await userEvent.keyboard("{Shift}");
  }

  const elements = new Map(found.map(({ violation, element }) => [violation, element]));
  const violations = found.map(({ violation }) => violation);
  const failures = applyExceptions(violations, exceptions, mode, (violation, selector) => {
    return !!elements.get(violation)?.closest(selector);
  });
  if (parameters.expect) {
    const missing = missingExpected(failures, parameters.expect, mode);
    if (missing.length) throw new Error(`This UX fixture should trigger ${missing.join(", ")} in ${mode}`);
    return;
  }
  if (failures.length) throw new Error(`UX rules failed in ${mode}:\n${format(failures)}`);
}
