import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookmarkIcon, CopyIcon, Share2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { Button, type ButtonProps, IconButton } from "./button.tsx";
import {
  Tooltip,
  TooltipPopup,
  type TooltipPopupProps,
  type TooltipProps,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip.tsx";

interface ExampleProps extends TooltipProps, Pick<TooltipPopupProps, "arrow" | "side"> {
  onAction?: ButtonProps["onClick"];
}

function IconTooltip({
  label = "Share",
  icon = <Share2Icon aria-hidden="true" />,
  demo,
  arrow,
  side,
  onAction,
  ...props
}: ExampleProps & { label?: string; icon?: ReactNode; demo?: string }) {
  return (
    <Tooltip {...props}>
      <TooltipTrigger render={<IconButton aria-label={label} onClick={onAction} data-demo={demo} />}>
        {icon}
      </TooltipTrigger>
      <TooltipPopup arrow={arrow} side={side}>
        {label}
      </TooltipPopup>
    </Tooltip>
  );
}

function DisabledApply({ onAction, ...props }: TooltipProps & Pick<ExampleProps, "onAction">) {
  return (
    <div className="flex max-w-xs flex-col items-start gap-3">
      <Tooltip {...props}>
        <TooltipTrigger
          render={<Button disabled focusableWhenDisabled aria-describedby="apply-disabled-reason" onClick={onAction} />}
        >
          Apply
        </TooltipTrigger>
        <TooltipPopup>Finish your profile to apply.</TooltipPopup>
      </Tooltip>
      <p id="apply-disabled-reason" className="m-0 wrap-anywhere text-body-sm text-ink-muted">
        Finish your profile to apply.
      </p>
    </div>
  );
}

// Base UI tooltips are visual labels with no tooltip role; the trigger carries the name.
const tooltip = () => document.querySelector<HTMLElement>("[data-slot=tooltip-popup]");

const meta = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  subcomponents: { TooltipProvider, TooltipTrigger, TooltipPopup },
  args: { onOpenChange: fn(), onAction: fn() },
  render: (args) => <IconTooltip {...args} />,
} satisfies Meta<ExampleProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IconButtonStory: Story = {
  name: "Icon button",
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Share" });
    if (matchMedia("(hover: hover)").matches) {
      await userEvent.hover(button);
      expect(tooltip()).not.toBeInTheDocument();
      await waitFor(
        () => {
          const popup = tooltip();
          expect(popup).toBeVisible();
          expect(popup).toHaveTextContent("Share");
        },
        { timeout: 2000 },
      );
      await userEvent.unhover(button);
      await waitFor(() => expect(tooltip()).not.toBeInTheDocument());
    }
    await userEvent.tab();
    await waitFor(() => {
      expect(button).toHaveFocus();
      expect(button).toHaveAccessibleName("Share");
      expect(tooltip()).toBeVisible();
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(tooltip()).not.toBeInTheDocument());
    await userEvent.tab();
    if (matchMedia("(pointer: coarse)").matches) {
      await userEvent.pointer({ keys: "[TouchA]", target: button });
      await waitFor(() => expect(tooltip()).not.toBeInTheDocument());
    }
  },
};

export const InstantBetweenTriggers: Story = {
  name: "Instant between triggers",
  render: (args) => (
    <TooltipProvider>
      <div className="flex flex-wrap gap-4">
        <IconTooltip {...args} />
        <IconTooltip {...args} label="Copy link" icon={<CopyIcon aria-hidden="true" />} />
        <IconTooltip {...args} label="Save" icon={<BookmarkIcon aria-hidden="true" />} />
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const first = canvas.getByRole("button", { name: "Share" });
    const next = canvas.getByRole("button", { name: "Copy link" });
    const body = within(canvasElement.ownerDocument.body);
    const hover = matchMedia("(hover: hover)").matches;
    if (hover) await userEvent.hover(first);
    else await userEvent.tab();
    await waitFor(
      () => {
        const popup = tooltip();
        expect(popup).toBeVisible();
        expect(popup).toHaveTextContent("Share");
      },
      { timeout: 2000 },
    );
    if (hover) {
      await userEvent.unhover(first);
      await userEvent.hover(next);
    } else await userEvent.tab();
    await waitFor(() => {
      const popup = body.getByText("Copy link").closest('[data-slot="tooltip-popup"]');
      expect(popup).toBeVisible();
      expect(popup).toHaveAttribute("data-instant");
      expect(body.queryByText("Share")).not.toBeInTheDocument();
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(tooltip()).not.toBeInTheDocument());
  },
};

export const DisabledReason: Story = {
  name: "Disabled reason",
  render: ({ onAction, onOpenChange }) => <DisabledApply onAction={onAction} onOpenChange={onOpenChange} />,
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Apply" });
    await userEvent.tab();
    await waitFor(() => {
      expect(button).toHaveFocus();
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toHaveAccessibleDescription("Finish your profile to apply.");
      expect(canvas.getByText("Finish your profile to apply.")).toBeVisible();
    });
    await userEvent.keyboard("{Enter} ");
    await userEvent.click(button);
    await waitFor(() => expect(args.onAction).not.toHaveBeenCalled());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(tooltip()).not.toBeInTheDocument());
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Share" });
    if (matchMedia("(hover: hover)").matches) await userEvent.hover(button);
    await userEvent.tab();
    await userEvent.click(button);
    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(args.onAction).toHaveBeenCalledOnce();
      expect(args.onOpenChange).not.toHaveBeenCalled();
      expect(tooltip()).not.toBeInTheDocument();
    });
  },
};

export const Open: Story = {
  args: { open: true, arrow: true },
  parameters: { vrt: "page" },
  render: (args) => (
    <div className="flex min-h-64 items-center justify-center">
      <IconTooltip {...args} />
    </div>
  ),
};

export const States: Story = {
  parameters: { vrt: "page" },
  render: (args) => (
    <div className="flex w-full flex-wrap items-start gap-8">
      {[
        { label: "Rest" },
        { label: "Hover", demo: "hover" },
        { label: "Pressed", demo: "active" },
        { label: "Keyboard focus", demo: "focus" },
        { label: "Tooltip disabled", disabled: true },
        { label: "Open", open: true, arrow: true },
      ].map(({ label, ...state }) => (
        <div key={label} className="flex min-h-48 flex-col items-start gap-4">
          <p className="m-0 text-label font-bold">{label}</p>
          <IconTooltip {...args} {...state} side="bottom" />
        </div>
      ))}
      <DisabledApply onAction={args.onAction} />
    </div>
  ),
};
