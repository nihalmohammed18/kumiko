import { describe, expect, it } from "vitest";
import {
  applyDebt,
  formatProblem,
  lintComponent,
  lintCss,
  lintDist,
  lintStory,
  lintTokens,
  readPaletteNames,
  sourceKind,
} from "./check.ts";
import { CLOSED_DEBTS, MODES, RULE_IDS, validateUxExcept } from "./ux-rules.ts";

const palette = new Set(["red", "blue", "mauve", "olive", "mist", "taupe"]);
const component = "src/components/example.tsx";
const classes = (value: string) => `const classes = ${JSON.stringify(value)};`;
const story = (properties: string) => `export const Story = {\n${properties}\n};`;
const reason = "Decorative sample intentionally omits the accessible label";
const inputs = (text: string) => text.trim().split(/\s+/);

const classCases = [
  {
    rule: "physical-direction",
    bad: inputs(`ml-2 -mr-1 pl-4 hover:pr-2 -scroll-ml-4 scroll-pr-4 -left-2 right-1/2 border-l border-r-2
      rounded-l rounded-tr-md text-left float-right clear-left origin-left origin-bottom-right bg-left bg-right-top
      object-right object-left-bottom translate-x-full -translate-x-2 [margin-left:4px] [padding-right:1rem]
      [left:0] [border-right-width:2px] [text-align:right]`),
    good: [
      ...inputs(`ms-2 me-2 ps-4 pe-4 start-0 end-0 inset-x-0 border-s border-e-2 rounded-s-md rounded-ss
        rounded-ee-lg text-start text-end place-items-center origin-top bg-center object-contain border-line
        [margin-inline-start:4px] [text-align:start]`),
      "translate-x-full rtl:-translate-x-full",
    ],
  },
  {
    rule: "raw-color",
    bad: inputs(`bg-red-500/50 border-t-red-500 inset-shadow-red-500 ring-offset-white text-shadow-black
      bg-mauve-500 text-olive-950 stroke-mist-50 fill-taupe-100 inset-ring-blue-500 placeholder-white
      drop-shadow-red-500 divide-black`),
    good: inputs(
      "bg-surface text-ink-muted bg-ink/6 border-line ring-current fill-transparent stroke-inherit bg-madeup-500",
    ),
  },
  {
    rule: "arbitrary-color",
    bad: inputs(`border-[#fff] bg-(--brand) bg-[var(--x)] text-[oklab(0.5_0.1_0.1)] bg-[red] text-[aliceblue]
      stroke-[rebeccapurple] ring-[lightgoldenrodyellow] outline-[rgb(1_2_3)] border-e-[hsl(20_10%_50%)]
      fill-[oklch(0.5_0.1_20)] text-[lab(50_0_0)] text-[lch(50_0_0)] text-[hwb(0_0%_0%)]
      text-[color(display-p3_1_0_0)] text-[color-mix(in_oklab,red,blue)] caret-[paint] accent-[13px]
      from-[unknown] via-[unknown] to-[unknown] placeholder-[unknown]`),
    good: inputs(`border-[3px] text-[13px] bg-[url(/image.png)] bg-(--kumiko-surface) bg-[var(--press-face)]
      text-[length:13px] text-[color:var(--kumiko-ink)] ring-(--press-ring) shadow-(--press-edge) border-transparent`),
  },
  {
    rule: "motion-raw",
    bad: inputs(`transition transition-all duration-150 delay-25 ease-linear ease-in ease-out ease-in-out
      animate-spin animate-pulse animate-bounce animate-ping`),
    good: inputs(
      "duration-hover ease-enter transition-[background-color,box-shadow] transition-colors animate-none delay-token",
    ),
  },
  {
    rule: "outline-none",
    bad: ["outline-none", "focus-visible:outline-none"],
    good: ["outline-hidden", "focus-visible:outline-2"],
  },
  { rule: "dark-variant", bad: ["dark:bg-x", "hover:dark:text-ink"], good: ["bg-x", "[&:is(.dark)]:bg-x"] },
  {
    rule: "raw-z",
    bad: ["z-50", "-z-10", "z-[3]", "z-[var(--kumiko-layer-overlay)]"],
    good: ["z-overlay", "z-auto", "z-(--kumiko-layer-overlay)"],
  },
  {
    rule: "viewport-size",
    bad: [
      "h-screen",
      "min-h-screen",
      "max-h-screen",
      "w-screen",
      "min-w-screen",
      "max-w-screen",
      "h-[100vh]",
      "w-[calc(100vw_-_1rem)]",
      "h-[100dvh]",
      "h-[100svh]",
      "h-[100lvh]",
    ],
    good: ["h-full", "min-h-0", "w-[100%]", "h-[100px]"],
  },
  {
    rule: "disabled-opacity",
    bad: [
      "data-disabled:opacity-45",
      "disabled:pointer-events-none",
      "aria-disabled:opacity-0",
      "disabled:hover:opacity-50",
    ],
    good: ["opacity-45", "not-data-disabled:opacity-45", "data-loading:opacity-50", "disabled:cursor-not-allowed"],
  },
  {
    rule: "elevation",
    bad: [
      "shadow-lg",
      "shadow",
      "shadow-inner",
      "drop-shadow-sm",
      "drop-shadow",
      "blur",
      "blur-sm",
      "backdrop-blur-md",
      "bg-gradient-to-r",
      "bg-linear-to-r",
      "bg-radial",
      "bg-conic-180",
    ],
    good: ["shadow-none", "shadow-(--press-edge)", "shadow-(--press-ring)", "inset-shadow-none", "bg-surface"],
  },
  { rule: "uppercase", bad: ["uppercase", "hover:uppercase"], good: ["normal-case", "lowercase"] },
  {
    rule: "focus-variant",
    bad: ["focus:ring-2", "focus:outline-2"],
    good: ["focus-visible:outline-2", "focus:bg-surface"],
  },
  {
    rule: "viewport-breakpoint",
    bad: ["md:flex", "sm:grid", "max-2xl:hidden", "min-[700px]:flex", "max-[40rem]:grid"],
    good: ["@md:flex", "@max-md:flex", "@[40rem]:grid", "@sm/card:flex", "max-w-sm"],
  },
] as const;

