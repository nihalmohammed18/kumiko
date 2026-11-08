import { easings } from "../tokens.ts";

const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = easings.enter.match(/[\d.]+/g)!.map(Number);
const bezier = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;

function easeEnter(progress: number) {
  let low = 0;
  let high = 1;
  // Invert the time axis so RAF follows the same curve as the CSS ease-enter token.
  for (let i = 0; i < 16; i++) {
    const t = (low + high) / 2;
    if (bezier(t, x1, x2) < progress) low = t;
    else high = t;
  }
  return bezier((low + high) / 2, y1, y2);
}

/** Runs one cancellable, eased number animation on animation frames.
 * Use when: implementing useCountUp's frame lifecycle. Avoid when: consuming the component; use useCountUp.
 */
export function animateCountUp(from: number, value: number, duration: number, show: (value: number) => void) {
  if (
    duration <= 0 ||
    !Number.isFinite(duration) ||
    !Number.isFinite(from) ||
    !Number.isFinite(value) ||
    from === value
  ) {
    show(value);
    return () => undefined;
  }
  const started = performance.now();
  const whole = Number.isInteger(from) && Number.isInteger(value);
  let frame: number;
  const tick: FrameRequestCallback = (time) => {
    const progress = Math.min(1, Math.max(0, (time - started) / duration));
    const change = (value - from) * easeEnter(progress);
    show(progress === 1 ? value : from + (whole ? Math.trunc(change) : change));
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
