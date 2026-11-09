"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { formatLabel, labels } from "../labels.ts";
import { Button } from "./button.tsx";
import { Celebration, type CelebrationProps } from "./celebration.tsx";
import { Illustration } from "./illustration.tsx";
import { Switch } from "./switch.tsx";
import { Toaster, toast } from "./toast.tsx";

const meta = {
  title: "Delight/Celebration",
  component: Celebration,
  args: {
    title: "Application sent!",
    description: "You're one step closer.",
    character: "pip",
    stats: [
      { label: "Applications", value: 12, from: 11 },
      { label: "Profile", value: 0.8, from: 0.6, format: { style: "percent" } },
    ],
    progress: { label: "Weekly goal", value: 60, from: 40 },
    streak: {
      count: 5,
      today: "2026-11-08",
      done: ["2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"],
    },
    onContinue: fn(),
  },
} satisfies Meta<typeof Celebration>;

export default meta;
type Story = StoryObj<typeof meta>;

function HopPreview(args: CelebrationProps) {
  const [replay, setReplay] = useState(0);
  const [slow, setSlow] = useState(false);
  return (
    <div className="grid w-full min-w-0 max-w-md gap-6">
      <div className="flex min-w-0 flex-wrap items-center gap-4">
        <Button onClick={() => setReplay((current) => current + 1)}>Replay</Button>
        <Switch
          checked={slow}
          onCheckedChange={(next) => {
            for (const animation of document.getAnimations()) animation.playbackRate = next ? 0.25 : 1;
            setSlow(next);
            setReplay((current) => current + 1);
          }}
        >
          Slow motion
        </Switch>
      </div>
      <Celebration {...args} key={replay} timeScale={slow ? 4 : 1} />
    </div>
  );
}

function finalValues(root: HTMLElement, args: CelebrationProps, locale: string) {
  const tiles = root.querySelectorAll('[data-slot="stat-tile"]');
  args.stats?.forEach((stat, index) => {
    expect(tiles[index]?.querySelector('[data-slot="count-up-value"]')?.textContent).toBe(
      new Intl.NumberFormat(locale, stat.format).format(stat.value),
    );
  });
  if (args.progress) {
    expect(root.querySelector<HTMLElement>('[data-slot="progress-indicator"]')?.style.width).toBe(
      `${args.progress.value}%`,
    );
    expect(root.querySelector('[data-slot="progress"]')).toHaveAttribute("aria-valuenow", String(args.progress.value));
  }
  if (args.streak) {
    expect(root.querySelector('[data-slot="streak"] [data-slot="count-up-value"]')?.textContent).toBe(
      new Intl.NumberFormat(locale).format(args.streak.count),
    );
  }
  if (args.character) expect(root.querySelector('[data-slot="character"]')).toHaveAttribute("data-pose", "cheering");
}

export const Hop: Story = {
  args: { streak: { ...meta.args.streak, gained: true } },
  render: (args) => <HopPreview {...args} />,
  play: async ({ args, canvas, canvasElement, globals, userEvent }) => {
    args.onContinue?.mockClear();
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const scene = () => canvas.getByRole("region", { name: args.title });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finalValues(scene(), args, locale);
    await waitFor(
      () => {
        expect(scene()).toHaveAttribute("data-finished");
        finalValues(scene(), args, locale);
      },
      { timeout: 1600 },
    );
    const original = scene();
    await userEvent.tab();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Replay" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(scene()).not.toBe(original));
    const slow = canvas.getByRole("switch", { name: "Slow motion" });
    await userEvent.click(slow);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(args.onContinue).toHaveBeenCalledOnce();
      expect(scene()).toHaveAttribute("data-finished");
      finalValues(scene(), args, locale);
    });
    await userEvent.click(slow);
    await waitFor(
      () => {
        expect(scene()).toHaveAttribute("data-finished");
        finalValues(scene(), args, locale);
        expect(scene().querySelector('[data-slot="streak-increment"]')).toBeVisible();
        expect(within(canvasElement.ownerDocument.body).getByRole("status")).toHaveTextContent(
          `${args.title} ${formatLabel(labels[globals.dir === "rtl" ? "ar" : "en"].streak, locale, args.streak!.count)} +${new Intl.NumberFormat(locale).format(1)}`,
        );
      },
      { timeout: 1600 },
    );
  },
};

