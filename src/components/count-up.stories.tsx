"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, waitFor } from "storybook/test";
import { Button } from "./button.tsx";
import { CountUp, type CountUpProps } from "./count-up.tsx";

const meta = {
  title: "Delight/CountUp",
  component: CountUp,
  args: { value: 12, className: "font-display text-headline font-bold text-ink" },
} satisfies Meta<typeof CountUp>;

export default meta;
type Story = StoryObj<typeof meta>;

function UpdatingCount(args: CountUpProps) {
  const [value, setValue] = useState(args.value);
  return (
    <div className="grid min-w-0 justify-items-start gap-4">
      <CountUp {...args} value={value} />
      <Button onClick={() => setValue((current) => current + 5)}>Add 5</Button>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <UpdatingCount {...args} />,
  play: async ({ args, canvas, canvasElement, globals, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Add 5" });
    const digits = canvasElement.querySelector('[data-slot="count-up-value"]');
    const format = new Intl.NumberFormat(globals.dir === "rtl" ? "ar-u-nu-arab" : "en", args.format);
    await userEvent.tab();
    await waitFor(() => expect(button).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(digits).toHaveTextContent(format.format(args.value + 5)));
    await userEvent.click(button);
    await waitFor(() => expect(digits).toHaveTextContent(format.format(args.value + 10)));
  },
};

export const Percent: Story = {
  args: { value: 0.8, format: { style: "percent" } },
  play: async ({ args, canvasElement, globals }) => {
    const expected = new Intl.NumberFormat(globals.dir === "rtl" ? "ar-u-nu-arab" : "en", args.format).format(
      args.value,
    );
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-slot="count-up-value"]')).toHaveTextContent(expected),
    );
  },
};

export const States: Story = {
  render: (args) => (
    <div className="flex min-w-0 flex-wrap items-start gap-6">
      {[
        { label: "Counting up", value: 12, from: 0 },
        { label: "Counting down", value: 3, from: 12 },
        { label: "Immediate", value: 12, duration: 0 },
        { label: "Zero", value: 0 },
        { label: "Percent", value: 0.8, format: { style: "percent" } as const },
      ].map(({ label, ...state }) => (
        <div key={label} className="grid min-w-0 gap-2">
          <p className="wrap-anywhere text-label font-bold text-ink-muted">{label}</p>
          <CountUp {...args} {...state} />
        </div>
      ))}
    </div>
  ),
};
