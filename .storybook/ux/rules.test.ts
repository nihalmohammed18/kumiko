import { describe, expect, it } from "vitest";
import { MODES, RULE_IDS } from "../../scripts/ux-rules.ts";
import { BLACK, WHITE } from "../../src/lib/color.ts";
import type { Rect } from "./geometry.ts";
import {
  applyExceptions,
  boundaryProblem,
  COLOR_KINDS,
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
  parseShadows,
  type Ring,
  type RuleId,
  ring,
  ringProblems,
  runs,
  type Snapshot,
  STYLE_PROPS,
  type Style,
  selectorClasses,
  shifted,
  stateProblem,
  transitionProblems,
  type Violation,
} from "./rules.ts";

describe("shared contract", () => {
  const matrix: Record<RuleId, string> = {
    cursor: "111000",
    "disabled-inert": "111000",
    "hover-visible": "111000",
    "color-scheme": "111000",
    "press-visible": "111100",
    "edge-clip": "111100",
    "text-overflow": "111100",
    "no-layout-shift": "111110",
    "focus-ring": "111010",
    "reduce-no-move": "111110",
    "target-size": "100100",
    "input-font": "100100",
    "edge-visible": "110000",
    "state-not-color": "110010",
    directional: "101000",
    reflow: "000100",
    "no-sticky-hover": "000100",
    boundary: "000010",
    "dead-class": "100000",
    transitions: "111111",
    settle: "111111",
    "stale-exception": "111111",
  };
  it.each(RULE_IDS)("runs %s only in its specified projects", (rule) => {
    MODES.forEach((mode, index) => {
      expect(runs(rule, mode), `${rule} in ${mode}`).toBe(matrix[rule][index] === "1");
    });
  });
  it("exposes exactly the snapshot properties, with no duplicates", () => {
    expect(STYLE_PROPS).toEqual(
      `cursor pointer-events visibility display position opacity background-color background-image
      color border-top-width border-top-style border-top-color border-right-width border-right-style border-right-color
      border-bottom-width border-bottom-style border-bottom-color border-left-width border-left-style border-left-color
      outline-style outline-width outline-color outline-offset box-shadow text-decoration-line text-decoration-color
      text-decoration-thickness text-underline-offset transform translate scale rotate filter font-weight font-size
      letter-spacing transition-property transition-duration animation-name animation-duration animation-iteration-count
      color-scheme forced-color-adjust top right bottom left content`
        .trim()
        .split(/\s+/),
    );
    expect(new Set(STYLE_PROPS).size).toBe(STYLE_PROPS.length);
  });
  it("exposes the packet's exact thresholds", () => {
    expect(LIMITS).toEqual({
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
    });
  });
});

const black = "rgb(0, 0, 0)";
const white = "rgb(255, 255, 255)";
const sideNames = ["top", "right", "bottom", "left"] as const;
const snapshot = (self: Style = {}): Snapshot => ({ self });
const border = (width = "2px", color = black, style = "solid"): Style =>
  Object.fromEntries(
    sideNames.flatMap((side) => [
      [`border-${side}-width`, width],
      [`border-${side}-style`, style],
      [`border-${side}-color`, color],
    ]),
  );

describe("shadows and edges", () => {
  it("parses colour-first and colour-last shadows and splits commas outside colour functions", () => {
    expect(parseShadows("rgba(0, 0, 0, 0.5) 0px 4px 0px 0px, 1px -2px 3px 4px rgb(255, 255, 255) inset")).toEqual([
      { color: { ...BLACK, a: 0.5 }, x: 0, y: 4, blur: 0, spread: 0, inset: false },
      { color: WHITE, x: 1, y: -2, blur: 3, spread: 4, inset: true },
    ]);
    expect(parseShadows("inset color(srgb 0 0 0 / 50%) -1.5px -2.25px")).toEqual([
      { color: { ...BLACK, a: 0.5 }, x: -1.5, y: -2.25, blur: 0, spread: 0, inset: true },
    ]);
  });
  it("drops unsupported colours but retains other shadows, including transparent ones", () => {
    expect(parseShadows(`lab(54 80 70) 0px 4px 0px 0px, ${black} 0px 2px 0px 0px`)).toEqual([
      { color: BLACK, x: 0, y: 2, blur: 0, spread: 0, inset: false },
    ]);
    expect(parseShadows("transparent 0px 4px")[0]?.color).toEqual({ ...BLACK, a: 0 });
    for (const input of [
      "none",
      "",
      "garbage",
      "red 0px 4px",
      "rgb(0, 0, 0 0px 4px",
      "rgb(0, 0, 0)",
      "rgb(0, 0, 0)) 0px 4px",
    ])
      expect(parseShadows(input)).toEqual([]);
  });
  it("treats non-pixel lengths as zero and defaults omitted blur and spread", () => {
    expect(parseShadows(`${black} 1rem 2em 3% 4px`)).toEqual([
      { color: BLACK, x: 0, y: 0, blur: 0, spread: 4, inset: false },
    ]);
    expect(parseShadows(`${black} 0px 4px 1px`)[0]?.spread).toBe(0);
  });
  it("selects the first non-inset downward edge with no x offset, blur or spread", () => {
    const nonEdges = `inset ${black} 0px 2px 0px 0px, ${black} 1px 2px 0px 0px,
      ${black} 0px -2px 0px 0px, ${black} 0px 0px 0px 0px, ${black} 0px 2px 1px 0px, ${black} 0px 2px 0px 1px`;
    expect(edge({ "box-shadow": `${nonEdges}, ${black} 0px 4px 0px 0px, ${white} 0px 6px 0px 0px` })).toEqual({
      height: 4,
      color: BLACK,
    });
    expect(edge({ "box-shadow": nonEdges })).toBeNull();
    expect(edge({})).toBeNull();
  });
  it("requires the edge to differ from both the backdrop and the face, after compositing", () => {
    expect(edgeProblems({ height: 4, color: BLACK }, WHITE, WHITE)).toEqual([]);
    expect(edgeProblems({ height: 4, color: BLACK }, BLACK, WHITE)).toEqual([expect.stringContaining("face")]);
    expect(edgeProblems({ height: 4, color: WHITE }, BLACK, WHITE)).toEqual([expect.stringContaining("backdrop")]);
    expect(edgeProblems({ height: 4, color: WHITE }, WHITE, WHITE)).toHaveLength(2);
    expect(edgeProblems({ height: 4, color: { ...BLACK, a: 0 } }, WHITE, WHITE)).toHaveLength(2);
    expect(edgeProblems({ height: 4, color: { r: 254, g: 254, b: 254, a: 1 } }, WHITE, WHITE)).toHaveLength(2);
  });
});

