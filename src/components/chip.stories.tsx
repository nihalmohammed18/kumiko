import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { Chip, ChipGroup } from "./chip.tsx";

const meta = {
  title: "Actions/Chip",
  component: Chip,
  subcomponents: { ChipGroup },
  args: { children: "Remote", onPressedChange: fn() },
  argTypes: { accent: { control: "inline-radio", options: ["brand", "sun", "leaf", "coral", "tide"] } },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const chip = canvas.getByRole("button", { name: "Remote" });
    const check = chip.querySelector('[data-slot="chip-check"]');
    await userEvent.tab();
    await waitFor(() => {
      expect(chip).toHaveFocus();
      expect(chip).toHaveAttribute("aria-pressed", "false");
      expect(check).not.toBeVisible();
    });
    const width = chip.getBoundingClientRect().width;
    await userEvent.click(chip);
    await waitFor(() => {
      expect(chip).toHaveAttribute("aria-pressed", "true");
      expect(check).toBeVisible();
      expect(chip.getBoundingClientRect().width).toBe(width);
      expect(args.onPressedChange).toHaveBeenLastCalledWith(true, expect.anything());
    });
    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(chip).toHaveAttribute("aria-pressed", "false");
      expect(check).not.toBeVisible();
      expect(chip.getBoundingClientRect().width).toBe(width);
    });
  },
};

export const Accents: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(["brand", "sun", "leaf", "coral", "tide"] as const).map((accent) => (
        <Chip {...args} key={accent} accent={accent} defaultPressed>
          {accent === "brand" ? "Brand" : accent.charAt(0).toUpperCase() + accent.slice(1)}
        </Chip>
      ))}
    </div>
  ),
};

const onValueChange = fn();

export const Group: Story = {
  render: function Group() {
    const [value, setValue] = useState<string[]>([]);
    return (
      <ChipGroup
        aria-label="Job filters"
        value={value}
        onValueChange={(nextValue, details) => {
          setValue(nextValue);
          onValueChange(nextValue, details);
        }}
      >
        <Chip value="remote">Remote</Chip>
        <Chip value="paid">Paid</Chip>
        <Chip value="visa">Visa sponsor</Chip>
      </ChipGroup>
    );
  },
  play: async ({ canvas, globals, userEvent }) => {
    const remote = canvas.getByRole("button", { name: "Remote" });
    const paid = canvas.getByRole("button", { name: "Paid" });
    const visa = canvas.getByRole("button", { name: "Visa sponsor" });
    await userEvent.click(remote);
    await userEvent.click(paid);
    await waitFor(() => {
      expect(remote).toHaveAttribute("aria-pressed", "true");
      expect(paid).toHaveAttribute("aria-pressed", "true");
      expect(onValueChange).toHaveBeenLastCalledWith(["remote", "paid"], expect.anything());
    });
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() => {
      expect(visa).toHaveFocus();
      expect(visa).toHaveAttribute("aria-pressed", "false");
    });
    await userEvent.keyboard(" ");
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["remote", "paid", "visa"], expect.anything()));
  },
};

/** Selected and unselected chips in every interaction state. */
export const States: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {[false, true].map((pressed) => (
        <div key={String(pressed)} className="grid gap-3">
          <p className="text-label font-bold">{pressed ? "Pressed" : "Unpressed"}</p>
          <div className="flex flex-wrap gap-3">
            {(["rest", "hover", "focus", "active", "disabled"] as const).map((interaction) => (
              <Chip
                {...args}
                key={interaction}
                defaultPressed={pressed}
                disabled={interaction === "disabled"}
                data-demo={interaction === "rest" || interaction === "disabled" ? undefined : interaction}
              >
                {interaction.charAt(0).toUpperCase() + interaction.slice(1)}
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const disabled = canvas.getAllByRole("button", { name: "Disabled" })[1];
    await waitFor(() => expect(disabled).toBeDisabled());
    await userEvent.click(disabled!);
    await waitFor(() => {
      expect(disabled).toHaveAttribute("aria-pressed", "true");
      expect(disabled?.querySelector('[data-slot="chip-check"]')).toBeVisible();
      expect(args.onPressedChange).not.toHaveBeenCalled();
    });
  },
};
