import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { playCelebration } from "./celebration.ts";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function scene() {
  const document = Object.assign(new EventTarget(), { hidden: false });
  const animate = vi.fn((_frames: Keyframe[], _timing: KeyframeAnimationOptions) => ({
    playbackRate: 1,
    finish: vi.fn(),
    cancel: vi.fn(),
  }));
  const root = {
    ownerDocument: document,
    querySelector: () => ({ animate }),
    getAnimations: () => animate.mock.results.map((result) => result.value),
  } as unknown as HTMLElement;
  const onStep = vi.fn();
  const announce = vi.fn();
  return { root, document, animate, onStep, announce };
}

it("cues the pose, stats, streak and announcement at their specified times and finishes by 1300ms", () => {
  const options = scene();
  const finish = playCelebration({ ...options, streakGained: true });
  expect(options.animate.mock.calls.at(-1)?.[1]).toMatchObject({ delay: 980, duration: 240 });
  vi.advanceTimersByTime(119);
  expect(options.onStep).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(options.onStep).toHaveBeenLastCalledWith(120);
  vi.advanceTimersByTime(240);
  expect(options.onStep).toHaveBeenLastCalledWith(360);
  vi.advanceTimersByTime(620);
  expect(options.onStep).toHaveBeenLastCalledWith(980);
  expect(options.announce).not.toHaveBeenCalled();
  vi.advanceTimersByTime(120);
  expect(options.onStep).toHaveBeenLastCalledWith(1100);
  expect(options.announce).toHaveBeenCalledOnce();
  vi.advanceTimersByTime(200);
  expect(options.onStep).toHaveBeenLastCalledWith(1300);
  finish();
  expect(options.announce).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it("keeps the Hop timeline and announcement without a flame pop when no streak day was gained", () => {
  const options = scene();
  playCelebration(options);
  expect(options.animate).toHaveBeenCalledTimes(2);
  expect(options.animate.mock.calls.every(([, timing]) => (timing.delay ?? 0) < 980)).toBe(true);
  vi.advanceTimersByTime(1100);
  expect(options.announce).toHaveBeenCalledOnce();
  vi.advanceTimersByTime(200);
  expect(options.onStep).toHaveBeenLastCalledWith(1300);
  expect(options.announce).toHaveBeenCalledOnce();
});

it("Continue can finish from zero, clears every animation and timer, and announces only once", () => {
  const options = scene();
  const finish = playCelebration(options);
  finish();
  for (const { value } of options.animate.mock.results) {
    expect(value.finish).toHaveBeenCalledOnce();
    expect(value.cancel).toHaveBeenCalledOnce();
  }
  vi.advanceTimersByTime(2000);
  finish();
  expect(options.onStep).toHaveBeenCalledExactlyOnceWith(1300);
  expect(options.announce).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it("still reaches the final frame when nested decorative art has an infinite animation", () => {
  const options = scene();
  const loop = {
    playbackRate: 1,
    effect: { getComputedTiming: () => ({ endTime: Number.POSITIVE_INFINITY }) },
    finish: vi.fn(() => {
      throw new Error("An infinite animation has no final frame");
    }),
    cancel: vi.fn(),
  };
  vi.spyOn(options.root, "getAnimations").mockReturnValue([loop as unknown as Animation]);
  const finish = playCelebration(options);
  expect(() => finish()).not.toThrow();
  expect(loop.cancel).toHaveBeenCalledOnce();
  expect(options.onStep).toHaveBeenCalledExactlyOnceWith(1300);
});

it("reduced motion runs no transform animations but still cues the chip and announcement", () => {
  const options = scene();
  playCelebration({ ...options, reducedMotion: true });
  expect(options.animate).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1100);
  expect(options.onStep).toHaveBeenCalledExactlyOnceWith(1100);
  expect(options.announce).toHaveBeenCalledOnce();
  vi.advanceTimersByTime(200);
  expect(options.onStep).toHaveBeenLastCalledWith(1300);
});

it("finishes when the page becomes hidden", () => {
  const options = scene();
  playCelebration(options);
  vi.advanceTimersByTime(200);
  options.document.hidden = true;
  options.document.dispatchEvent(new Event("visibilitychange"));
  expect(options.onStep).toHaveBeenLastCalledWith(1300);
  expect(options.announce).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it("cleans up silently during effect replay and announces once when a real unmount is confirmed", () => {
  const options = scene();
  const finish = playCelebration(options);
  finish(false);
  options.document.hidden = true;
  options.document.dispatchEvent(new Event("visibilitychange"));
  vi.advanceTimersByTime(2000);
  expect(options.onStep).toHaveBeenCalledExactlyOnceWith(1300);
  expect(options.announce).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
  finish();
  finish();
  expect(options.announce).toHaveBeenCalledOnce();
  expect(options.onStep).toHaveBeenCalledExactlyOnceWith(1300);
});

it("slows both Web Animations and cues by the same preview multiplier", () => {
  const options = scene();
  playCelebration({ ...options, timeScale: 4 });
  expect(options.animate.mock.results.every(({ value }) => value.playbackRate === 0.25)).toBe(true);
  vi.advanceTimersByTime(4399);
  expect(options.announce).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(options.onStep).toHaveBeenLastCalledWith(1100);
  expect(options.announce).toHaveBeenCalledOnce();
  vi.advanceTimersByTime(800);
  expect(options.onStep).toHaveBeenLastCalledWith(1300);
  expect(vi.getTimerCount()).toBe(0);
});