describe("boundary", () => {
  it("accepts a border of at least 1px on every side or any visible outline", () => {
    expect(boundaryProblem(border("1px"))).toBeNull();
    expect(boundaryProblem({ "outline-style": "solid", "outline-width": "0.5px" })).toBeNull();
    expect(boundaryProblem({ ...border("0px"), "outline-style": "solid", "outline-width": "2px" })).toBeNull();
  });
  it("rejects missing, hidden, zero-width and incomplete boundaries", () => {
    expect(boundaryProblem({})).toEqual(expect.any(String));
    expect(boundaryProblem(border("0.9px"))).toEqual(expect.any(String));
    expect(boundaryProblem(border("2px", black, "hidden"))).toEqual(expect.any(String));
    for (const side of sideNames)
      expect(boundaryProblem({ ...border(), [`border-${side}-style`]: "none" })).toEqual(expect.any(String));
    for (const style of [
      { "outline-style": "none", "outline-width": "2px" },
      { "outline-style": "hidden", "outline-width": "2px" },
      { "outline-style": "solid", "outline-width": "0px" },
      { "outline-style": "solid", "outline-width": "2em" },
    ])
      expect(boundaryProblem(style)).toEqual(expect.any(String));
  });
});

describe("direction and colour scheme", () => {
  it.each([
    [{}, false],
    [{ scale: "-1" }, true],
    [{ scale: "-1 1" }, true],
    [{ scale: "-100% 100%" }, true],
    [{ transform: "matrix(-1, 0, 0, 1, 0, 0)" }, true],
    [{ transform: "matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)" }, true],
    [{ scale: "-1 1", transform: "matrix(-1, 0, 0, 1, 0, 0)" }, false],
    [{ scale: "0", transform: "matrix(-1, 0, 0, 1, 0, 0)" }, false],
    [{ scale: "garbage", transform: "matrix(garbage)" }, false],
    [{ transform: "matrix(-1, 0)" }, false],
    [{ transform: "matrix(1e999, 0, 0, 1, 0, 0)" }, false],
    [{ scale: "-1px 1" }, false],
  ] satisfies [Style, boolean][])("detects the product of the separate x scales in %j", (style, expected) => {
    expect(flipped(style)).toBe(expected);
  });
  it("accepts exactly the theme, ignoring only", () => {
    expect(colorSchemeProblem("light", "light")).toBeNull();
    expect(colorSchemeProblem(" only light ", "light")).toBeNull();
    expect(colorSchemeProblem("dark only", "dark")).toBeNull();
    for (const value of ["", "normal", "light dark", "dark", "light light", "only", "garbage"])
      expect(colorSchemeProblem(value, "light")).toEqual(expect.any(String));
  });
});

describe("shifted", () => {
  const boxes: Rect[] = [
    { left: 0, top: 0, width: 24, height: 24 },
    { left: 40, top: 0, width: 40, height: 40 },
  ];
  it("reports moved or resized edges beyond the default or explicit tolerance", () => {
    const state = [
      { ...boxes[0]!, left: 0.5 },
      { ...boxes[1]!, width: 40.6 },
    ];
    expect(shifted(boxes, state)).toEqual([1]);
    expect(shifted(boxes, state, 1)).toEqual([]);
    expect(shifted(boxes, state, 0)).toEqual([0, 1]);
    expect(shifted(boxes, boxes)).toEqual([]);
    expect(shifted([], [])).toEqual([]);
  });
  it("handles missing parallel boxes without throwing and does not mutate inputs", () => {
    const original = structuredClone(boxes);
    expect(shifted(boxes, boxes.slice(0, 1))).toEqual([1]);
    expect(shifted(boxes.slice(0, 1), boxes)).toEqual([1]);
    expect(boxes).toEqual(original);
  });
});

