import { describe, expect, it } from "vitest";
import { inside, outset, plusPoints, type Rect, sameBox, undersized } from "./geometry.ts";

const box: Rect = { left: 10, top: 20, width: 24, height: 30 };
const target = (left: number, top = 0, width = 16, height = width): Rect => ({ left, top, width, height });

describe("rectangles", () => {
  it("checks all four edges with the default tolerance", () => {
    expect(inside(box, box)).toBe(true);
    expect(inside(outset(box, { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }), box)).toBe(true);
    for (const side of ["top", "right", "bottom", "left"] as const)
      expect(inside(outset(box, { top: 0, right: 0, bottom: 0, left: 0, [side]: 0.501 }), box)).toBe(false);
    expect(inside({ left: 12, top: 22, width: 20, height: 26 }, box, 0)).toBe(true);
    expect(inside({ ...box, left: 9 }, box, 1)).toBe(true);
    expect(inside({ ...box, left: 9.9 }, box, 0)).toBe(false);
  });
  it("outsets asymmetrically and supports shrinking without mutation", () => {
    expect(outset(box, { top: 1, right: 2, bottom: 3, left: 4 })).toEqual({ left: 6, top: 19, width: 30, height: 34 });
    expect(outset(box, { top: -1, right: -2, bottom: -3, left: -4 })).toEqual({
      left: 14,
      top: 21,
      width: 18,
      height: 26,
    });
    expect(box).toEqual({ left: 10, top: 20, width: 24, height: 30 });
  });
  it("compares edges rather than independent widths", () => {
    expect(sameBox(box, { ...box, left: 10.5, top: 20.5 })).toBe(true);
    expect(sameBox(box, { ...box, left: 10.4, width: 24.4 })).toBe(false);
    for (const change of [{ left: 10.6 }, { top: 20.6 }, { width: 24.6 }, { height: 30.6 }])
      expect(sameBox(box, { ...box, ...change })).toBe(false);
    expect(sameBox(box, { ...box, width: 25 }, 1)).toBe(true);
    expect(sameBox(box, { ...box, width: 24.1 }, 0)).toBe(false);
  });
  it("returns the centre followed by positive and negative x and y hit-test points", () => {
    expect(plusPoints(box, 24)).toEqual([
      { x: 22, y: 35 },
      { x: 33.5, y: 35 },
      { x: 10.5, y: 35 },
      { x: 22, y: 46.5 },
      { x: 22, y: 23.5 },
    ]);
    expect(plusPoints(box, 40)[1]).toEqual({ x: 41.5, y: 35 });
  });
});

describe("undersized", () => {
  it("accepts full-size targets, empty lists and isolated undersized targets", () => {
    expect(undersized([])).toEqual([]);
    expect(undersized([target(0, 0, 24), target(24, 0, 44)])).toEqual([]);
    expect(undersized([target(0, 0, 10)])).toEqual([]);
  });
  it("passes two 16px targets 30px apart and fails them 16px apart", () => {
    expect(undersized([target(0), target(30)])).toEqual([]);
    expect(undersized([target(0), target(16)])).toEqual([0, 1]);
  });
  it("checks both dimensions and only reports undersized indices", () => {
    expect(undersized([target(0), target(18, 0, 44)])).toEqual([0]);
    expect(undersized([target(0, 0, 44, 10), target(0, 12, 44)])).toEqual([0]);
    expect(undersized([target(0, 0, 10, 44), target(12, 0, 44)])).toEqual([0]);
  });
  it("checks circle-circle overlap even when neither circle reaches the other rectangle", () => {
    expect(undersized([target(0, 0, 2), target(23, 0, 2)])).toEqual([0, 1]);
  });
  it("allows exact tangency for circles and for a circle against a rectangle", () => {
    expect(undersized([target(0), target(24)])).toEqual([]);
    expect(undersized([target(0, 0, 10), target(17, 0, 44)])).toEqual([]);
  });
  it("uses nearest-point circle geometry at rectangle corners", () => {
    expect(undersized([target(0, 0, 10), target(17, 17, 44)])).toEqual([]);
    expect(undersized([target(0, 0, 10), target(12, 12, 44)])).toEqual([0]);
  });
  it("honours a supplied minimum and leaves the inputs unchanged", () => {
    const targets = [target(0, 0, 30), target(35, 0, 30)];
    const original = structuredClone(targets);
    expect(undersized(targets)).toEqual([]);
    expect(undersized(targets, 40)).toEqual([0, 1]);
    expect(targets).toEqual(original);
  });
});
