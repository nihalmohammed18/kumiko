"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, waitFor } from "storybook/test";
import { KumikoProvider } from "../provider.tsx";
import { Button } from "./button.tsx";
import { ProgressRing, type ProgressRingProps } from "./progress-ring.tsx";

const meta = {
  title: "Feedback/ProgressRing",
  component: ProgressRing,
  args: { value: 40, "aria-label": "Weekly applications" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof ProgressRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <ProgressRing key={size} {...args} size={size} aria-label={`${size} weekly applications`} />
      ))}
    </div>
  ),
};

export const Values: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      {[0, 40, 100].map((value) => (
        <ProgressRing key={value} {...args} value={value} aria-label={`${value} percent complete`} />
      ))}
    </div>
  ),
};

export const CustomCentre: Story = {
  name: "Custom centre",
  args: { value: 3, max: 5, children: "3/5", "aria-valuetext": "3 of 5 applications this week" },
  play: async ({ canvas }) => {
    await waitFor(() => {
      expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "3 of 5 applications this week");
      expect(canvas.getByText("3/5")).toBeVisible();
    });
  },
};

export const ArabicDigits: Story = {
  name: "Arabic digits",
  render: (args, { globals }) => (
    <KumikoProvider locale="ar-u-nu-arab" direction={globals.dir === "rtl" ? "rtl" : "ltr"}>
      <div lang="ar">
        <ProgressRing {...args} aria-label="طلبات هذا الأسبوع" />
      </div>
    </KumikoProvider>
  ),
  play: async ({ args, canvas, canvasElement }) => {
    const formatted = new Intl.NumberFormat("ar-u-nu-arab", { style: "percent" }).format(args.value / 100);
    await waitFor(() => {
      expect(canvasElement.querySelector("[data-slot=progress-ring-value]")).toHaveTextContent(formatted);
      expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuetext", formatted);
    });
  },
};

function UpdatingRing(args: ProgressRingProps) {
  const [value, setValue] = useState(args.value);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ProgressRing {...args} value={value} />
      <Button onClick={() => setValue((current) => Math.min(100, current + 20))}>Add progress</Button>
    </div>
  );
}

export const Updating: Story = {
  render: (args) => <UpdatingRing {...args} />,
  play: async ({ canvas, globals, userEvent }) => {
    const ring = canvas.getByRole("progressbar", { name: "Weekly applications" });
    const button = canvas.getByRole("button", { name: "Add progress" });
    await userEvent.tab();
    await waitFor(() => expect(button).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(ring).toHaveAttribute("aria-valuenow", "60"));
    await userEvent.click(button);
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    await waitFor(() => {
      expect(ring).toHaveAttribute("aria-valuenow", "80");
      expect(ring).toHaveAttribute("aria-valuetext", new Intl.NumberFormat(locale, { style: "percent" }).format(0.8));
    });
  },
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <ProgressRing {...args} value={0} aria-label="Not started" />
      <ProgressRing {...args} aria-label="In progress" />
      <ProgressRing {...args} value={100} aria-label="Complete" />
      <ProgressRing {...args} showValue={false} aria-label="Without centre content" />
    </div>
  ),
};