describe("expectedCursor", () => {
  const cases: [Kind, boolean, boolean, string[] | null][] = [
    ["action", false, false, ["pointer"]],
    ["action", true, false, ["not-allowed"]],
    ["action", false, true, ["progress"]],
    ["action", true, true, ["progress"]],
    ["label-action", false, false, ["pointer"]],
    ["label-action", true, false, ["not-allowed"]],
    ["label-action", false, true, ["progress"]],
    ["label-action", true, true, ["progress"]],
    ["text-entry", false, false, ["text", "auto"]],
    ["text-entry", true, false, ["not-allowed"]],
    ["text-entry", false, true, null],
    ["text-entry", true, true, null],
    ["label-text", false, false, null],
    ["label-text", true, false, ["not-allowed"]],
    ["label-text", false, true, null],
    ["label-text", true, true, ["not-allowed"]],
  ];
  it.each(cases)("checks %s with disabled=%s and loading=%s", (kind, disabled, loading, expected) => {
    expect(expectedCursor(kind, { disabled, loading })).toEqual(expected);
  });
});

const moving = `all transform translate scale rotate top right bottom left inset inset-inline-start inset-block-end
  margin margin-left margin-inline padding padding-top padding-inline-end width height min-width max-width min-height
  max-height inline-size block-size min-inline-size max-inline-size min-block-size max-block-size flex-basis offset-path
  offset-distance offset-position offset-anchor offset-rotate perspective`
  .trim()
  .split(/\s+/);

describe("motion", () => {
  it("allows the initial values, zero-duration all and the 300ms limit", () => {
    expect(transitionProblems({})).toEqual([]);
    expect(transitionProblems({ "transition-property": "all", "transition-duration": "0s" })).toEqual([]);
    expect(transitionProblems({ "transition-property": "opacity", "transition-duration": "300ms" })).toEqual([]);
    expect(transitionProblems({ "transition-property": "opacity", "transition-duration": ".15s" })).toEqual([]);
  });
  it("reports all with a duration and separately reports over-budget durations", () => {
    expect(transitionProblems({ "transition-property": "all", "transition-duration": "0.1s" })).toEqual([
      expect.stringContaining("all"),
    ]);
    const problems = transitionProblems({ "transition-property": "all", "transition-duration": "301ms" });
    expect(problems).toHaveLength(2);
    expect(problems[1]).toContain("301ms");
  });
  it("cycles durations to the property count and ignores excess durations", () => {
    expect(
      transitionProblems({ "transition-property": "opacity, transform, width", "transition-duration": "100ms, .4s" }),
    ).toEqual([expect.stringContaining("transform")]);
    expect(transitionProblems({ "transition-property": "opacity", "transition-duration": ".1s, 2s" })).toEqual([]);
    expect(
      movingTransitions({
        "transition-property": "opacity, transform, left, color",
        "transition-duration": "0s, 150ms",
      }),
    ).toEqual(["transform"]);
  });
  it.each(moving)("recognises moving transition property %s only with positive duration", (property) => {
    expect(movingTransitions({ "transition-property": property, "transition-duration": "150ms" })).toEqual([property]);
    expect(movingTransitions({ "transition-property": property, "transition-duration": "0s" })).toEqual([]);
  });
  it("ignores non-moving properties and malformed durations without throwing", () => {
    const style: Style = {
      "transition-property": "opacity, color, box-shadow, filter, visibility",
      "transition-duration": "1s",
    };
    expect(movingTransitions(style)).toEqual([]);
    expect(movingTransitions({})).toEqual([]);
    for (const duration of ["garbage", "100px", "1s trailing", "-1s", "1e999s", ""]) {
      expect(transitionProblems({ "transition-duration": duration })).toEqual([]);
      expect(movingTransitions({ "transition-property": "transform", "transition-duration": duration })).toEqual([]);
    }
  });
  it("matches camelCase keyframes while retaining their original keys and ignoring metadata", () => {
    expect(
      movingKeyframeProps(["offset", "easing", "composite", "computedOffset", "opacity", "color", "fontWeight"]),
    ).toEqual([]);
    expect(
      movingKeyframeProps([
        "transform",
        "marginLeft",
        "paddingInlineStart",
        "minInlineSize",
        "offsetPath",
        "perspective",
      ]),
    ).toEqual(["transform", "marginLeft", "paddingInlineStart", "minInlineSize", "offsetPath", "perspective"]);
    expect(movingKeyframeProps(moving)).toEqual(moving);
  });
});

