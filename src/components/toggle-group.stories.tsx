import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Toggle } from "./toggle.tsx";
import { ToggleGroup } from "./toggle-group.tsx";

const meta = {
  title: "Actions/ToggleGroup",
  component: ToggleGroup,
  args: { "aria-label": "Calendar period", defaultValue: ["week"], onValueChange: fn() },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <Toggle value="day">Day</Toggle>
      <Toggle value="week">Week</Toggle>
      <Toggle value="month">Month</Toggle>
    </ToggleGroup>
  ),
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Segmented: Story = {};

export const StaysSelected: Story = {
  name: "Stays selected",
  play: async ({ args, canvas, userEvent }) => {
    const week = canvas.getByRole("button", { name: "Week" });
    const month = canvas.getByRole("button", { name: "Month" });
    await waitFor(() => expect(week).toHaveAttribute("aria-pressed", "true"));
    await userEvent.click(week);
    await waitFor(() => {
      expect(week).toHaveAttribute("aria-pressed", "true");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
    await userEvent.click(month);
    await waitFor(() => {
      expect(month).toHaveAttribute("aria-pressed", "true");
      expect(week).toHaveAttribute("aria-pressed", "false");
      expect(args.onValueChange).toHaveBeenCalledOnce();
      expect(args.onValueChange).toHaveBeenCalledWith(["month"], expect.anything());
    });
  },
};

export const Multiple: Story = {
  args: { multiple: true, defaultValue: [], "aria-label": "Text formatting" },
  render: (args) => (
    <ToggleGroup {...args}>
      <Toggle value="bold">Bold</Toggle>
      <Toggle value="italic">Italic</Toggle>
      <Toggle value="underline">Underline</Toggle>
    </ToggleGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });
    await userEvent.click(bold);
    await userEvent.click(italic);
    await waitFor(() => {
      expect(bold).toHaveAttribute("aria-pressed", "true");
      expect(italic).toHaveAttribute("aria-pressed", "true");
    });
    // Multiple selection may be cleared completely.
    await userEvent.click(bold);
    await userEvent.click(italic);
    await waitFor(() => {
      expect(bold).toHaveAttribute("aria-pressed", "false");
      expect(italic).toHaveAttribute("aria-pressed", "false");
    });
  },
};

export const Keyboard: Story = {
  // Base UI initially tabs to the first enabled item.
  args: { defaultValue: ["day"] },
  play: async ({ canvas, globals, userEvent }) => {
    const day = canvas.getByRole("button", { name: "Day" });
    const week = canvas.getByRole("button", { name: "Week" });
    await userEvent.tab();
    await waitFor(() => {
      expect(day).toHaveFocus();
      expect(day).toHaveAttribute("aria-pressed", "true");
    });
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() => {
      expect(week).toHaveFocus();
      expect(week).toHaveAttribute("aria-pressed", "false");
    });
    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(week).toHaveAttribute("aria-pressed", "true");
      expect(day).toHaveAttribute("aria-pressed", "false");
    });
  },
};

export const DisabledItem: Story = {
  name: "Disabled item",
  render: (args) => (
    <ToggleGroup {...args}>
      <Toggle value="day">Day</Toggle>
      <Toggle value="week">Week</Toggle>
      <Toggle value="month" disabled>
        Month
      </Toggle>
    </ToggleGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const month = canvas.getByRole("button", { name: "Month" });
    await waitFor(() => expect(month).toBeDisabled());
    await userEvent.click(month);
    await waitFor(() => {
      expect(month).toHaveAttribute("aria-pressed", "false");
      expect(canvas.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  },
};

/** Segments together in every interaction state, including a disabled group and a vertical tray. */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-4">
      {(["rest", "hover", "focus", "active", "disabled"] as const).map((state) => (
        <div key={state} className="grid gap-3">
          <p className="text-label font-bold">{state}</p>
          <ToggleGroup {...args} aria-label={`${state} calendar periods`} disabled={state === "disabled"}>
            <Toggle value="day" data-demo={state}>
              Day
            </Toggle>
            <Toggle value="week" data-demo={state}>
              Week
            </Toggle>
            <Toggle value="month" data-demo={state}>
              Month
            </Toggle>
          </ToggleGroup>
        </div>
      ))}
      <div className="grid gap-3">
        <p className="text-label font-bold">Vertical</p>
        <ToggleGroup {...args} aria-label="Vertical calendar periods" orientation="vertical">
          <Toggle value="day">Day</Toggle>
          <Toggle value="week">Week</Toggle>
          <Toggle value="month">Month</Toggle>
        </ToggleGroup>
      </div>
    </div>
  ),
};
