import type { Meta, StoryObj } from "@storybook/react-vite";
import type { MouseEvent } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { Link } from "./link.tsx";

const meta = {
  title: "Navigation/Link",
  component: Link,
  args: {
    href: "#",
    children: "job listings",
    onClick: fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()),
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InASentence: Story = {
  render: (args) => (
    <p className="text-body">
      Find your next role in our <Link {...args} /> and apply when you are ready.
    </p>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const link = canvas.getByRole("link", { name: "job listings" });
    await userEvent.tab();
    await waitFor(() => expect(link).toHaveFocus());
    await waitFor(() => expect(getComputedStyle(link).outlineStyle).toBe("solid"));
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(args.onClick).toHaveBeenCalledOnce());
  },
};

export const Standalone: Story = {
  args: { children: "View all", className: "inline-flex min-h-control min-w-control items-center" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("link", { name: "View all" }));
    await waitFor(() => expect(args.onClick).toHaveBeenCalledOnce());
  },
};

export const NewTab: Story = {
  args: {
    children: "Read the guide",
    target: "_blank",
    className: "inline-flex min-h-control min-w-control items-center",
  },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole("link", { name: "Read the guide" })).toHaveAttribute("rel", "noopener noreferrer"),
    );
  },
};

/** Rest, hover and keyboard focus, drawn statically for screenshots. */
export const States: Story = {
  args: { className: "inline-flex min-h-control min-w-control items-center" },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Link {...args}>Rest</Link>
      <Link {...args} data-demo="hover">
        Hover
      </Link>
      <Link {...args} data-demo="focus">
        Focus
      </Link>
    </div>
  ),
};