describe.each(classCases)("$rule", ({ rule, bad, good }) => {
  it.each(bad)("flags %s", (value) => {
    expect(lintComponent(classes(value), component, palette).some((problem) => problem.rule === rule)).toBe(true);
  });
  it.each(good)("allows %s", (value) => {
    expect(lintComponent(classes(value), component, palette)).toEqual([]);
  });
});

describe("AST literal scanning", () => {
  it.each([String.raw`const c = "\t\u0061 outline-none";`, String.raw`const c = "\u{1f600} outline-none";`])(
    "maps escaped prefixes back to source columns: %s",
    (text) => {
      expect(lintComponent(text, component, palette)[0]).toEqual(
        expect.objectContaining({ line: 1, col: text.indexOf("outline-none") + 1 }),
      );
    },
  );
  it("keeps source locations after a line continuation", () => {
    const text = String.raw`const c = "\
  outline-none";`;
    expect(lintComponent(text, component, palette)[0]).toEqual(expect.objectContaining({ line: 2, col: 3 }));
  });
  it("reports the token's line and column in a multiline template", () => {
    const problems = lintComponent("const c = `flex\n  ml-2\n  bg-mauve-500`;", component, palette);
    expect(problems).toEqual([
      expect.objectContaining({ file: component, line: 2, col: 3, rule: "physical-direction", match: "ml-2" }),
      expect.objectContaining({ line: 3, col: 3, rule: "raw-color", match: "bg-mauve-500" }),
    ]);
  });
  it("scans template heads, middles and tails", () => {
    const problems = lintComponent(`const c = \`ml-2 \${first} bg-red-500 \${second} z-50\`;`, component, palette);
    expect(problems.map((problem) => problem.rule)).toEqual(["physical-direction", "raw-color", "raw-z"]);
  });
  it("finds rtl partners across template spans", () => {
    expect(
      lintComponent(`const c = \`translate-x-full \${extra} rtl:-translate-x-full\`;`, component, palette),
    ).toEqual([]);
  });
  it("does not treat separate literals as rtl partners", () => {
    expect(lintComponent('cn("translate-x-full", "rtl:-translate-x-full")', component, palette)).toHaveLength(1);
  });
  it("ignores comments and regexp literals", () => {
    expect(lintComponent('// "ml-2"\n/* `bg-red-500` */\nconst pattern = /dark:bg-x/;', component, palette)).toEqual(
      [],
    );
  });
  it.each(["hover:!bg-red-500", "bg-red-500!", "[&:is(:hover,:focus)]:bg-red-500"])(
    "handles variants and important markers: %s",
    (value) => {
      expect(lintComponent(classes(value), component, palette).map((problem) => problem.rule)).toEqual(["raw-color"]);
    },
  );
  it.each(["src/components/button-styles.ts", "src/components/badge-styles.ts"])("allows uppercase in %s", (file) => {
    expect(lintComponent(classes("uppercase"), file, palette)).toEqual([]);
  });
});

