import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { animateCountUp } from "./count-up-animation.ts";

let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;

beforeEach(() => {
  frames = new Map();
  nextFrame = 0;
  vi.spyOn(performance, "now").mockReturnValue(0);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function frame(time: number) {
  const callbacks = [...frames.values()];
  frames.clear();
  for (const callback of callbacks) callback(time);
}

it("steps through whole numbers with ease-out and ends exactly at the target", () => {
  let shown = 0;
  animateCountUp(0, 12, 600, (value) => {
    shown = value;
  });
  frame(300);
  expect(Number.isInteger(shown)).toBe(true);
  expect(shown).toBeGreaterThan(6);
  expect(shown).toBeLessThan(12);
  frame(600);
  expect(shown).toBe(12);
  expect(frames.size).toBe(0);
});

it("preserves fractions for percentage values", () => {
  let shown = 0;
  animateCountUp(0, 0.8, 600, (value) => {
    shown = value;
  });
  frame(300);
  expect(shown).toBeGreaterThan(0.4);
  expect(shown).toBeLessThan(0.8);
  frame(600);
  expect(shown).toBe(0.8);
});

it("cancels an interrupted run and continues towards a lower target from the shown number", () => {
  let shown = 0;
  const stop = animateCountUp(0, 100, 600, (value) => {
    shown = value;
  });
  frame(100);
  const interrupted = shown;
  stop();
  vi.mocked(performance.now).mockReturnValue(100);
  animateCountUp(interrupted, 5, 600, (value) => {
    shown = value;
  });
  frame(300);
  expect(shown).toBeLessThan(interrupted);
  expect(shown).toBeGreaterThan(5);
  frame(700);
  expect(shown).toBe(5);
  expect(frames.size).toBe(0);
});

it("shows the target immediately when duration is zero", () => {
  let shown = 0;
  animateCountUp(0, 12, 0, (value) => {
    shown = value;
  });
  expect(shown).toBe(12);
  expect(frames.size).toBe(0);
});
