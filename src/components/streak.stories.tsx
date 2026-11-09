"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { pickStoryCopy, storyCopy, storySettings } from "../../.storybook/story-copy.ts";
import { useKumiko } from "../provider.tsx";
import { Streak, type StreakProps } from "./streak.tsx";

const meta = {
  title: "Delight/Streak",
  component: Streak,
  args: {
    count: 12,
    today: "2026-11-06",
    done: ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05"],
    className: "w-full max-w-sm",
  },
} satisfies Meta<typeof Streak>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    await waitFor(() => {
      expect(canvas.getAllByRole("listitem")).toHaveLength(7);
      expect(canvas.getAllByRole("listitem").filter((day) => day.hasAttribute("data-done"))).toHaveLength(4);
      expect(canvas.getByRole("list").querySelector('[aria-current="date"]')).toHaveAttribute("data-date", args.today);
    });
  },
};

export const WeekStart: Story = {
  name: "Week start",
  play: async ({ canvas, globals }) => {
    const locale = new Intl.Locale(storySettings(globals).locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const firstDay = locale.getWeekInfo?.().firstDay ?? locale.weekInfo?.firstDay ?? 1;
    await waitFor(() => {
      const date = canvas.getAllByRole("listitem")[0]!.getAttribute("data-date");
      expect(new Date(`${date}T00:00:00Z`).getUTCDay()).toBe(firstDay % 7);
    });
  },
};

export const Increment: Story = {
  args: { increment: true },
  play: async ({ canvasElement, globals }) => {
    const chip = canvasElement.querySelector('[data-slot="streak-increment"]');
    const one = new Intl.NumberFormat(storySettings(globals).locale).format(1);
    await waitFor(() => {
      expect(chip).toBeVisible();
      expect(chip).toHaveTextContent(`+${one}`);
    });
  },
};

export const Zero: Story = {
  args: { count: 0, done: [] },
};

export const Pending: Story = {};

export const Done: Story = {
  args: { done: [...meta.args.done, meta.args.today] },
};

export const DoneWithGoal: Story = {
  name: "Done with goal",
  args: { ...Done.args, goal: 14 },
};

function StreakStates(args: StreakProps) {
  const { locale } = useKumiko();
  const copy = pickStoryCopy(storyCopy.streakStates, locale);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${args.today}T00:00:00Z`),
  );
  return (
    <div className="flex min-w-0 flex-wrap items-start gap-6">
      <Streak {...args} count={0} done={[]} role="group" aria-label={`${copy.zero}, ${date}`} />
      <Streak {...args} role="group" aria-label={`${copy.pending}, ${date}`} />
      <Streak {...args} done={[...args.done, args.today]} role="group" aria-label={`${copy.done}, ${date}`} />
      <Streak {...args} done={[...args.done, args.today]} goal={14} role="group" aria-label={`${copy.goal}, ${date}`} />
    </div>
  );
}

export const States: Story = {
  render: (args) => <StreakStates {...args} />,
};