describe("physical-direction inline styles", () => {
  it.each([
    "<div style={{ marginLeft: 4 }} />",
    "<div style={{ borderRightWidth: 2 }} />",
    '<div style={{ textAlign: "left" }} />',
    "<div style={{ textAlign: `right` }} />",
  ])("flags %s", (text) => {
    expect(lintComponent(text, component, palette).map((problem) => problem.rule)).toEqual(["physical-direction"]);
  });
  it.each([
    "<div style={{ marginInlineStart: 4 }} />",
    "<div style={{ borderInlineEndWidth: 2 }} />",
    '<div style={{ textAlign: "start" }} />',
  ])("allows %s", (text) => {
    expect(lintComponent(text, component, palette)).toEqual([]);
  });
});

describe("hex", () => {
  it.each(["#fff", "#aBcD", "#123456", "#12345678", "colour: #FF0000"])("flags %s", (value) => {
    expect(lintComponent(classes(value), component, palette).some((problem) => problem.rule === "hex")).toBe(true);
  });
  it.each([
    '<a href="#add" />',
    '<a href={"#abc"} />',
    '<div id="#abc" />',
    '<Link to="#abc" />',
    '<use xlinkHref="#abc" />',
    '<label htmlFor="#abc" />',
    classes("url(#clip)"),
    classes("url(#abc)"),
    classes("#abcde"),
    classes("#123456789"),
  ])("allows %s", (text) => {
    expect(lintComponent(text, component, palette)).toEqual([]);
  });
});

describe("built-class", () => {
  it.each([
    `const c = \`bg-\${tone}\`;`,
    `const c = \`\${extra} hover:border-\${tone}\`;`,
    `const c = \`grid-cols-\${count}\`;`,
  ])("flags %s", (text) => {
    expect(lintComponent(text, component, palette).map((problem) => problem.rule)).toEqual(["built-class"]);
  });
  it.each([`const c = \`bg-surface \${extra}\`;`, `const c = \`\${tone} text-ink\`;`, `const id = \`person-\${id}\`;`])(
    "allows %s",
    (text) => {
      expect(lintComponent(text, component, palette)).toEqual([]);
    },
  );
});

