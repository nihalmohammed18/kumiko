"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { formatLabel, labels } from "../labels.ts";
import { useKumiko } from "../provider.tsx";
import { ProgressSteps, type ProgressStepsProps } from "./progress-steps.tsx";

function LocalizedSteps(args: ProgressStepsProps) {
  const { locale, labels } = useKumiko();
  return (
    <ProgressSteps
      {...args}
      stepCompleted={args.stepCompleted ?? formatLabel(labels.stepCompleted, locale)}
      stepUpcoming={args.stepUpcoming ?? formatLabel(labels.stepUpcoming, locale)}
    />
  );
}

const meta = {
  title: "Feedback/ProgressSteps",
  component: ProgressSteps,
  args: { steps: ["Profile", "Preferences", "Review"], current: 1, "aria-label": "Application steps" },
  render: (args) => <LocalizedSteps {...args} className="w-full max-w-sm" />,
} satisfies Meta<typeof ProgressSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const list = canvas.getByRole("list", { name: "Application steps" });
    const steps = within(list).getAllByRole("listitem");
    const words = labels[globals.dir === "rtl" ? "ar" : "en"];
    await waitFor(() => {
      expect(steps).toHaveLength(3);
      expect(steps[1]).toHaveAttribute("aria-current", "step");
      expect(steps[0]).not.toHaveAttribute("aria-current");
      expect(steps[2]).not.toHaveAttribute("aria-current");
      expect(within(steps[0]!).getByText(`Profile, ${words.stepCompleted}`)).toHaveClass("sr-only");
      expect(within(steps[2]!).getByText(`Review, ${words.stepUpcoming}`)).toHaveClass("sr-only");
    });
  },
};

export const First: Story = { args: { current: 0 } };
export const Last: Story = { args: { current: 2 } };

export const States: Story = {
  render: (args) => (
    <div className="@container w-full max-w-3xl">
      <div className="grid gap-4 @sm:grid-cols-3">
        {[0, 1, 2].map((current) => (
          <LocalizedSteps key={current} {...args} current={current} aria-label={`Flow at step ${current + 1}`} />
        ))}
      </div>
    </div>
  ),
};
