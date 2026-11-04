import { describe, expect, it } from "vitest";
import { BLACK, contrast, deltaE, flatten, luminance, over, parseColor, type Rgba, toOklab, WHITE } from "./color.ts";

const red: Rgba = { r: 255, g: 0, b: 0, a: 1 };
const transparent: Rgba = { r: 0, g: 0, b: 0, a: 0 };

function nearColor(value: string, expected: Rgba) {
  const parsed = parseColor(value);
  expect(parsed).not.toBeNull();
  for (const channel of ["r", "g", "b"] as const)
    expect(Math.abs(parsed![channel] - expected[channel])).toBeLessThan(0.5);
  expect(parsed!.a).toBeCloseTo(expected.a, 10);
}

describe("parseColor", () => {
  it.each([
    "rgb(255, 0, 0)",
    "rgb(255 0 0)",
    "color(srgb 1 0 0)",
    "color(srgb 100% 0% 0%)",
    "color(srgb-linear 1 0 0)",
    "oklab(0.62796 0.22486 0.12585)",
    "oklab(62.796% 0.22486 0.12585)",
    "oklab(62.796% 56.215% 31.4625%)",
    "oklch(0.62796 0.25768 29.2339)",
    "oklch(62.796% 0.25768 29.2339deg)",
    "oklch(62.796% 64.42% 29.2339deg)",
    "oklch(0.62796 0.25768 -330.7661deg)",
    "color(display-p3 1 0 0)",
    " RGB(255, 0, 0) ",
  ])("parses %s to red", (value) => nearColor(value, red));

  it.each([
    ["rgba(0, 0, 0, 0.06)", { ...BLACK, a: 0.06 }],
    ["rgb(0 0 0 / 6%)", { ...BLACK, a: 0.06 }],
    ["rgba(255 0 0 / 50%)", { ...red, a: 0.5 }],
    ["oklab(0.5 0 0 / 0.5)", { r: 99.086, g: 99.086, b: 99.086, a: 0.5 }],
    ["oklch(50% 0 90deg / 50%)", { r: 99.086, g: 99.086, b: 99.086, a: 0.5 }],
    ["color(srgb .5 .5 .5 / 25%)", { r: 127.5, g: 127.5, b: 127.5, a: 0.25 }],
    ["color(srgb-linear 50% 50% 50% / .25)", { r: 187.516, g: 187.516, b: 187.516, a: 0.25 }],
    ["color(display-p3 50% 50% 50% / .25)", { r: 127.5, g: 127.5, b: 127.5, a: 0.25 }],
    ["rgb(100% 0% 0% / 100%)", red],
    ["rgb(2.55e2 0 0 / 5e-1)", { ...red, a: 0.5 }],
    ["transparent", transparent],
    ["rgb(none none none / none)", transparent],
    ["rgba(none, none, none, none)", transparent],
    ["color(srgb none none none / none)", transparent],
    ["color(srgb-linear none none none)", BLACK],
    ["color(display-p3 none none none)", BLACK],
    ["oklab(none none none / none)", transparent],
    ["oklch(none none none)", BLACK],
    ["oklch(.5 none none)", { r: 99.086, g: 99.086, b: 99.086, a: 1 }],
    ["oklab(.5 10% -10%)", { r: 111.5617, g: 89.5769, b: 121.6861, a: 1 }],
  ] as const)("handles components and alpha in %s", (value, expected) => nearColor(value, expected));

  it.each([
    ["rgb(300 -5 0 / 2)", red],
    ["color(srgb 2 -1 0 / -1)", { ...red, a: 0 }],
    ["color(srgb-linear 2 -1 0)", red],
  ] as const)("clamps out-of-range channels and alpha in %s", (value, expected) => nearColor(value, expected));

  it.each([
    "hsl(0 100% 50%)",
    "lab(54 80 70)",
    "lch(54 80 70)",
    "red",
    "garbage",
    "",
    "rgb()",
    "rgb(255 0)",
    "rgb(255 0 0 1)",
    "rgb(255, 0 0)",
    "rgb(255, 0, 0 / .5)",
    "rgb(255 0 0 /)",
    "rgb(255 0 0 / .5 / .5)",
    "rgb(255px 0 0)",
    "rgb(Infinity 0 0)",
    "rgb(1e999 0 0)",
    "rgb(1..2 0 0)",
    "rgb(255 0 0) trailing",
    "rgb(255 0 0",
    "color(rec2020 1 0 0)",
    "color(rgb 255 0 0)",
    "color(rgba 255 0 0)",
    "color(oklab .5 0 0)",
    "color(oklch .5 0 0)",
    "color(srgb 1 0)",
    "color(srgb 1 0 0 1)",
    "color(srgb 1 0 0 / bad)",
    "oklab(.5 0)",
    "oklch(.5 .2 1rad)",
    "oklch(.5 .2 30%)",
    "oklch(.5 .2 nonedeg)",
    "transparent()",
  ])("returns null without throwing for %s", (value) => expect(parseColor(value)).toBeNull());
});