describe("client-directive", () => {
  it.each([
    "useState",
    "useEffect",
    "useLayoutEffect",
    "useInsertionEffect",
    "useReducer",
    "useRef",
    "useContext",
    "useSyncExternalStore",
    "useTransition",
    "useOptimistic",
    "useActionState",
    "useImperativeHandle",
    "useDeferredValue",
    "createContext",
  ])("requires the directive for %s calls", (hook) => {
    expect(lintComponent(`${hook}();`, component, palette).map((problem) => problem.rule)).toEqual([
      "client-directive",
    ]);
  });
  it.each([
    'import { useState as state } from "react"; state(0);',
    'import * as R from "react"; R.useEffect(() => {});',
    'import React from "react"; React["useRef"]();',
    'import { useRender } from "@base-ui/react";',
    'import { useDirection as direction } from "@base-ui/react/direction-provider";',
    '"use strict"; "use client"; useState();',
    'const directive = "use client"; useState();',
  ])("flags %s", (text) => {
    expect(lintComponent(text, component, palette).some((problem) => problem.rule === "client-directive")).toBe(true);
  });
  it.each([
    '"use client"; useState(0);',
    "// a comment is allowed before directives\n'use client'; useRef();",
    'import { useState } from "react"; const hookName = "useState";',
    'import type { useDirection } from "@base-ui/react";',
    "const value = useMemo(() => 1, []);",
    "const value = use(Settings);",
  ])("allows %s", (text) => {
    expect(lintComponent(text, component, palette)).toEqual([]);
  });
  it.each(["src/components/button-styles.ts", "src/components/badge-styles.ts"])("keeps %s server-safe", (file) => {
    expect(
      lintComponent('"use client"; export const recipe = {};', file, palette).map((problem) => problem.rule),
    ).toEqual(["client-directive"]);
  });
  it.each(["src/components/button-styles.ts", "src/components/badge-styles.ts"])(
    "allows a plain recipe in %s",
    (file) => {
      expect(lintComponent('export const recipe = "use client";', file, palette)).toEqual([]);
    },
  );
});

describe("css-physical", () => {
  it.each([
    "margin-left: 4px",
    "margin-right: 4px",
    "padding-left: 4px",
    "padding-right: 4px",
    "border-left-color: CanvasText",
    "border-right-width: 2px",
    "left: 0",
    "right: 0",
    "float: left",
    "clear: right",
    "text-align: left",
    "transition: all 150ms",
    "transition-property: all",
    "transition: color 100ms, all 200ms",
    "transition-property: all!important",
    "transition: all!important",
  ])("flags %s", (declaration) => {
    expect(lintCss(`.control { ${declaration}; }`, "src/fixture.css").map((problem) => problem.rule)).toEqual([
      "css-physical",
    ]);
  });
  it.each([
    "margin-inline-start: 4px",
    "padding-inline-end: 4px",
    "border-inline-start-width: 2px",
    "inset-inline-start: 0",
    "text-align: start",
    "float: inline-end",
    "clear: inline-start",
    "transition: color 150ms",
    "transition-property: color, opacity",
    "transition-property: opacity!important",
    "transition: color 150ms!important",
    'content: "margin-left: 4px;"',
  ])("allows %s", (declaration) => {
    expect(lintCss(`.control { ${declaration}; }`, "src/fixture.css")).toEqual([]);
  });
  it("ignores comments without losing declaration locations", () => {
    const css = '/* margin-left: 4px; */\n.control {\n  margin-left: 2px;\n  content: "/* not a comment */";\n}';
    expect(lintCss(css, "src/fixture.css")).toEqual([
      expect.objectContaining({ line: 3, col: 3, match: "margin-left: 2px" }),
    ]);
  });
  it("allows forced-colors system colours", () => {
    expect(
      lintCss(
        "@media (forced-colors: active) { .control { border-color: CanvasText; color: ButtonText; } }",
        "src/fixture.css",
      ),
    ).toEqual([]);
  });
  it("still requires logical properties inside forced-colors", () => {
    expect(
      lintCss("@media (forced-colors: active) { .control { margin-left: 4px; } }", "src/fixture.css"),
    ).toHaveLength(1);
  });
});

describe("tokens-stale", () => {
  it.each([
    ["--token: old;", "--token: new;", "src/tokens.css"],
    ["expected\n", "expected", "src/theme.css"],
  ])("flags differing bytes: %j", (actual, expected, file) => {
    expect(lintTokens(actual, expected, file)).toEqual([expect.objectContaining({ file, rule: "tokens-stale" })]);
  });
  it.each(["--token: new;", "expected\n"])("allows identical generated bytes: %j", (css) => {
    expect(lintTokens(css, css)).toEqual([]);
  });
});

