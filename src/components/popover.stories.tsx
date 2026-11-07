import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { InfoIcon } from "../icons.tsx";
import { labels } from "../labels.ts";
import { IconButton } from "./button.tsx";
import {
  Popover,
  PopoverClose,
  PopoverDescription,
  PopoverPopup,
  type PopoverPopupProps,
  type PopoverProps,
  PopoverTitle,
  PopoverTrigger,
} from "./popover.tsx";

interface ExampleProps extends PopoverProps, Pick<PopoverPopupProps, "arrow" | "side" | "align"> {
  disabled?: boolean;
  demo?: string;
  label?: string;
}

function SalaryDetails({ arrow, side, align, disabled, demo, label = "Salary details", ...props }: ExampleProps) {
  return (
    <Popover {...props}>
      <PopoverTrigger disabled={disabled} data-demo={demo}>
        {label}
      </PopoverTrigger>
      <PopoverPopup arrow={arrow} side={side} align={align}>
        <PopoverTitle>Salary details</PopoverTitle>
        <PopoverDescription>
          The listed range is base salary. Equity and benefits are offered separately.
        </PopoverDescription>
        <PopoverClose className="mt-4" />
      </PopoverPopup>
    </Popover>
  );
}

const meta = {
  title: "Overlays/Popover",
  component: Popover,
  subcomponents: { PopoverTrigger, PopoverPopup, PopoverTitle, PopoverDescription, PopoverClose },
  args: { onOpenChange: fn() },
  render: (args) => <SalaryDetails {...args} />,
} satisfies Meta<ExampleProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, globals, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Salary details" });
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    await userEvent.click(trigger);
    await waitFor(() => {
      const popup = body.getByRole("dialog", { name: "Salary details" });
      expect(popup).toBeVisible();
      expect(popup).toHaveAccessibleDescription(/base salary/);
      expect(popup.contains(document.activeElement)).toBe(true);
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(body.queryByRole("dialog")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
      expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "escape-key" }));
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
    await userEvent.click(body.getByRole("button", { name: labels[globals.dir === "rtl" ? "ar" : "en"].close }));
    await waitFor(() => {
      expect(body.queryByRole("dialog")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
      expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "close-press" }));
    });
  },
};

export const WithArrow: Story = {
  name: "With arrow",
  parameters: { vrt: "page" },
  render: (args) => (
    <div className="grid w-full max-w-4xl grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] gap-8">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <div key={side} className="flex min-h-64 items-center justify-center">
          <Popover {...args} open>
            <PopoverTrigger>{side}</PopoverTrigger>
            <PopoverPopup arrow side={side}>
              <PopoverTitle>{side} arrow</PopoverTitle>
            </PopoverPopup>
          </Popover>
        </div>
      ))}
    </div>
  ),
};

export const OpenOnHover: Story = {
  name: "Open on hover",
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger openOnHover render={<IconButton aria-label="About salary" />}>
        <InfoIcon />
      </PopoverTrigger>
      <PopoverPopup arrow>
        <PopoverTitle>Salary details</PopoverTitle>
        <PopoverDescription>The range is base salary before equity and benefits.</PopoverDescription>
        <PopoverClose className="mt-4" />
      </PopoverPopup>
    </Popover>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "About salary" });
    const body = within(canvasElement.ownerDocument.body);
    if (matchMedia("(hover: hover)").matches) {
      await userEvent.hover(trigger);
      await waitFor(() => expect(body.getByRole("dialog", { name: "Salary details" })).toBeVisible());
      await userEvent.unhover(trigger);
      await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    }
    // Clicking remains available to touch users; keyboard activation opens the same content.
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Salary details" });
    await waitFor(() => expect(trigger).toBeDisabled());
    await userEvent.click(trigger);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(trigger).not.toHaveFocus();
      expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).not.toBeInTheDocument();
      expect(args.onOpenChange).not.toHaveBeenCalled();
    });
  },
};

export const Open: Story = {
  args: { open: true },
  parameters: { vrt: "page" },
  render: (args) => (
    <div className="flex min-h-64 items-center justify-center">
      <SalaryDetails {...args} />
    </div>
  ),
};

export const States: Story = {
  parameters: { vrt: "page" },
  render: (args) => (
    <div className="grid w-full max-w-4xl grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-8">
      {[
        { label: "Rest" },
        { label: "Hover", demo: "hover" },
        { label: "Pressed", demo: "active" },
        { label: "Keyboard focus", demo: "focus" },
        { label: "Disabled", disabled: true },
        { label: "Open", open: true, arrow: true },
      ].map((state) => (
        <div key={state.label} className="min-h-64">
          <SalaryDetails {...args} {...state} />
        </div>
      ))}
    </div>
  ),
};