export const SameDayAchievement: Story = {
  name: "Same-day achievement",
  args: { streak: { ...meta.args.streak, gained: false } },
  render: (args) => <HopPreview {...args} />,
  play: async ({ args, canvas, canvasElement, globals }) => {
    const root = canvas.getByRole("region", { name: args.title });
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const streak = root.querySelector('[data-slot="streak"]')!;
    await waitFor(() => {
      expect(streak.querySelector('[data-slot="count-up-value"]')).toHaveTextContent(
        new Intl.NumberFormat(locale).format(args.streak!.count),
      );
      expect(streak.querySelector('[data-slot="streak-increment"]')).toBeNull();
      expect(streak.querySelector('[data-slot="streak-flame"]')!.getAnimations()).toHaveLength(0);
    });
    await waitFor(
      () => {
        expect(root).toHaveAttribute("data-finished");
        finalValues(root, args, locale);
        expect(streak.querySelector('[data-slot="streak-increment"]')).toBeNull();
        expect(within(canvasElement.ownerDocument.body).getByRole("status").textContent).toBe(
          `${args.title} ${formatLabel(labels[globals.dir === "rtl" ? "ar" : "en"].streak, locale, args.streak!.count)}`,
        );
      },
      { timeout: 1600 },
    );
  },
};

export const WithoutFaces: Story = {
  name: "Without faces",
  args: {
    art: <Illustration name="trophy" />,
    character: undefined,
    description: undefined,
    progress: undefined,
    streak: undefined,
    onContinue: undefined,
  },
  play: async ({ args, canvas, globals }) => {
    const root = canvas.getByRole("region", { name: args.title });
    await waitFor(
      () => {
        expect(root).toHaveAttribute("data-finished");
        finalValues(root, args, globals.dir === "rtl" ? "ar-u-nu-arab" : "en");
        expect(root.querySelector('[data-slot="illustration"]')).toHaveAttribute("data-illustration", "trophy");
        expect(root.querySelector('[data-slot="character"]')).toBeNull();
      },
      { timeout: 1600 },
    );
  },
};

export const Interrupted: Story = {
  // The same earned day as Hop, cut short: the final frame still shows the +1.
  args: { streak: { ...meta.args.streak, gained: true } },
  play: async ({ args, canvas, globals, userEvent }) => {
    args.onContinue?.mockClear();
    await userEvent.click(
      canvas.getByRole("button", { name: globals.dir === "rtl" ? labels.ar.continue : labels.en.continue }),
    );
    await waitFor(() => {
      expect(args.onContinue).toHaveBeenCalledOnce();
      const root = canvas.getByRole("region", { name: args.title });
      expect(root).toHaveAttribute("data-finished");
      finalValues(root, args, globals.dir === "rtl" ? "ar-u-nu-arab" : "en");
    });
  },
};

export const AchievementToast: Story = {
  name: "Achievement toast",
  parameters: { vrt: "page" },
  render: () => (
    <>
      <Button onClick={() => toast.achievement("Weekly goal reached", { timeout: 0 })}>Celebrate a goal</Button>
      <Toaster />
    </>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await body.findByRole("dialog", { name: "Weekly goal reached" });
    await userEvent.keyboard("{F6}{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Weekly goal reached" })).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", { name: "Celebrate a goal" }));
    const notification = await body.findByRole("dialog", { name: "Weekly goal reached" });
    await waitFor(() => {
      expect(notification).toHaveAttribute("data-type", "achievement");
      expect(notification).toHaveClass("bg-sun-tint");
      const art = notification.querySelector('[data-slot="illustration"]');
      expect(art).toHaveAttribute("data-illustration", "trophy");
      expect(art?.getBoundingClientRect().width).toBe(40);
    });
  },
};

export const States: Story = {
  render: (args) => (
    <div className="flex w-full min-w-0 flex-wrap items-start gap-6">
      <Celebration {...args} />
      <Celebration title="Goal reached!" art={<Illustration name="trophy" />} stats={args.stats} />
      <Celebration title="All done!" />
    </div>
  ),
};
