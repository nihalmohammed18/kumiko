import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, waitFor } from "storybook/test";
import { KumikoProvider } from "../provider.tsx";
import { Button } from "./button.tsx";
import { Progress, type ProgressProps } from "./progress.tsx";

const meta = {
  title: "Feedback/Progress",
  component: Progress,
  args: { value: 40, label: "Profile complete", className: "w-full max-w-sm" },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole("progressbar", { name: "Profile complete" })).toHaveAttribute("aria-valuenow", "40"),
    );
  },
};

export const Values: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-6">
      {[0, 25, 100].map((value) => (
        <Progress {...args} key={value} value={value} />
      ))}
    </div>
  ),
};

export const ArabicDigits: Story = {
  name: "Arabic digits",
  render: (args, { globals }) => (
    <KumikoProvider locale="ar-u-nu-arab" direction={globals.dir === "rtl" ? "rtl" : "ltr"}>
      <Progress {...args} />
    </KumikoProvider>
  ),
  play: async ({ canvas }) => {
    const value = new Intl.NumberFormat("ar-u-nu-arab", { style: "percent" }).format(0.4);
    await waitFor(() => {
      expect(canvas.getByText(value)).toBeVisible();
      expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuetext", value);
    });
  },
};

function UpdatingProgress(args: ProgressProps) {
  const [value, setValue] = useState(args.value);
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Progress {...args} value={value} />
      <Button className="justify-self-start" onClick={() => setValue((current) => Math.min(100, current + 20))}>
        Add 20
      </Button>
    </div>
  );
}

export const Updating: Story = {
  render: (args) => <UpdatingProgress {...args} />,
  play: async ({ canvas, userEvent, globals }) => {
    const progress = canvas.getByRole("progressbar");
    const format = new Intl.NumberFormat(globals.dir === "rtl" ? "ar-u-nu-arab" : "en", { style: "percent" });
    await userEvent.click(canvas.getByRole("button", { name: "Add 20" }));
    await waitFor(() => {
      expect(progress).toHaveAttribute("aria-valuenow", "60");
      expect(canvas.getByText(format.format(0.6))).toBeVisible();
    });
    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(progress).toHaveAttribute("aria-valuenow", "80");
      expect(canvas.getByText(format.format(0.8))).toBeVisible();
    });
  },
};

export const WithoutLabel: Story = {
  name: "Without visible label",
  args: { label: undefined, "aria-label": "Profile complete", showValue: false },
};

export const States: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-6">
      <Progress {...args} label="Starting" value={0} />
      <Progress {...args} label="In progress" value={40} />
      <Progress {...args} label="Complete" value={100} />
      <Progress {...args} label="Value hidden" showValue={false} />
    </div>
  ),
};
