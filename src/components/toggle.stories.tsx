import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Toggle } from "./toggle.tsx";

const meta = {
  title: "Actions/Toggle",
  component: Toggle,
  args: { children: "Remote only", onPressedChange: fn() },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole("button", { name: "Remote only" });
    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "true"));
    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "false"));
  },
};

export const Pressed: Story = { args: { defaultPressed: true } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole("button", { name: "Remote only" });
    await waitFor(() => expect(toggle).toBeDisabled());
    await userEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute("aria-pressed", "false");
      expect(args.onPressedChange).not.toHaveBeenCalled();
    });
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle {...args} size="sm">
        Small
      </Toggle>
      <Toggle {...args} size="md">
        Medium
      </Toggle>
      <Toggle {...args} size="lg">
        Large
      </Toggle>
    </div>
  ),
};

/** Unpressed and pressed faces in every interaction state, drawn statically for screenshots. */
export const States: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {([false, true] as const).map((pressed) => (
        <div key={String(pressed)} className="grid gap-3">
          <p className="text-label font-bold">{pressed ? "Pressed" : "Unpressed"}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Toggle {...args} defaultPressed={pressed}>
              Rest
            </Toggle>
            <Toggle {...args} defaultPressed={pressed} data-demo="hover">
              Hover
            </Toggle>
            <Toggle {...args} defaultPressed={pressed} data-demo="focus">
              Focus
            </Toggle>
            <Toggle {...args} defaultPressed={pressed} data-demo="active">
              Active
            </Toggle>
            <Toggle {...args} defaultPressed={pressed} disabled>
              Disabled
            </Toggle>
          </div>
        </div>
      ))}
    </div>
  ),
};