describe("dist client-directive", () => {
  it.each(["export const Button = 1;", '"use strict"; "use client"; export const Button = 1;'])(
    "flags a lost leading directive: %s",
    (output) => {
      expect(
        lintDist('"use client"; export const Button = 1;', output, "dist/button.js").map((problem) => problem.rule),
      ).toEqual(["client-directive"]);
    },
  );
  it.each(['"use client"; export const Button = 1;', "// banner\n'use client'; export const Button = 1;"])(
    "allows a retained directive: %s",
    (output) => {
      expect(lintDist('"use client"; export const Button = 1;', output, "dist/button.js")).toEqual([]);
    },
  );
  it("leaves server-safe modules alone", () => {
    expect(lintDist("export const recipe = 1;", "export const recipe = 1;", "dist/recipe.js")).toEqual([]);
  });
});

describe("guard inputs and diagnostics", () => {
  it("reads palette names from declarations rather than a fixed list", () => {
    expect(
      readPaletteNames(
        "@theme { --color-mauve-500: x; --color-new-palette-50: x; --color-white: x; /* --color-ignored-500: x; */ }",
      ),
    ).toEqual(new Set(["mauve", "new-palette"]));
  });
  it("reports file:line:col, rule, message and offending text", () => {
    const problem = lintComponent(classes("outline-none"), component, palette)[0]!;
    expect(formatProblem(problem)).toBe(
      `${component}:1:18: outline-none: use outline-hidden or the focus recipe: outline-none`,
    );
  });
});

describe("a11y-exception", () => {
  it.each([
    'parameters: { a11y: { test: "off" } }',
    'parameters: {\n  a11y: {\n    test:\n      "todo"\n  }\n}',
    "parameters: { a11y: { disable: true } }",
    'parameters: { a11y: { config: { rules: [{ id: "button-name", enabled: false }] } } }',
    'parameters: { a11y: { options: { rules: { "button-name": { enabled: false } } } } }',
    "globals: { a11y: { manual: true } }",
    '// a11y-exception: too short\nparameters: { a11y: { test: "off" } }',
    `/* a11y-exception: ${reason} */\nparameters: { a11y: { test: "off" } }`,
    `// a11y-exception: ${reason}\n\nparameters: { a11y: { test: "off" } }`,
    `parameters: { // a11y-exception: ${reason}\n a11y: { disable: true } }`,
  ])("flags %s", (properties) => {
    expect(
      lintStory(story(properties), "src/example.stories.tsx").some((problem) => problem.rule === "a11y-exception"),
    ).toBe(true);
  });
  it.each([
    'parameters: { a11y: { test: "error", disable: false } }',
    'parameters: { a11y: { config: { rules: [{ id: "button-name", enabled: true }] } } }',
    'parameters: { a11y: { options: { rules: { "button-name": { enabled: true } } } } }',
    "globals: { a11y: { manual: false } }",
    `// a11y-exception: ${reason}\nparameters: { a11y: { test: "off" } }`,
    `parameters: {\n // a11y-exception: ${reason}\n a11y: { disable: true } }`,
    `parameters: { a11y: {\n // a11y-exception: ${reason}\n test: "todo" } }`,
    `// a11y-exception: ${reason}\nglobals: { a11y: { manual: true } }`,
    `parameters: { a11y: { config: { rules: [{ id: "button-name",\n // a11y-exception: ${reason}\n enabled: false }] } } }`,
    'args: { a11y: { test: "off" } }',
  ])("allows %s", (properties) => {
    expect(lintStory(story(properties), "src/example.stories.tsx")).toEqual([]);
  });
  it("ignores opt-outs mentioned in comments and strings", () => {
    expect(
      lintStory(
        '// parameters: { a11y: { test: "off" } }\nconst example = "a11y: { disable: true }";',
        "src/example.stories.tsx",
      ),
    ).toEqual([]);
  });
});