describe("colour maths", () => {
  it("computes WCAG luminance and ignores alpha", () => {
    expect(luminance(BLACK)).toBe(0);
    expect(luminance(WHITE)).toBe(1);
    expect(luminance(red)).toBeCloseTo(0.2126, 8);
    expect(luminance({ ...red, a: 0 })).toBe(luminance(red));
    expect(luminance({ r: 10, g: 10, b: 10, a: 1 })).toBeCloseTo(10 / 255 / 12.92, 8);
  });
  it("computes 21:1 for black and white and about 4.48:1 for #777777", () => {
    expect(contrast(WHITE, BLACK)).toBe(21);
    expect(contrast(BLACK, WHITE)).toBe(21);
    expect(contrast({ r: 119, g: 119, b: 119, a: 1 }, WHITE)).toBeCloseTo(4.48, 2);
    expect(contrast(red, red)).toBe(1);
  });
  it("converts white and red to standard OKLab coordinates", () => {
    for (const [colour, expected] of [
      [WHITE, [1, 0, 0]],
      [BLACK, [0, 0, 0]],
      [red, [0.62796, 0.22486, 0.12585]],
    ] as const) {
      const lab = toOklab(colour);
      expected.forEach((coordinate, index) => {
        expect(lab[index]).toBeCloseTo(coordinate, 4);
      });
    }
  });
  it("measures symmetric Euclidean OKLab distance", () => {
    expect(deltaE(red, red)).toBe(0);
    expect(deltaE(WHITE, BLACK)).toBeCloseTo(1, 6);
    expect(deltaE(red, WHITE)).toBeCloseTo(0.45257, 3);
    expect(deltaE(red, WHITE)).toBe(deltaE(WHITE, red));
  });
});

describe("compositing", () => {
  it("composites in gamma-encoded sRGB, including non-opaque bottoms", () => {
    expect(over({ ...BLACK, a: 0.5 }, WHITE)).toEqual({ r: 127.5, g: 127.5, b: 127.5, a: 1 });
    expect(over({ ...BLACK, a: 0.5 }, { ...WHITE, a: 0.5 })).toEqual({ r: 85, g: 85, b: 85, a: 0.75 });
    expect(over({ ...red, a: 0.5 }, transparent)).toEqual({ ...red, a: 0.5 });
  });
  it("leaves a bottom unchanged under a transparent top and handles zero total alpha", () => {
    expect(over(transparent, red)).toEqual(red);
    expect(over(transparent, transparent)).toEqual(transparent);
  });
  it("flattens topmost-first layers onto white or a supplied opaque base without mutation", () => {
    const layers = [
      { ...BLACK, a: 0.5 },
      { ...red, a: 0.5 },
    ];
    const original = structuredClone(layers);
    expect(flatten(layers)).toEqual({ r: 127.5, g: 63.75, b: 63.75, a: 1 });
    expect(flatten([transparent], red)).toEqual(red);
    expect(flatten([])).toEqual(WHITE);
    expect(flatten([], BLACK)).toEqual(BLACK);
    expect(layers).toEqual(original);
  });
});
