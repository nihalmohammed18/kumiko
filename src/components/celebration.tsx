"use client";

import { type ComponentProps, type ReactNode, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { celebrationTimeline, playCelebration } from "../motion/celebration.ts";
import { useKumiko } from "../provider.tsx";
import { durations } from "../tokens.ts";
import { Button } from "./button.tsx";
import { Character, type CharacterProps } from "./character.tsx";
import { CountUp, type CountUpProps } from "./count-up.tsx";
import { Progress } from "./progress.tsx";
import { StatTile } from "./stat-tile.tsx";
import { Streak, type StreakProps } from "./streak.tsx";

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

/** A celebration's title, optional decorative art, final metrics and Continue action.
 * Use when: typing Celebration after a completed action. Avoid when: presenting ongoing work or a routine status.
 */
export interface CelebrationProps extends Omit<ComponentProps<"section">, "title" | "children"> {
  title: string;
  description?: ReactNode;
  character?: CharacterProps["name"];
  art?: ReactNode;
  stats?: readonly { label: string; value: number; from?: number; format?: Intl.NumberFormatOptions }[];
  progress?: { label: string; value: number; from?: number };
  /** Set gained only when this achievement earned a streak day; defaults to false. */
  streak?: Pick<StreakProps, "count" | "today" | "done"> & { gained?: boolean };
  onContinue?: () => void;
  continueLabel?: string;
  /** Preview-only timing multiplier; 4 plays at quarter speed. Remount to replay; leave at 1 in products. */
  timeScale?: number;
}

/** An interruptible Hop celebrating a completed action, with final accessible values throughout.
 * Use when: showing a rare achievement; place it in a Dialog or move focus to its heading (it never moves focus).
 * Avoid when: animating routine saves. Server rendering and hydration show the final frame without replaying.
 * A streak only counts up, pops and announces +1 when streak.gained is true.
 *
 * @example
 * <Celebration title="First application sent!" streak={{ count: 1, today: "2026-11-08", done: ["2026-11-08"], gained: true }} />
 */
export function Celebration({
  title,
  description,
  character,
  art,
  stats,
  progress,
  streak,
  onContinue,
  continueLabel,
  timeScale = 1,
  className,
  ...props
}: CelebrationProps) {
  const { announce, labels, locale } = useKumiko();
  const titleId = useId();
  const client = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const reducedMotion = useSyncExternalStore(subscribeMotion, reducedMotionSnapshot, clientSnapshot);
  // Latch the first snapshot: hydration must never turn a finished server scene into a fresh client run.
  const [initial] = useState(() => ({
    client,
    reducedMotion,
    streakGained: streak?.gained === true,
    timeScale: Number.isFinite(timeScale) && timeScale > 0 ? timeScale : 1,
  }));
  const [step, setStep] = useState(initial.client ? 0 : celebrationTimeline.end);
  const root = useRef<HTMLDivElement>(null);
  const finishRef = useRef<ReturnType<typeof playCelebration> | undefined>(undefined);
  const gain = streak?.gained ? ` +${new Intl.NumberFormat(locale).format(1)}` : "";
  const message = streak ? `${title} ${formatLabel(labels.streak, locale, streak.count)}${gain}` : title;
  const announcement = useRef({ announce, message });
  useEffect(() => {
    announcement.current = { announce, message };
  }, [announce, message]);
  useEffect(() => {
    if (!initial.client || !root.current) return;
    const element = root.current;
    let mounted = true;
    const finish = playCelebration({
      root: element,
      timeScale: initial.timeScale,
      reducedMotion: initial.reducedMotion,
      streakGained: initial.streakGained,
      onStep: (time) => {
        if (mounted) setStep(time);
      },
      announce: () => announcement.current.announce(announcement.current.message),
    });
    finishRef.current = finish;
    return () => {
      mounted = false;
      finish(false);
      finishRef.current = undefined;
      // Effect replay keeps the element connected; a route change removes it before this microtask.
      queueMicrotask(() => {
        if (!element.isConnected) finish();
      });
    };
  }, [initial]);
  useEffect(() => {
    if (reducedMotion && !initial.reducedMotion) finishRef.current?.();
  }, [reducedMotion, initial.reducedMotion]);
  const finished = step >= celebrationTimeline.end;
  const instant = finished || reducedMotion || initial.reducedMotion;
  const counting = instant || step >= celebrationTimeline.stats;
  const streakCounting = instant || step >= celebrationTimeline.streak;
  const countDuration = instant ? 0 : Number.parseFloat(durations["count-up"]) * initial.timeScale;
  const streakDuration = instant ? 0 : Number.parseFloat(durations["streak-pop"]) * initial.timeScale;
  const finalProgress = progress && Math.min(100, Math.max(0, progress.value));
  return (
    <section
      {...props}
      data-slot="celebration"
      data-finished={finished ? "" : undefined}
      aria-labelledby={titleId}
      className={cn(
        "@container w-full min-w-0 max-w-md rounded-card border-2 border-line bg-surface p-6 text-center text-ink",
        "[box-shadow:0_var(--kumiko-edge-h)_0_var(--kumiko-edge-neutral)]",
        className,
      )}
    >
      <div ref={root} className="grid min-w-0 justify-items-center gap-6">
        {(art != null || character != null) && (
          <div aria-hidden className="relative grid size-48 max-w-full place-items-center rounded-full bg-brand-tint">
            <svg aria-hidden focusable="false" viewBox="0 0 180 180" className="absolute inset-0 m-auto size-45">
              <ellipse
                data-slot="celebration-shadow"
                cx="90"
                cy="164"
                rx="30"
                ry="4"
                fill="var(--kumiko-line)"
                className="origin-center [transform-box:fill-box]"
              />
            </svg>
            <div
              data-slot="celebration-art"
              className="grid size-45 max-w-full origin-[50%_calc(100%*8/9)] place-items-center [&>*]:max-h-full [&>*]:max-w-full [&_svg]:size-full [&_[data-slot=character-ground]]:hidden"
            >
              {art ??
                (character && (
                  <Character
                    name={character}
                    pose={instant || step >= celebrationTimeline.cheer ? "cheering" : "idle"}
                  />
                ))}
            </div>
          </div>
        )}
        <div className="grid w-full min-w-0 gap-2">
          <h2
            id={titleId}
            data-slot="celebration-title"
            tabIndex={-1}
            className="min-w-0 wrap-anywhere font-display text-headline font-extrabold focus-visible:outline-solid focus-visible:outline-(length:--kumiko-ring-width) focus-visible:outline-offset-(--kumiko-ring-gap) focus-visible:outline-focus"
          >
            {title}
          </h2>
          {description != null && (
            <p data-slot="celebration-description" className="min-w-0 wrap-anywhere text-body text-ink-muted">
              {description}
            </p>
          )}
        </div>
        {stats != null && stats.length > 0 && (
          <div data-slot="celebration-stats" className="flex w-full min-w-0 flex-wrap justify-center gap-4">
            {stats.map(({ label, ...number }) => (
              <StatTile
                key={label}
                label={label}
                className="basis-36 flex-1"
                value={<CelebrationNumber {...number} active={counting} duration={countDuration} locale={locale} />}
              />
            ))}
          </div>
        )}
        {progress && (
          <Progress
            className={cn(
              "w-full [&_[data-slot=progress-indicator]]:duration-celebration-progress",
              finished && "[&_[data-slot=progress-indicator]]:transition-none",
            )}
            label={progress.label}
            value={counting ? progress.value : (progress.from ?? 0)}
            aria-valuenow={finalProgress}
            aria-valuetext={new Intl.NumberFormat(locale, { style: "percent" }).format(finalProgress! / 100)}
          />
        )}
        {streak && (
          <Streak
            count={streak.count}
            today={streak.today}
            done={streak.done}
            className={cn(
              "w-full [&>div]:grid [&>div]:grid-cols-[2.5rem_minmax(0,1fr)_3rem] [&_[data-slot=streak-week]]:justify-center",
              "[&_[data-slot=streak-flame]]:transition-none [&_[data-slot=streak-flame][data-popping]]:scale-100 [&_[data-slot=streak-increment]]:duration-move",
              finished && "[&_[data-slot=streak-increment]]:transition-none",
            )}
            increment={streak.gained === true && step >= celebrationTimeline.increment}
            countDisplay={
              <CelebrationNumber
                value={streak.count}
                from={streak.gained ? Math.max(0, streak.count - 1) : streak.count}
                active={!streak.gained || streakCounting}
                duration={streak.gained ? streakDuration : 0}
                locale={locale}
              />
            }
          />
        )}
        {onContinue && (
          <Button
            className="w-full"
            tone="primary"
            onClick={() => {
              finishRef.current?.();
              setStep(celebrationTimeline.end);
              onContinue();
            }}
          >
            {continueLabel ?? formatLabel(labels.continue, locale)}
          </Button>
        )}
      </div>
    </section>
  );
}

function CelebrationNumber({
  value,
  from = 0,
  duration,
  format,
  active,
  locale,
}: Pick<CountUpProps, "value" | "from" | "duration" | "format"> & { active: boolean; locale: string }) {
  const final = new Intl.NumberFormat(locale, format).format(value);
  return (
    <span className="inline-grid min-w-0 max-w-full grid-cols-1 grid-rows-1 tabular-nums">
      <CountUp
        aria-hidden
        value={active ? value : from}
        from={from}
        duration={duration}
        format={format}
        className="col-start-1 row-start-1"
      />
      <span aria-hidden className="invisible col-start-1 row-start-1 min-w-0 wrap-anywhere">
        {final}
      </span>
      <span data-slot="celebration-number-final" className="sr-only">
        {final}
      </span>
    </span>
  );
}