describe("visible changes", () => {
  it("reports visible kinds in the specified order", () => {
    const rest = snapshot({
      ...border(),
      "background-color": white,
      "background-image": "url(a)",
      color: black,
      "outline-style": "solid",
      "outline-width": "2px",
      "outline-color": black,
      "outline-offset": "0px",
      "box-shadow": `${black} 0px 4px 0px 0px`,
      "text-decoration-line": "underline",
      "text-decoration-thickness": "1px",
      "text-underline-offset": "1px",
      "text-decoration-color": black,
    });
    const state = snapshot({
      ...border("3px", white),
      "background-color": black,
      "background-image": "url(b)",
      color: white,
      "outline-style": "solid",
      "outline-width": "3px",
      "outline-color": white,
      "outline-offset": "1px",
      "box-shadow": `${white} 0px 2px 0px 0px`,
      "text-decoration-line": "overline",
      "text-decoration-thickness": "2px",
      "text-underline-offset": "2px",
      "text-decoration-color": white,
      transform: "matrix(1, 0, 0, 1, 0, 2)",
      opacity: "0.8",
      filter: "grayscale(1)",
      "font-weight": "600",
      visibility: "hidden",
    });
    expect(changes(rest, state, WHITE)).toEqual([
      "background",
      "background-image",
      "color",
      "border",
      "border-color",
      "outline",
      "outline-color",
      "shadow",
      "decoration",
      "decoration-color",
      "move",
      "opacity",
      "filter",
      "text",
      "visibility",
    ]);
    expect(changes(rest, rest, WHITE)).toEqual([]);
  });
  it("uses CSS initial values for missing properties", () => {
    const initial = snapshot({
      color: black,
      "background-color": "rgba(0, 0, 0, 0)",
      "background-image": "none",
      opacity: "1",
      transform: "none",
      translate: "none",
      scale: "none",
      rotate: "none",
      filter: "none",
      "font-weight": "400",
      "font-size": "16px",
      "letter-spacing": "normal",
      visibility: "visible",
      display: "inline",
    });
    expect(changes(snapshot(), initial, WHITE)).toEqual([]);
    expect(differences(snapshot(), initial)).toEqual([]);
  });
  it("applies the colour threshold after flattening alpha over the face or backdrop", () => {
    expect(changes(snapshot(), snapshot({ "background-color": "rgb(254, 254, 254)" }), WHITE)).toEqual([]);
    expect(changes(snapshot(), snapshot({ "background-color": "rgb(230, 230, 230)" }), WHITE)).toEqual(["background"]);
    expect(changes(snapshot(), snapshot({ "background-color": "rgba(0, 0, 0, .005)" }), WHITE)).toEqual([]);
    expect(changes(snapshot(), snapshot({ "background-color": "rgba(0, 0, 0, .06)" }), WHITE)).toEqual(["background"]);
    expect(changes(snapshot({ color: "rgba(0, 0, 0, 0)" }), snapshot({ color: "rgba(0, 0, 0, .5)" }), WHITE)).toEqual([
      "color",
    ]);
  });
  it("checks every border side's visibility, pixel width and visible colour", () => {
    for (const side of sideNames) {
      expect(
        changes(snapshot(), snapshot({ [`border-${side}-style`]: "solid", [`border-${side}-width`]: "2px" }), WHITE),
      ).toEqual(["border"]);
      expect(changes(snapshot(border()), snapshot({ ...border(), [`border-${side}-width`]: "3px" }), WHITE)).toEqual([
        "border",
      ]);
      expect(changes(snapshot(border()), snapshot({ ...border(), [`border-${side}-color`]: white }), WHITE)).toEqual([
        "border-color",
      ]);
    }
    expect(changes(snapshot(border("2px", black, "none")), snapshot(border("2px", white, "hidden")), WHITE)).toEqual(
      [],
    );
    expect(changes(snapshot(border("2em")), snapshot(border("4rem")), WHITE)).toEqual([]);
    expect(changes(snapshot(border()), snapshot(border("2px", black, "hidden")), WHITE)).toEqual(["border"]);
  });
  it("checks outline appearance, width, offset and visible colour", () => {
    const outlined = { "outline-style": "solid", "outline-width": "2px", "outline-color": black };
    expect(changes(snapshot(), snapshot(outlined), WHITE)).toEqual(["outline"]);
    expect(changes(snapshot(outlined), snapshot({ ...outlined, "outline-width": "3px" }), WHITE)).toEqual(["outline"]);
    expect(changes(snapshot(outlined), snapshot({ ...outlined, "outline-offset": "-1px" }), WHITE)).toEqual([
      "outline",
    ]);
    expect(changes(snapshot(outlined), snapshot({ ...outlined, "outline-color": white }), WHITE)).toEqual([
      "outline-color",
    ]);
    expect(changes(snapshot(), snapshot({ "outline-color": white, "outline-width": "2px" }), WHITE)).toEqual([]);
  });
  it("separates shadow geometry and count changes from colour changes", () => {
    const rest = snapshot({ "box-shadow": `${black} 0px 4px 0px 0px` });
    expect(changes(rest, snapshot(), WHITE)).toEqual(["shadow"]);
    expect(changes(snapshot(), rest, WHITE)).toEqual(["shadow"]);
    for (const geometry of [
      "1px 4px 0px 0px",
      "0px 5px 0px 0px",
      "0px 4px 1px 0px",
      "0px 4px 0px 1px",
      "0px 4px 0px 0px inset",
    ])
      expect(changes(rest, snapshot({ "box-shadow": `${white} ${geometry}` }), WHITE)).toEqual(["shadow"]);
    expect(changes(rest, snapshot({ "box-shadow": `${white} 0px 4px 0px 0px` }), WHITE)).toEqual(["shadow-color"]);
    expect(
      changes(rest, snapshot({ "box-shadow": `${black} 0px 4px 0px 0px, ${black} 0px 8px 0px 0px` }), WHITE),
    ).toEqual(["shadow"]);
    expect(
      changes(
        snapshot({ "box-shadow": "rgba(0, 0, 0, 0) 0px 4px" }),
        snapshot({ "box-shadow": "rgba(0, 0, 0, .5) 0px 4px" }),
        WHITE,
      ),
    ).toEqual(["shadow-color"]);
  });
  it("checks decoration geometry and visible colour, including currentcolor", () => {
    const underlined = {
      "text-decoration-line": "underline",
      "text-decoration-color": black,
      "text-decoration-thickness": "1px",
    };
    expect(changes(snapshot(), snapshot(underlined), WHITE)).toEqual(["decoration"]);
    for (const change of [
      { "text-decoration-line": "overline" },
      { "text-decoration-thickness": "2px" },
      { "text-underline-offset": "2px" },
    ])
      expect(changes(snapshot(underlined), snapshot({ ...underlined, ...change }), WHITE)).toEqual(["decoration"]);
    expect(changes(snapshot(underlined), snapshot({ ...underlined, "text-decoration-color": white }), WHITE)).toEqual([
      "decoration-color",
    ]);
    expect(
      changes(
        snapshot({ "text-decoration-line": "underline" }),
        snapshot({ "text-decoration-line": "underline", color: white }),
        WHITE,
      ),
    ).toEqual(["color", "decoration-color"]);
    expect(
      changes(
        snapshot(),
        snapshot({
          "text-decoration-color": white,
          "text-decoration-thickness": "2px",
          "text-underline-offset": "2px",
        }),
        WHITE,
      ),
    ).toEqual([]);
  });
  it.each(["transform", "translate", "scale", "rotate"])("compares %s as a string", (property) => {
    expect(changes(snapshot(), snapshot({ [property]: "changed" }), WHITE)).toEqual(["move"]);
  });
  it("checks opacity at 0.05, filter, text and visibility, tolerating odd values", () => {
    expect(changes(snapshot(), snapshot({ opacity: ".96" }), WHITE)).toEqual([]);
    expect(changes(snapshot({ opacity: ".4" }), snapshot({ opacity: ".45" }), WHITE)).toEqual(["opacity"]);
    expect(changes(snapshot(), snapshot({ opacity: "garbage" }), WHITE)).toEqual([]);
    expect(changes(snapshot(), snapshot({ filter: "blur(1px)" }), WHITE)).toEqual(["filter"]);
    expect(changes(snapshot(), snapshot({ "font-weight": "500", "letter-spacing": "1px" }), WHITE)).toEqual(["text"]);
    expect(changes(snapshot(), snapshot({ "letter-spacing": "1px" }), WHITE)).toEqual(["text"]);
    expect(changes(snapshot(), snapshot({ display: "none" }), WHITE)).toEqual(["visibility"]);
    expect(() =>
      changes(
        snapshot({ color: "garbage", "background-color": "hsl(0 0% 0%)", "box-shadow": "bad" }),
        snapshot(),
        WHITE,
      ),
    ).not.toThrow();
  });
  it.each(["before", "after"] as const)("reports appearance, disappearance and visible ::%s changes", (pseudo) => {
    const rest = snapshot();
    const state: Snapshot = { self: {}, [pseudo]: border() };
    expect(changes(rest, state, WHITE)).toEqual([`::${pseudo}`]);
    expect(changes(state, rest, WHITE)).toEqual([`::${pseudo}`]);
    expect(changes(state, { self: {}, [pseudo]: border("3px") }, WHITE)).toEqual([`::${pseudo} border`]);
    expect(changes(state, state, WHITE)).toEqual([]);
  });
  it("uses the element face as the pseudo backdrop and orders self, before and after", () => {
    const rest: Snapshot = { self: { "background-color": black }, after: { color: "rgba(0, 0, 0, 0)" } };
    const state: Snapshot = { self: rest.self, after: { color: "rgba(0, 0, 0, .5)" } };
    expect(changes(rest, state, WHITE)).toEqual([]);
    expect(changes({ ...rest, self: {} }, { ...state, self: {} }, WHITE)).toEqual(["::after color"]);
    expect(
      changes(
        { self: {}, before: {}, after: {} },
        { self: { opacity: ".9" }, before: { rotate: "45deg" }, after: { filter: "blur(1px)" } },
        WHITE,
      ),
    ).toEqual(["opacity", "::before move", "::after filter"]);
  });
});

