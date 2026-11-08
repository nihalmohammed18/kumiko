"use client";

import { type ComponentProps, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { durations } from "../tokens.ts";
import { animateCountUp } from "./count-up-animation.ts";

const subscribeHydration = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const motionQuery = "(prefers-reduced-motion: reduce)";
const reducedMotionSnapshot = () => window.matchMedia(motionQuery).matches;

function subscribeMotion(notify: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}

/** Initial number and animation duration in milliseconds.
 * Use when: configuring CountUp or useCountUp. Avoid when: delaying an animation; mount or change its value when needed.
 */
export interface CountUpOptions {
  /** Starting value for a client mount; later updates start from the shown number. Defaults to zero. */
  from?: number;
  /** Defaults to 600ms. Zero shows the final value immediately. */
  duration?: number;
}

/** Counts towards a value, preserving the shown number when interrupted.
 * Use when: composing a custom numeric display. Avoid when: counting every frame for assistive technology.
 * Server renders and hydration show the final value; later client mounts animate from the initial number.
 */
export function useCountUp(
  value: number,
  { from = 0, duration = Number.parseFloat(durations["count-up"]) }: CountUpOptions = {},
) {
  const client = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const reducedMotion = useSyncExternalStore(subscribeMotion, reducedMotionSnapshot, clientSnapshot);
  const instant = reducedMotion || duration <= 0 || !Number.isFinite(duration);
  const [shown, setShown] = useState(client && !instant ? from : value);
  const current = useRef(shown);
  useEffect(
    () =>
      animateCountUp(current.current, value, instant ? 0 : duration, (next) => {
        current.current = next;
        setShown(next);
      }),
    [value, duration, instant],
  );
  return instant ? value : shown;
}

/** Native span props, a numeric target and Intl number formatting options.
 * Use when: typing CountUp. Avoid when: passing preformatted content; use a plain span or StatTile's value.
 */
export interface CountUpProps extends Omit<ComponentProps<"span">, "children">, CountUpOptions {
  value: number;
  format?: Intl.NumberFormatOptions;
}

/** An animated locale-formatted number with stable width and one accessible final value.
 * Use when: drawing attention to a changed statistic. Avoid when: motion would distract from frequent numeric updates.
 */
export function CountUp({ value, from, duration, format, className, ...props }: CountUpProps) {
  const { locale } = useKumiko();
  const shown = useCountUp(value, { from, duration });
  const formatter = useMemo(() => new Intl.NumberFormat(locale, format), [locale, format]);
  const final = formatter.format(value);
  const [range, setRange] = useState({ value, from: shown });
  // Reserve both ends of each run so decreasing through a digit boundary cannot shrink the grid mid-animation.
  if (!Object.is(range.value, value)) setRange({ value, from: shown });
  return (
    <span
      {...props}
      data-slot="count-up"
      className={cn("inline-grid min-w-0 max-w-full grid-cols-1 grid-rows-1 align-baseline tabular-nums", className)}
    >
      <span data-slot="count-up-value" aria-hidden className="col-start-1 row-start-1 min-w-0 wrap-anywhere">
        {formatter.format(shown)}
      </span>
      <span
        data-slot="count-up-reserve"
        aria-hidden
        className="invisible col-start-1 row-start-1 min-w-0 wrap-anywhere"
      >
        {final}
      </span>
      <span aria-hidden className="invisible col-start-1 row-start-1 min-w-0 wrap-anywhere">
        {formatter.format(range.from)}
      </span>
      <span data-slot="count-up-final" className="sr-only">
        {final}
      </span>
    </span>
  );
}
