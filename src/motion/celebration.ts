import { celebrationCues, distances, durations, easings, scales } from "../tokens.ts";

const ms = (name: keyof typeof durations) => Number.parseFloat(durations[name]);
const cheer = ms("celebration-anticipation");
const stats = cheer + ms("celebration-rise");
const landing = stats + ms("celebration-fall");
const settle = landing + ms("celebration-landing");
const rest = settle + ms("celebration-settle");
const streak = celebrationCues.streak;
const atRest = "translateY(0) scale(1, 1)";

/** The approved Hop's cues and transform-only Web Animation tracks, all backed by motion tokens.
 * Use when: coordinating Celebration and its previews. Avoid when: adding independent component entrance motion.
 */
export const celebrationTimeline = {
  cheer,
  stats,
  streak,
  increment: celebrationCues.increment,
  end: celebrationCues.end,
  tracks: [
    {
      slot: "celebration-art",
      duration: rest,
      delay: 0,
      keyframes: [
        { offset: 0, transform: atRest, easing: easings.enter },
        {
          offset: cheer / rest,
          transform: `translateY(0) scale(${scales["celebration-anticipation-x"]}, ${scales["celebration-anticipation-y"]})`,
        },
        { offset: cheer / rest, transform: atRest, easing: easings.rise },
        {
          offset: stats / rest,
          transform: `translateY(-${distances["celebration-hop"]}) scale(1, 1)`,
          easing: easings.fall,
        },
        { offset: landing / rest, transform: atRest, easing: easings.enter },
        {
          offset: settle / rest,
          transform: `translateY(0) scale(${scales["celebration-landing-x"]}, ${scales["celebration-landing-y"]})`,
          easing: easings.enter,
        },
        { offset: 1, transform: atRest },
      ],
    },
    {
      slot: "celebration-shadow",
      duration: landing - cheer,
      delay: cheer,
      keyframes: [
        { offset: 0, transform: "scale(1)", easing: easings.rise },
        { offset: 0.5, transform: `scale(${scales["celebration-shadow"]})`, easing: easings.fall },
        { offset: 1, transform: "scale(1)" },
      ],
    },
    {
      slot: "streak-flame",
      duration: ms("streak-pop"),
      delay: streak,
      keyframes: [
        { offset: 0, transform: "scale(1)", easing: easings.pop },
        { offset: 0.5, transform: `scale(${scales["streak-peak"]})`, easing: easings.enter },
        { offset: 1, transform: "scale(1)" },
      ],
    },
  ],
};

/** The mounted scene, cue callback and once-only announcement for a Hop player.
 * Use when: managing Celebration's client lifecycle. Avoid when: playing server-rendered or hydrating content.
 */
export interface CelebrationPlayerOptions {
  root: HTMLElement;
  onStep: (time: number) => void;
  announce: () => void;
  reducedMotion?: boolean;
  timeScale?: number;
}

/** Plays the Hop and returns an idempotent jump to its final frame.
 * Use when: mounting Celebration on the client; call the returned function on Continue or interruption.
 * Avoid when: leaving timers alive after unmount; finish(false) cleans up silently during unmount or effect replay.
 */
export function playCelebration({
  root,
  onStep,
  announce,
  reducedMotion = false,
  timeScale = 1,
}: CelebrationPlayerOptions) {
  const document = root.ownerDocument;
  const animations: Animation[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let rateFrame: number | undefined;
  let finished = false;
  let announced = false;
  const say = () => {
    if (announced) return;
    announced = true;
    announce();
  };
  const visibility = () => {
    if (document.hidden) finish();
  };
  function finish(announceResult = true) {
    if (finished) {
      if (announceResult) say();
      return;
    }
    finished = true;
    for (const timer of timers) clearTimeout(timer);
    if (rateFrame !== undefined) cancelAnimationFrame(rateFrame);
    document.removeEventListener("visibilitychange", visibility);
    for (const animation of new Set([...animations, ...root.getAnimations({ subtree: true })])) {
      if (animation.playbackRate !== 0 && animation.effect?.getComputedTiming().endTime !== Number.POSITIVE_INFINITY)
        animation.finish();
      animation.cancel();
    }
    onStep(celebrationTimeline.end);
    if (announceResult) say();
  }
  if (!reducedMotion && !document.hidden) {
    for (const { slot, keyframes, duration, delay } of celebrationTimeline.tracks) {
      const animation = root.querySelector(`[data-slot="${slot}"]`)?.animate(keyframes, { duration, delay });
      if (animation) {
        animation.playbackRate = 1 / timeScale;
        animations.push(animation);
      }
    }
  }
  const cues = reducedMotion ? [celebrationTimeline.increment] : [cheer, stats, streak, celebrationTimeline.increment];
  for (const time of cues) {
    timers.push(
      setTimeout(() => {
        onStep(time);
        if (time === celebrationTimeline.increment) say();
        // React has to commit the new values before their CSS transitions can receive the preview rate.
        if (timeScale !== 1) {
          if (rateFrame !== undefined) cancelAnimationFrame(rateFrame);
          rateFrame = requestAnimationFrame(() => {
            for (const animation of root.getAnimations({ subtree: true })) animation.playbackRate = 1 / timeScale;
          });
        }
      }, time * timeScale),
    );
  }
  timers.push(setTimeout(finish, celebrationTimeline.end * timeScale));
  document.addEventListener("visibilitychange", visibility);
  if (document.hidden) finish();
  return finish;
}