describe("differences and colour-only states", () => {
  it("reports exact property differences while excluding cursor, transitions and animations", () => {
    const excluded = [
      "cursor",
      "transition-property",
      "transition-duration",
      "animation-name",
      "animation-duration",
      "animation-iteration-count",
    ];
    const state = snapshot(Object.fromEntries(STYLE_PROPS.map((property) => [property, "changed"])));
    expect(differences(snapshot(), state)).toEqual(STYLE_PROPS.filter((property) => !excluded.includes(property)));
    expect(differences(snapshot(), snapshot({ "background-color": "rgb(254, 254, 254)" }))).toEqual([
      "background-color",
    ]);
    expect(differences(snapshot(), snapshot())).toEqual([]);
  });
  it("prefixes pseudo properties and reports pseudo presence changes once", () => {
    expect(
      differences({ self: {}, after: {} }, { self: {}, before: {}, after: { "font-size": "20px", cursor: "pointer" } }),
    ).toEqual(["::before", "::after font-size"]);
    expect(differences({ self: {}, before: {}, after: {} }, snapshot())).toEqual(["::before", "::after"]);
  });
  it("classifies exactly the six colour-only kinds, including both pseudo prefixes", () => {
    const kinds = ["background", "color", "border-color", "outline-color", "shadow-color", "decoration-color"];
    expect([...COLOR_KINDS]).toEqual(
      ["", "::before ", "::after "].flatMap((prefix) => kinds.map((kind) => prefix + kind)),
    );
  });
  it("rejects identical states and low-contrast colour-only states with equal marks", () => {
    expect(stateProblem(snapshot(), snapshot(), WHITE)).toEqual(expect.stringContaining("identical"));
    expect(stateProblem(snapshot(), snapshot({ "background-color": "rgb(220, 220, 220)" }), WHITE)).toEqual(
      expect.any(String),
    );
    expect(stateProblem(snapshot(), snapshot({ color: "rgb(255, 0, 0)" }), WHITE)).toEqual(expect.any(String));
    expect(stateProblem({ self: {}, before: { color: black } }, { self: {}, before: { color: white } }, WHITE)).toEqual(
      expect.any(String),
    );
  });
  it("accepts changed marks, non-colour indicators and face contrast of at least 3:1", () => {
    expect(stateProblem({ self: {}, marks: "span" }, { self: {}, marks: "svg,span" }, WHITE)).toBeNull();
    expect(stateProblem(snapshot(), snapshot(border()), WHITE)).toBeNull();
    expect(stateProblem(snapshot(), { self: {}, after: {} }, WHITE)).toBeNull();
    expect(stateProblem(snapshot(), snapshot({ "background-color": black }), WHITE)).toBeNull();
  });
});

