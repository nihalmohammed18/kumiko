"use client";

import { type ComponentProps, type ReactNode, useEffect, useState } from "react";
import { CheckIcon, FlameIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { durations } from "../tokens.ts";
import { badgeStyles } from "./badge-styles.ts";
import { CountUp } from "./count-up.tsx";

/** Native div props and a streak's count, calendar date and completed ISO dates.
 * Use when: typing Streak; supply YYYY-MM-DD dates. Avoid when: passing timestamps or time-zone-dependent dates.
 */
export interface StreakProps extends Omit<ComponentProps<"div">, "children"> {
  count: number;
  today: string;
  done: readonly string[];
  /** Shows a +1 chip and pops the flame once on mount or when changed from false to true. */
  increment?: boolean;
  /** Replaces the decorative number display; count remains the final accessible value. */
  countDisplay?: ReactNode;
  /** Replaces the localized next-step hint; false hides the hint and goal line. */
  hint?: ReactNode;
  /** Shows the localized number of days remaining while count is below this goal. */
  goal?: number;
}

/** A localized streak counter and calendar week with checked completed days.
 * Use when: encouraging a daily habit. Avoid when: picking a date; use a date input or calendar.
 *
 * @example
 * <Streak count={3} today="2026-11-08" done={["2026-11-06", "2026-11-07", "2026-11-08"]} />
 */
export function Streak({
  count,
  today,
  done,
  increment = false,
  countDisplay,
  hint,
  goal,
  className,
  ...props
}: StreakProps) {
  const { locale, labels } = useKumiko();
  const state = done.includes(today) ? "done" : count === 0 ? "zero" : "pending";
  const defaultHint =
    state === "zero" ? labels.streakZeroHint : state === "pending" ? labels.streakPendingHint : labels.streakDoneHint;
  const [popping, setPopping] = useState(false);
  useEffect(() => {
    setPopping(false);
    if (!increment) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        setPopping(true);
        timer = setTimeout(() => setPopping(false), Number.parseFloat(durations["streak-pop"]) / 2);
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [increment]);

  const weekLocale = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number };
    weekInfo?: { firstDay: number };
  };
  const firstDay = weekLocale.getWeekInfo?.().firstDay ?? weekLocale.weekInfo?.firstDay ?? 1;
  const [year, month, day] = today.split("-").map(Number);
  const start = new Date(0);
  start.setUTCFullYear(year!, month! - 1, day!);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() - firstDay + 7) % 7));
  const narrow = new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" });
  const full = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" });
  const plural = labels.streak;
  const template =
    typeof plural === "string" ? plural : (plural[new Intl.PluralRules(locale).select(count)] ?? plural.other);
  const placeholder = template.indexOf("{count}");

  return (
    <div
      {...props}
      data-slot="streak"
      data-state={state}
      className={cn("@container grid min-w-0 gap-4 text-ink", className)}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <span
          data-slot="streak-flame"
          data-popping={popping ? "" : undefined}
          className="streak-flame inline-flex size-10 shrink-0"
        >
          <FlameIcon className="size-full" />
        </span>
        <p data-slot="streak-label" className="min-w-0 wrap-anywhere font-display text-headline font-extrabold">
          <span aria-hidden>
            {placeholder < 0 ? "" : template.slice(0, placeholder)}
            {countDisplay ?? <CountUp value={count} />}
            {placeholder < 0 ? ` ${template}` : formatLabel(template.slice(placeholder + 7), locale, count)}
          </span>
          <span className="sr-only">{formatLabel(labels.streak, locale, count)}</span>
        </p>
        {increment && (
          <span
            data-slot="streak-increment"
            aria-hidden
            className={cn(
              badgeStyles({ tone: "sun" }),
              "transition-[opacity,scale] duration-streak-pop ease-pop starting:scale-(--kumiko-scale-increment-from) starting:opacity-0 motion-reduce:transition-opacity motion-reduce:starting:scale-100",
            )}
          >
            +{new Intl.NumberFormat(locale).format(1)}
          </span>
        )}
      </div>
      <ul data-slot="streak-week" className="flex min-w-0 list-disc flex-wrap gap-1">
        {Array.from({ length: 7 }, (_, offset) => {
          const date = new Date(start);
          date.setUTCDate(start.getUTCDate() + offset);
          const iso = date.toISOString().slice(0, 10);
          const completed = done.includes(iso);
          const current = iso === today;
          return (
            <li
              key={iso}
              data-slot="streak-day"
              data-date={iso}
              data-done={completed ? "" : undefined}
              aria-current={current ? "date" : undefined}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <span
                aria-hidden
                className={cn(
                  "flex flex-col items-center gap-1 text-caption font-bold text-ink-muted",
                  current && "text-brand-text",
                )}
              >
                {narrow.format(date)}
                <span
                  data-slot="streak-today-marker"
                  className={cn(
                    "size-1 rounded-full bg-brand-text forced-colors:bg-forced-ink",
                    !current && "invisible",
                  )}
                />
              </span>
              <span
                aria-hidden
                data-slot="streak-mark"
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 border-line forced-colors:border-forced-ink",
                  completed &&
                    "border-sun bg-sun text-sun-fg forced-colors:forced-color-adjust-none forced-colors:bg-forced-fill forced-colors:text-forced-fg",
                  current &&
                    state === "pending" &&
                    "ring-2 ring-inset ring-brand-text forced-colors:outline-solid forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-forced-ink",
                )}
              >
                {completed && <CheckIcon className="size-4" />}
              </span>
              <span className="sr-only">
                {full.format(date)}
                {completed && `, ${formatLabel(labels.done, locale)}`}
                {current && `, ${formatLabel(labels.today, locale)}`}
              </span>
            </li>
          );
        })}
      </ul>
      {hint !== false && (
        <p data-slot="streak-hint" className="min-w-0 wrap-anywhere text-body-sm text-ink-muted">
          {hint ?? formatLabel(defaultHint, locale)}
          {goal !== undefined && count < goal && (
            <>
              {" "}
              <span data-slot="streak-goal">
                {formatLabel(labels.streakGoal, locale, goal - count, {
                  goal: new Intl.NumberFormat(locale).format(goal),
                })}
              </span>
            </>
          )}
        </p>
      )}
    </div>
  );
}
