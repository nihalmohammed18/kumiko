import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Switch } from "./switch.tsx";

const meta = {
  title: "Forms/Switch",
  component: Switch,
  args: { children: "Enable notifications", onCheckedChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const control = canvas.getByRole("switch", { name: "Enable notifications" });
    await userEvent.click(canvas.getByText("Enable notifications"));
    await waitFor(() => {
      expect(control).toHaveAttribute("aria-checked", "true");
      expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    });
  },
};

export const Checked: Story = { args: { defaultChecked: true } };

export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const control = canvas.getByRole("switch", { name: "Enable notifications" });
    await userEvent.tab();
    await waitFor(() => expect(control).toHaveFocus());
    await userEvent.keyboard(" ");
    await waitFor(() => expect(control).toHaveAttribute("aria-checked", "true"));
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const control = canvas.getByRole("switch", { name: "Enable notifications" });
    await userEvent.click(control);
    await userEvent.click(canvas.getByText("Enable notifications"));
    await waitFor(() => {
      expect(control).toHaveAttribute("aria-disabled", "true");
      expect(control).toHaveAttribute("aria-checked", "false");
      expect(args.onCheckedChange).not.toHaveBeenCalled();
    });
  },
};

export const ReadOnly: Story = {
  name: "Read only",
  args: { readOnly: true, defaultChecked: true },
  play: async ({ args, canvas, userEvent }) => {
    const control = canvas.getByRole("switch", { name: "Enable notifications" });
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await userEvent.click(canvas.getByText("Enable notifications"));
    await waitFor(() => {
      expect(control).toHaveAttribute("aria-checked", "true");
      expect(args.onCheckedChange).not.toHaveBeenCalled();
    });
  },
};

/** Off and on tracks in every interaction state, including disabled thumbs. */
export const States: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {([false, true] as const).map((checked) => (
        <div key={String(checked)} className="grid gap-3">
          <p className="text-label font-bold">{checked ? "On" : "Off"}</p>
          <div className="flex flex-wrap items-start gap-6">
            {(["rest", "hover", "focus", "active", "disabled"] as const).map((interaction) => (
              <Switch
                {...args}
                key={interaction}
                defaultChecked={checked}
                disabled={interaction === "disabled"}
                data-demo={interaction === "rest" || interaction === "disabled" ? undefined : interaction}
              >
                {interaction}
              </Switch>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