describe("focus rings", () => {
  const outlined: Style = {
    "outline-style": "solid",
    "outline-width": "2px",
    "outline-color": black,
    "outline-offset": "1px",
  };
  it("ignores a transparent outline and measures a pseudo-element ring outside the element's border", () => {
    const after: Style = {
      content: '""',
      position: "absolute",
      top: "-7px",
      right: "-7px",
      bottom: "-11px",
      left: "-7px",
      ...Object.fromEntries(
        ["top", "right", "bottom", "left"].flatMap((side) => [
          [`border-${side}-style`, "solid"],
          [`border-${side}-width`, "3px"],
          [`border-${side}-color`, black],
        ]),
      ),
    };
    const border = Object.fromEntries(
      ["top", "right", "bottom", "left"].map((side) => [`border-${side}-width`, "2px"]),
    );
    const focused = snapshot({ ...outlined, ...border, "outline-width": "3px", "outline-color": "rgba(0, 0, 0, 0)" });
    expect(ring(snapshot(border), { ...focused, after })).toMatchObject({
      source: "::after",
      outset: { top: 5, right: 5, bottom: 9, left: 5 },
    });
  });
  it("detects a newly visible outline, including its offset", () => {
    expect(ring(snapshot(), snapshot(outlined))).toEqual({
      source: "outline",
      width: 2,
      color: BLACK,
      outset: { top: 3, right: 3, bottom: 3, left: 3 },
    });
    expect(ring(snapshot(outlined), snapshot(outlined))).toBeNull();
    expect(ring(snapshot(), snapshot())).toBeNull();
  });
  it("detects changed outline style, width, offset or colour but ignores invisible outlines", () => {
    for (const change of [
      { "outline-style": "dotted" },
      { "outline-width": "3px" },
      { "outline-offset": "2px" },
      { "outline-color": white },
    ])
      expect(ring(snapshot(outlined), snapshot({ ...outlined, ...change }))?.source).toBe("outline");
    for (const change of [
      { "outline-style": "none" },
      { "outline-style": "hidden" },
      { "outline-width": "0px" },
      { "outline-width": "2rem" },
    ])
      expect(ring(snapshot(), snapshot({ ...outlined, ...change }))).toBeNull();
  });
  it("uses the outermost new concentric shadow and subtracts the next smaller new spread", () => {
    const rest = snapshot({ "box-shadow": `${black} 0px 4px 0px 0px` });
    const focused = snapshot({
      "box-shadow": `${black} 0px 4px 0px 0px, ${white} 0px 0px 0px 4px, ${black} 0px 0px 0px 6px`,
    });
    expect(ring(rest, focused)).toEqual({
      source: "box-shadow",
      width: 2,
      color: BLACK,
      outset: { top: 6, right: 6, bottom: 6, left: 6 },
    });
    expect(ring(focused, focused)).toBeNull();
    expect(ring(snapshot(), snapshot({ "box-shadow": `${black} 0px 0px 0px 6px` }))?.width).toBe(6);
    expect(
      ring(
        snapshot({ "box-shadow": `${white} 0px 0px 0px 4px` }),
        snapshot({ "box-shadow": `${white} 0px 0px 0px 4px, ${black} 0px 0px 0px 6px` }),
      )?.width,
    ).toBe(6);
  });
  it("recognises shadow colour changes and rejects inset, offset, blurred and non-positive spreads", () => {
    expect(
      ring(
        snapshot({ "box-shadow": `${white} 0px 0px 0px 3px` }),
        snapshot({ "box-shadow": `${black} 0px 0px 0px 3px` }),
      )?.color,
    ).toEqual(BLACK);
    for (const geometry of [
      "0px 0px 0px 3px inset",
      "1px 0px 0px 3px",
      "0px 1px 0px 3px",
      "0px 0px 1px 3px",
      "0px 0px 0px 0px",
      "0px 0px 0px -1px",
    ])
      expect(ring(snapshot(), snapshot({ "box-shadow": `${black} ${geometry}` }))).toBeNull();
  });
  it.each(["before", "after"] as const)("detects a new four-sided ::%s border ring", (pseudo) => {
    const focused: Snapshot = {
      self: {},
      [pseudo]: { ...border(), position: "absolute", top: "-6px", right: "-5px", bottom: "-4px", left: "-3px" },
    };
    expect(ring(snapshot(), focused)).toEqual({
      source: `::${pseudo}`,
      width: 2,
      color: BLACK,
      outset: { top: 6, right: 5, bottom: 4, left: 3 },
    });
    expect(ring(focused, focused)).toBeNull();
  });
  it("requires visible equal-width borders on all four pseudo sides", () => {
    for (const side of sideNames) {
      for (const change of [
        { [`border-${side}-width`]: "0px" },
        { [`border-${side}-width`]: "3px" },
        { [`border-${side}-style`]: "none" },
        { [`border-${side}-style`]: "hidden" },
      ])
        expect(ring(snapshot(), { self: {}, after: { ...border(), ...change } })).toBeNull();
    }
    expect(ring(snapshot(), { self: {}, after: border("2em") })).toBeNull();
    expect(ring(snapshot(), { self: {}, after: {} })).toBeNull();
  });
  it("detects pseudo border appearance and perceptible colour changes but not width-only or tiny colour changes", () => {
    const focused: Snapshot = { self: {}, after: border() };
    expect(ring({ self: {}, after: border("0px") }, focused)?.source).toBe("::after");
    expect(ring({ self: {}, after: border("2px", white) }, focused)?.source).toBe("::after");
    expect(ring({ self: {}, after: border() }, { self: {}, after: border("3px") })).toBeNull();
    expect(
      ring({ self: {}, after: border("2px", white) }, { self: {}, after: border("2px", "rgb(254, 254, 254)") }),
    ).toBeNull();
  });
  it("uses fixed pseudo offsets and zero outsets for in-flow pseudos", () => {
    expect(
      ring(snapshot(), {
        self: {},
        before: { ...border(), position: "fixed", top: "-2px", right: "auto", bottom: "3rem", left: "1px" },
      })?.outset,
    ).toEqual({ top: 2, right: 0, bottom: 0, left: -1 });
    expect(ring(snapshot(), { self: {}, before: { ...border(), top: "-6px" } })?.outset).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });
  it("chooses the widest candidate, comparing ring band width rather than outer spread", () => {
    const focused: Snapshot = {
      self: { ...outlined, "outline-width": "3px", "box-shadow": `${white} 0px 0px 0px 4px, ${black} 0px 0px 0px 6px` },
      before: border("4px"),
    };
    expect(ring(snapshot(), focused)?.source).toBe("::before");
    expect(ring(snapshot(), snapshot(focused.self))?.source).toBe("outline");
    expect(
      ring(snapshot(), { ...focused, self: { ...outlined, "box-shadow": `${black} 0px 0px 0px 6px` } })?.source,
    ).toBe("box-shadow");
  });
  it("reports missing, thin and low-contrast rings with the measured ratio", () => {
    const valid: Ring = { source: "outline", width: 2, color: BLACK, outset: { top: 2, right: 2, bottom: 2, left: 2 } };
    expect(ringProblems(null, WHITE)).toEqual(["no visible focus ring"]);
    expect(ringProblems(valid, WHITE)).toEqual([]);
    expect(ringProblems({ ...valid, width: 1, color: WHITE }, WHITE)).toEqual([
      expect.stringContaining("1px"),
      expect.stringContaining("1.00:1"),
    ]);
    expect(ringProblems({ ...valid, width: 1.99 }, WHITE)).toHaveLength(1);
    expect(ringProblems({ ...valid, color: { ...BLACK, a: 0.1 } }, WHITE)).toEqual([expect.stringContaining("1.25:1")]);
    expect(ringProblems({ ...valid, color: { ...BLACK, a: 0.5 } }, WHITE)).toEqual([]);
    expect(ringProblems({ ...valid, color: WHITE }, BLACK)).toEqual([]);
  });
});

