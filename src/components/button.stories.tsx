import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, Plus } from "lucide-react";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { labels } from "../labels.ts";
import { Button, type ButtonProps, IconButton } from "./button.tsx";

const meta = {
  title: "Actions/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
  argTypes: {
    tone: { control: "inline-radio", options: ["primary", "secondary", "strong", "danger", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { tone: "primary" } };
export const Secondary: Story = { args: { tone: "secondary" } };
export const Strong: Story = { args: { tone: "strong" } };
export const Danger: Story = { args: { tone: "danger", children: "Delete job" } };
export const Ghost: Story = { args: { tone: "ghost", children: "Cancel" } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} tone="primary" size="sm">
        Small
      </Button>
      <Button {...args} tone="primary" size="md">
        Medium
      </Button>
      <Button {...args} tone="primary" size="lg">
        Large
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: { tone: "primary" },
  render: (args) => (
    <Button {...args}>
      <Plus aria-hidden /> New job
    </Button>
  ),
};

export const IconOnly: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton {...args} aria-label="Copy link" size="sm">
        <Copy aria-hidden />
      </IconButton>
      <IconButton {...args} aria-label="Copy link" tone="primary">
        <Copy aria-hidden />
      </IconButton>
      <IconButton {...args} aria-label="Copy link" tone="secondary" size="lg">
        <Copy aria-hidden />
      </IconButton>
    </div>
  ),
};

export const LongLabel: Story = {
  args: { children: "Save all changes to this job listing and publish them to the team" },
  render: (args) => (
    <div className="w-48">
      <Button {...args} className="w-full" />
    </div>
  ),
};

/** Hover, keyboard focus and pressed, drawn statically so screenshots catch changes to them. */
export const States: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {(["primary", "secondary", "strong", "danger", "ghost"] as const).map((tone) => (
        <div key={tone} className="grid gap-3">
          <p className="text-label font-bold">{tone}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button {...args} tone={tone}>
              Rest
            </Button>
            <Button {...args} tone={tone} data-demo="hover">
              Hover
            </Button>
            <Button {...args} tone={tone} data-demo="focus">
              Focus
            </Button>
            <Button {...args} tone={tone} data-demo="active">
              Pressed
            </Button>
            <Button {...args} tone={tone} disabled>
              Disabled
            </Button>
            <Button {...args} tone={tone} loading>
              Loading
            </Button>
            <Button {...args} tone={tone} loading loadingLabel="Sending…">
              Send application
            </Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { tone: "primary", disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Save changes" });
    await waitFor(() => expect(button).toBeDisabled());
    await userEvent.click(button);
    await waitFor(() => expect(args.onClick).not.toHaveBeenCalled());
  },
};

export const Loading: Story = {
  args: { tone: "primary", loading: true },
  play: async ({ args, canvas, canvasElement, globals, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Save changes" });
    await waitFor(() => expect(button).toHaveAttribute("aria-busy", "true"));
    await waitFor(() => expect(button).toHaveAccessibleName("Save changes"));
    // Focus stays on a loading button so keyboard users don't lose their place.
    await userEvent.tab();
    await waitFor(() => expect(button).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(args.onClick).not.toHaveBeenCalled());
    const loadingLabel = labels[globals.dir === "rtl" ? "ar" : "en"].loading;
    await waitFor(() =>
      expect(within(canvasElement.ownerDocument.body).getByRole("status")).toHaveTextContent(loadingLabel),
    );
  },
};

function LabelledLoadingButton(props: ButtonProps) {
  const [loading, setLoading] = useState(props.loading ?? false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...props} loading={loading} />
      <Button onClick={() => setLoading((current) => !current)}>Toggle loading</Button>
    </div>
  );
}

export const LoadingWithLabel: Story = {
  name: "Loading with label",
  args: { tone: "primary", children: "Send application", loadingLabel: "Sending your application…" },
  render: (args) => <LabelledLoadingButton {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Send application" });
    const loadingContent = button.querySelector("[data-slot=button-loading-label]");
    await waitFor(() => expect(loadingContent).not.toBeVisible());
    const width = button.getBoundingClientRect().width;
    await userEvent.click(canvas.getByRole("button", { name: "Toggle loading" }));
    await waitFor(() => {
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(loadingContent).toBeVisible();
      expect(button.querySelector("[data-slot=button-label]")).not.toBeVisible();
      expect(button).toHaveAccessibleName("Sending your application…");
      expect(within(canvasElement.ownerDocument.body).getByRole("status")).toHaveTextContent(
        "Sending your application…",
      );
      expect(button.getBoundingClientRect().width).toBe(width);
    });
  },
};

export const ClickRunsAction: Story = {
  args: { tone: "primary" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(args.onClick).toHaveBeenCalledOnce());
  },
};

export const KeyboardRunsAction: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    const button = canvas.getByRole("button", { name: "Save changes" });
    await waitFor(() => expect(button).toHaveFocus());
    // Keyboard focus must draw a ring. (A base "outline-none" once hid it: Tailwind's outline-2 reuses its style.)
    await waitFor(() => expect(getComputedStyle(button).outlineStyle).toBe("solid"));
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(2));
  },
};