const uxException = { rule: "cursor", selector: "button", reason };
const invalidUxValues = [
  { label: "unknown rule", value: [{ ...uxException, rule: "unknown" }] },
  { label: "short reason", value: [{ ...uxException, reason: "short" }] },
  { label: "missing selector", value: [{ rule: "cursor", reason }] },
  { label: "empty selector", value: [{ ...uxException, selector: "  " }] },
  { label: "non-string debt", value: [{ ...uxException, debt: 2 }] },
  { label: "not an array", value: uxException },
  { label: "null", value: null },
  { label: "non-object entry", value: ["cursor"] },
  { label: "null entry", value: [null] },
  { label: "blank reason", value: [{ ...uxException, reason: "                " }] },
];

describe("ux-exception", () => {
  it.each(invalidUxValues)("rejects $label in the pure validator", ({ value }) => {
    expect(validateUxExcept(value).length).toBeGreaterThan(0);
  });
  it.each(invalidUxValues)("flags $label in stories", ({ value }) => {
    expect(
      lintStory(story(`parameters: { ux: { except: ${JSON.stringify(value)} } }`), "src/example.stories.tsx").some(
        (problem) => problem.rule === "ux-exception",
      ),
    ).toBe(true);
  });
  it.each([
    "parameters: { ux: { except: exceptions } }",
    "parameters: { ux: { except: [{ ...exception }] } }",
    'parameters: { ux: { except: [{ rule: ruleName, selector: "button", reason: "A reason with enough characters" }] } }',
  ])("requires literal exception entries: %s", (properties) => {
    expect(
      lintStory(story(properties), "src/example.stories.tsx").some((problem) => problem.rule === "ux-exception"),
    ).toBe(true);
  });
  it.each(
    [[], [uxException], [{ ...uxException, debt: "future" }], [{ ...uxException, reason: "123456789012345" }]].map(
      (value) => ({ value }),
    ),
  )("allows valid exceptions: $value", ({ value }) => {
    expect(validateUxExcept(value)).toEqual([]);
    expect(
      lintStory(story(`parameters: { ux: { except: ${JSON.stringify(value)} } }`), "src/example.stories.tsx"),
    ).toEqual([]);
  });
  it("accepts every shared rule id", () => {
    expect(validateUxExcept(RULE_IDS.map((rule) => ({ ...uxException, rule })))).toEqual([]);
  });
  it("accepts distinct known projects without modifying them", () => {
    expect(MODES).toEqual(["light", "dark", "rtl", "touch", "forced", "motion"]);
    const value = [{ ...uxException, projects: [...MODES] }];
    const original = structuredClone(value);
    expect(validateUxExcept(value)).toEqual([]);
    expect(value).toEqual(original);
    expect(
      lintStory(story(`parameters: { ux: { except: ${JSON.stringify(value)} } }`), "src/example.stories.tsx"),
    ).toEqual([]);
  });
  it.each([
    { label: "undefined", projects: undefined },
    { label: "null", projects: null },
    { label: "a string", projects: "light" },
    { label: "a number", projects: 1 },
    { label: "an object", projects: {} },
    { label: "an empty array", projects: [] },
    { label: "an unknown project", projects: ["light", "unknown"] },
    { label: "a non-string project", projects: ["light", 1] },
    { label: "a null project", projects: [null] },
    { label: "a sparse project array", projects: Array(1) },
    { label: "a duplicate project", projects: ["light", "light"] },
  ])("rejects projects containing $label in the validator and story guard", ({ projects }) => {
    expect(validateUxExcept([{ ...uxException, projects }])).toContainEqual(
      expect.stringContaining("except[0].projects"),
    );
    const properties = `parameters: { ux: { except: [{ rule: "cursor", selector: "button",
      reason: ${JSON.stringify(reason)}, projects: ${JSON.stringify(projects) ?? "undefined"} }] } }`;
    expect(lintStory(story(properties), "src/example.stories.tsx")).toContainEqual(
      expect.objectContaining({ rule: "ux-exception", message: expect.stringContaining("except[0].projects") }),
    );
  });
  it("rejects a closed debt in both the shared validator and story guard", () => {
    const value = [{ ...uxException, debt: "M2b" }];
    expect(validateUxExcept(value)).toEqual([expect.stringContaining("closed debt M2b")]);
    expect(
      lintStory(story(`parameters: { ux: { except: ${JSON.stringify(value)} } }`), "src/example.stories.tsx").map(
        (problem) => problem.rule,
      ),
    ).toEqual(["ux-exception"]);
  });
  it("keeps the shared ids exact and M2b closed", () => {
    expect(RULE_IDS).toEqual([
      "cursor",
      "disabled-inert",
      "hover-visible",
      "press-visible",
      "no-layout-shift",
      "focus-ring",
      "target-size",
      "edge-clip",
      "edge-visible",
      "reduce-no-move",
      "transitions",
      "settle",
      "reflow",
      "text-overflow",
      "input-font",
      "no-sticky-hover",
      "boundary",
      "state-not-color",
      "directional",
      "color-scheme",
      "dead-class",
      "stale-exception",
    ]);
    expect(CLOSED_DEBTS).toEqual(["M2b"]);
  });
});