describe("exceptions and reporting", () => {
  const cursor: Violation = { rule: "cursor", target: "button", message: "expected pointer" };
  const focus: Violation = { rule: "focus-ring", target: "button", message: "no ring" };
  const exception: Exception = {
    rule: "cursor",
    selector: "button",
    reason: "Fixture demonstrates a narrowly scoped exception",
  };
  const matches = (violation: Violation, selector: string) => violation.target === selector;
  it("suppresses matching rules and selectors without modifying violations or exceptions", () => {
    const violations = [cursor, focus, { ...cursor, target: "input" }];
    const exceptions = [exception];
    const original = structuredClone({ violations, exceptions });
    expect(applyExceptions(violations, exceptions, "light", matches)).toEqual([focus, violations[2]]);
    expect({ violations, exceptions }).toEqual(original);
    expect(applyExceptions(violations, [], "light", matches)).toEqual(violations);
  });
  it("marks every overlapping exception as used when they match the same original violation", () => {
    const exceptions = [exception, { ...exception, selector: ".controls" }, exception];
    expect(
      applyExceptions(
        [cursor],
        exceptions,
        "light",
        (violation, selector) => selector === ".controls" || matches(violation, selector),
      ),
    ).toEqual([]);
  });
  it("reports each applicable unused exception as stale, with its selector as the target", () => {
    expect(applyExceptions([focus], [exception], "light", matches)).toEqual([
      focus,
      { rule: "stale-exception", target: "button", message: expect.any(String) },
    ]);
    expect(applyExceptions([], [exception, { ...exception, selector: "input" }], "dark", matches)).toEqual([
      { rule: "stale-exception", target: "button", message: expect.any(String) },
      { rule: "stale-exception", target: "input", message: expect.any(String) },
    ]);
  });
  it("never reports a debt exception as stale, but still lets it suppress", () => {
    const debt: Exception = { ...exception, debt: "future" };
    expect(applyExceptions([focus], [debt], "light", matches)).toEqual([focus]);
    expect(applyExceptions([cursor], [debt], "light", matches)).toEqual([]);
  });
  const ignored: [Exception, Mode][] = [
    [{ ...exception, projects: ["dark"] }, "light"],
    [exception, "touch"],
    [{ ...exception, projects: ["motion"] }, "motion"],
  ];
  it.each(ignored)("ignores inapplicable exception %j in %s without calling it stale", (entry, mode) => {
    expect(applyExceptions([cursor], [entry], mode, matches)).toEqual([cursor]);
    expect(applyExceptions([], [entry], mode, matches)).toEqual([]);
  });
  it("applies project scopes in the modes where the rule runs", () => {
    expect(applyExceptions([cursor], [{ ...exception, projects: ["dark"] }], "dark", matches)).toEqual([]);
    const violation: Violation = { rule: "transitions", target: "button", message: "transition all" };
    const entry: Exception = { ...exception, rule: "transitions", projects: ["forced", "motion"] };
    expect(applyExceptions([violation], [entry], "forced", matches)).toEqual([]);
    expect(applyExceptions([violation], [entry], "motion", matches)).toEqual([]);
    expect(applyExceptions([violation], [entry], "touch", matches)).toEqual([violation]);
  });
  it("finds missing expected fixture rules only when they run in the project", () => {
    const expected: RuleId[] = ["cursor", "boundary", "transitions"];
    expect(missingExpected([cursor], expected, "light")).toEqual(["transitions"]);
    expect(missingExpected([cursor], expected, "forced")).toEqual(["boundary", "transitions"]);
    expect(missingExpected([], expected, "motion")).toEqual(["transitions"]);
    expect(missingExpected([], [], "light")).toEqual([]);
    expect(missingExpected([cursor], ["cursor"], "light")).toEqual([]);
  });
  it("formats one line per violation sorted by rule then target without modifying its input", () => {
    const violations: Violation[] = [
      { rule: "press-visible", target: "z", message: "no feedback" },
      { rule: "cursor", target: "z", message: "expected pointer" },
      { rule: "cursor", target: "a", message: "expected text" },
    ];
    const original = structuredClone(violations);
    expect(format(violations)).toBe(
      "cursor  a  expected text\ncursor  z  expected pointer\npress-visible  z  no feedback",
    );
    expect(violations).toEqual(original);
    expect(format([])).toBe("");
  });
});

it("reads class names out of selectors, resolving both kinds of CSS escape", () => {
  expect(selectorClasses(".hover\\:bg-brand:hover, :where(.group\\/chip)[data-pressed] .x")).toEqual([
    "hover:bg-brand",
    "group/chip",
    "x",
  ]);
  expect(selectorClasses(".\\31 0 .w-\\[min\\(44\\%\\,120px\\)\\]")).toEqual(["10", "w-[min(44%,120px)]"]);
});
