import { Character, CountUp, Illustration, StatTile, Streak } from "kumiko-ui";
import { GoalCelebration } from "./goal-celebration";

const cast = ["pip", "mori", "tuck"] as const;
const moments = [
  ["idle", "Ready for the next step"],
  ["waving", "Meet your new team"],
  ["cheering", "Interview booked"],
  ["thinking", "Considering an offer"],
  ["sleepy", "Time for a break"],
  ["oops", "Try another opportunity"],
] as const;
const objects = [
  ["envelope", "A new message"],
  ["calendar", "Interview day"],
  ["sealed-envelope", "Application sent"],
  ["waiting-calendar", "Waiting for the team"],
  ["dates", "Make time to prepare"],
  ["lantern", "A little encouragement"],
  ["arch", "New doors are opening"],
  ["crescent", "Rest before tomorrow"],
  ["star", "A small win"],
  ["trophy", "You made progress"],
  ["flame", "Keep going"],
] as const;

// The cast and object galleries stay in server HTML; only the button-triggered celebration needs local state.
export default function DelightPage() {
  return (
    <>
      <h1 className="font-display text-headline font-bold">Small steps count</h1>
      <div className="grid gap-4 @lg:grid-cols-3">
        <StatTile label="Applications this week" value={<CountUp value={5} />} />
        <StatTile label="Conversations started" value={<CountUp value={2} />} tone="leaf" />
        <StatTile label="Profile complete" value={<CountUp value={0.8} format={{ style: "percent" }} />} tone="sun" />
      </div>
      <Streak
        count={5}
        today="2026-11-08"
        done={["2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"]}
      />
      <GoalCelebration />
      <h2 className="font-display text-title font-bold">Company for every part of the search</h2>
      <div className="grid min-w-0 gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
        {cast.flatMap((name) =>
          moments.map(([pose, caption]) => (
            <figure key={`${name}-${pose}`} className="grid min-w-0 justify-items-center gap-2">
              <Character name={name} pose={pose} size={120} />
              <figcaption className="text-body-sm text-center">
                {name[0]!.toUpperCase() + name.slice(1)} · {caption}
              </figcaption>
            </figure>
          )),
        )}
      </div>
      <h2 className="font-display text-title font-bold">Milestones along the way</h2>
      <div className="grid min-w-0 gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
        {objects.map(([name, caption]) => (
          <figure key={name} className="grid min-w-0 justify-items-center gap-2">
            <Illustration name={name} size={120} />
            <figcaption className="text-body-sm text-center">{caption}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