describe("debt ledger", () => {
  const problems = lintComponent(classes("animate-spin z-50"), component, palette);
  const entry = {
    file: component,
    rule: "motion-raw",
    match: "animate-spin",
    debt: "future",
    reason: "Replace the M1 spinner animation with its motion token",
  };
  it("silences only the exact matching problem", () => {
    expect(applyDebt(problems, [entry])).toEqual([problems[1]]);
  });
  it.each([{ file: "src/other.tsx" }, { rule: "raw-z" }, { match: "animate-" }])(
    "does not match partial or different fields: %j",
    (patch) => {
      const result = applyDebt(problems, [{ ...entry, ...patch }]);
      expect(result).toContainEqual(problems[0]);
      expect(result.some((problem) => problem.rule === "stale-debt")).toBe(true);
    },
  );
  it("fails unused debt", () => {
    expect(applyDebt([], [entry]).map((problem) => problem.rule)).toEqual(["stale-debt"]);
  });
  it("fails closed debt and restores its original problem", () => {
    const result = applyDebt(problems, [entry], ["future"]);
    expect(result).toContainEqual(problems[0]);
    expect(result.some((problem) => problem.rule === "closed-debt")).toBe(true);
  });
  it("fails closed debt even when its violation disappeared", () => {
    expect(applyDebt([], [entry], ["future"]).some((problem) => problem.rule === "closed-debt")).toBe(true);
  });
  it.each(
    [null, [{ ...entry, reason: "" }], [{ ...entry, match: "" }], [{ ...entry, debt: 3 }]].map((value) => ({ value })),
  )("rejects malformed entries: $value", ({ value }) => {
    expect(applyDebt(problems, value).some((problem) => problem.rule === "debt-entry")).toBe(true);
  });
  it("allows an empty ledger without modifying the input", () => {
    expect(applyDebt(problems, [])).toEqual(problems);
  });
});

describe("source selection", () => {
  it.each([
    ["src/components/control.tsx", "component"],
    ["src/lib/helper.ts", "component"],
    ["src/components/control.stories.tsx", "story"],
    ["src/styles.css", "css"],
  ])("selects %s as %s", (file, kind) => {
    expect(sourceKind(file)).toBe(kind);
  });
  it.each([
    "src/tokens.ts",
    "src/tokens.css",
    "src/control.test.ts",
    "src/control.test.tsx",
    "src/.env",
    "src/.env.ts",
    "src/readme.md",
    ".storybook/preview.tsx",
  ])("excludes %s", (file) => {
    expect(sourceKind(file)).toBeUndefined();
  });
});
