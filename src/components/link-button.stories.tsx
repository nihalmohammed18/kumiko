import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, MouseEvent } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { LinkButton } from "./link-button.tsx";

const tones = ["primary", "secondary", "strong", "danger", "ghost"] as const;

function FakeRouterLink(props: ComponentProps<"a">) {
  return <a data-router {...props} />;
}

const meta = {
  title: "Navigation/LinkButton",
  component: LinkButton,
  args: {
    href: "#",
    children: "Browse jobs",
    onClick: fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()),
  },
  argTypes: {
    tone: { control: "inline-radio", options: tones },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {tones.map((tone) => (
        <LinkButton key={tone} {...args} tone={tone}>
          {tone}
        </LinkButton>
      ))}
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("link", { name: "secondary" }));
    await waitFor(() => expect(args.onClick).toHaveBeenCalledOnce());
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <LinkButton {...args} size="sm">
        Small
      </LinkButton>
      <LinkButton {...args} size="md">
        Medium
      </LinkButton>
      <LinkButton {...args} size="lg">
        Large
      </LinkButton>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <LinkButton {...args}>
      Browse jobs <ArrowRight aria-hidden className="rtl:rotate-180" />
    </LinkButton>
  ),
};

export const FrameworkLink: Story = {
  args: { tone: "primary" },
  render: (args) => <LinkButton {...args} render={<FakeRouterLink href="#" className="w-fit" />} />,
  play: async ({ args, canvas, userEvent }) => {
    const link = canvas.getByRole("link", { name: "Browse jobs" });
    await waitFor(() => {
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("data-router");
      expect(link).toHaveAttribute("data-slot", "link-button");
      expect(link).toHaveClass("press", "press-primary", "min-h-control", "w-fit");
    });
    await userEvent.tab();
    await waitFor(() => expect(link).toHaveFocus());
    await waitFor(() => expect(getComputedStyle(link).outlineStyle).toBe("solid"));
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(args.onClick).toHaveBeenCalledOnce());
  },
};

/** Rest, hover, keyboard focus and press for every tone, drawn statically for screenshots. */
export const States: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {tones.map((tone) => (
        <div key={tone} className="grid gap-3">
          <p className="text-label font-bold">{tone}</p>
          <div className="flex flex-wrap items-center gap-3">
            <LinkButton {...args} tone={tone}>
              Rest
            </LinkButton>
            <LinkButton {...args} tone={tone} data-demo="hover">
              Hover
            </LinkButton>
            <LinkButton {...args} tone={tone} data-demo="focus">
              Focus
            </LinkButton>
            <LinkButton {...args} tone={tone} data-demo="active">
              Pressed
            </LinkButton>
          </div>
        </div>
      ))}
    </div>
  ),
};
