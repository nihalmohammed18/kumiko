import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, Plus, Trash2 } from "lucide-react";
import { expect, fn } from "storybook/test";
import { Button, IconButton } from "./button.tsx";

const meta = {
  title: "Actions/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "outline", "ghost", "danger", "link"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary">
        Publish job
      </Button>
      <Button {...args} variant="secondary">
        Save draft
      </Button>
      <Button {...args} variant="outline">
        Export
      </Button>
      <Button {...args} variant="ghost">
        Cancel
      </Button>
      <Button {...args} variant="danger">
        <Trash2 aria-hidden /> Delete
      </Button>
      <Button {...args} variant="link">
        View all
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary" size="sm">
        Small
      </Button>
      <Button {...args} variant="primary" size="md">
        Medium
      </Button>
      <Button {...args} variant="primary" size="lg">
        Large
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: { variant: "primary" },
  render: (args) => (
    <Button {...args}>
      <Plus aria-hidden /> New job
    </Button>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Copy link" size="sm">
        <Copy aria-hidden />
      </IconButton>
      <IconButton aria-label="Copy link" variant="outline">
        <Copy aria-hidden />
      </IconButton>
      <IconButton aria-label="Copy link" variant="secondary" size="lg">
        <Copy aria-hidden />
      </IconButton>
    </div>
  ),
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Save changes" });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: { variant: "primary", loading: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Save changes" });
    await expect(button).toHaveAttribute("aria-busy", "true");
    // Focus stays on a loading button so keyboard users don't lose their place.
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const ClickRunsAction: Story = {
  args: { variant: "primary" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const KeyboardRunsAction: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Save changes" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
