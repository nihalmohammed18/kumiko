import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { commands } from "vitest/browser";
import { Button } from "./button.tsx";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogPopup,
  type DialogPopupProps,
  type DialogProps,
  DialogTitle,
  DialogTrigger,
} from "./dialog.tsx";
import { Field, FieldError, FieldLabel } from "./field.tsx";
import { Form } from "./form.tsx";
import { Input } from "./input.tsx";

interface DemoProps extends DialogProps {
  size?: DialogPopupProps["size"];
  disabled?: boolean;
  demo?: string;
  triggerLabel?: string;
}

function EditAlert({ size, disabled, demo, triggerLabel = "Edit job alert", ...props }: DemoProps) {
  return (
    <Dialog {...props}>
      <DialogTrigger disabled={disabled} data-demo={demo}>
        {triggerLabel}
      </DialogTrigger>
      <DialogPopup size={size}>
        <DialogTitle>Edit job alert</DialogTitle>
        <DialogDescription>Choose a name that helps you recognize matching opportunities.</DialogDescription>
        <DialogBody>
          <Field name="alertName">
            <FieldLabel>Alert name</FieldLabel>
            <Input defaultValue="Remote product design" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <DialogClose tone="primary">Save</DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

const meta = {
  title: "Overlays/Dialog",
  component: Dialog,
  subcomponents: { DialogTrigger, DialogPopup, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose },
  args: { onOpenChange: fn() },
  render: (args) => <EditAlert {...args} />,
} satisfies Meta<DemoProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Edit job alert" });
    await userEvent.click(trigger);
    await waitFor(() => {
      const popup = body.getByRole("dialog", { name: "Edit job alert" });
      expect(popup).toBeVisible();
      expect(popup.contains(document.activeElement)).toBe(true);
    });
    const popup = body.getByRole("dialog");
    const close = within(popup).getByRole("button", { name: globals.dir === "rtl" ? "إغلاق" : "Close" });
    close.focus();
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(within(popup).getByRole("button", { name: "Save" })).toHaveFocus());
    await userEvent.tab();
    await waitFor(() => expect(close).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.querySelector("[data-slot=dialog-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
    });
  },
};

const guide = Array.from({ length: 20 }, (_, index) => ({
  title: `Matching step ${index + 1}`,
  body: "Choose roles that match your experience, preferred working hours and location. Review the team's expectations before applying, and keep a note of the opportunities you want to revisit.",
}));

export const LongContent: Story = {
  name: "Long content",
  render: (args) => (
    <div className="min-h-[120rem]" data-testid="page-position">
      <Dialog {...args}>
        <DialogTrigger>Read alert guidance</DialogTrigger>
        <DialogPopup size="lg">
          <DialogTitle>Job alert guide</DialogTitle>
          <DialogDescription>Review each step without losing your place on the page.</DialogDescription>
          <DialogBody>
            {guide.map((section) => (
              <section key={section.title} className="mb-4">
                <h3 className="font-bold">{section.title}</h3>
                <p>{section.body}</p>
              </section>
            ))}
          </DialogBody>
          <DialogFooter>
            <DialogClose>Done</DialogClose>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const window = document.defaultView!;
    const before = canvas.getByTestId("page-position").getBoundingClientRect();
    const pageTop = window.scrollY;
    expect(document.documentElement.scrollHeight).toBeGreaterThan(window.innerHeight);
    await userEvent.click(canvas.getByRole("button", { name: "Read alert guidance" }));
    await waitFor(() => {
      const popup = within(document.body).getByRole("dialog");
      expect(popup).toBeVisible();
      expect(popup.getAnimations().filter((animation) => animation.playState === "running")).toHaveLength(0);
      expect(
        [document.documentElement, document.body].some((node) => /hidden|clip/.test(getComputedStyle(node).overflowY)),
      ).toBe(true);
    });
    const title = document.querySelector<HTMLElement>("[data-slot=dialog-title]")!;
    const footer = document.querySelector<HTMLElement>("[data-slot=dialog-footer]")!;
    const titleTop = title.getBoundingClientRect().top;
    const footerTop = footer.getBoundingClientRect().top;
    await commands.uxWheel("[data-slot=dialog-body]", 700);
    await waitFor(() => expect(document.querySelector("[data-slot=dialog-body]")!.scrollTop).toBeGreaterThan(0));
    await commands.uxWheel("[data-slot=dialog-viewport]", 700);
    await waitFor(() => {
      expect(window.scrollY).toBe(pageTop);
      expect(title.getBoundingClientRect().top).toBeCloseTo(titleTop);
      expect(footer.getBoundingClientRect().top).toBeCloseTo(footerTop);
      const after = canvas.getByTestId("page-position").getBoundingClientRect();
      expect(after.x).toBeCloseTo(before.x);
      expect(after.width).toBeCloseTo(before.width);
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector("[data-slot=dialog-popup]")).toBeNull());
  },
};

export const Nested: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger>Open parent</DialogTrigger>
      <DialogPopup>
        <DialogTitle>Parent dialog</DialogTitle>
        <DialogDescription>A second task can keep this one open underneath.</DialogDescription>
        <DialogBody>
          <Dialog>
            <DialogTrigger>Open child</DialogTrigger>
            <DialogPopup size="sm">
              <DialogTitle>Child dialog</DialogTitle>
              <DialogDescription>Escape returns to the parent task.</DialogDescription>
              <DialogBody>Only this top dialog is interactive.</DialogBody>
              <DialogFooter>
                <DialogClose>Back to parent</DialogClose>
              </DialogFooter>
            </DialogPopup>
          </Dialog>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Done</DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Open parent" }));
    await waitFor(() => expect(body.getByRole("dialog", { name: "Parent dialog" })).toBeVisible());
    const parent = body.getByRole("dialog", { name: "Parent dialog" });
    const childTrigger = within(parent).getByRole("button", { name: "Open child" });
    await userEvent.click(childTrigger);
    await waitFor(() => {
      expect(body.getByRole("dialog", { name: "Child dialog" })).toBeVisible();
      expect(parent).toHaveAttribute("data-nested-dialog-open");
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.querySelectorAll("[data-slot=dialog-popup]")).toHaveLength(1);
      expect(body.getByRole("dialog", { name: "Parent dialog" })).toBeVisible();
      expect(childTrigger).toHaveFocus();
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector("[data-slot=dialog-popup]")).toBeNull());
  },
};

export const CloseButton: Story = {
  name: "Close button",
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const trigger = canvas.getByRole("button", { name: "Edit job alert" });
    await userEvent.click(trigger);
    await waitFor(() => expect(within(document.body).getByRole("dialog")).toBeVisible());
    await userEvent.click(
      within(document.body).getByRole("button", { name: globals.dir === "rtl" ? "إغلاق" : "Close" }),
    );
    await waitFor(() => {
      expect(document.querySelector("[data-slot=dialog-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
    });
  },
};

function IslandDialog(props: DemoProps) {
  const container = useRef<HTMLDivElement>(null);
  // Forced-colours axe reads authored colours; the system theme takes over this island in that project.
  const forced = matchMedia("(forced-colors: active)").matches;
  return (
    <div
      ref={container}
      data-testid="island"
      data-theme={forced ? undefined : "dark"}
      className="rounded-card border-2 border-line bg-surface p-6 text-ink"
    >
      <Dialog {...props}>
        <DialogTrigger>Open island dialog</DialogTrigger>
        <DialogPopup container={container}>
          <DialogTitle>Themed island</DialogTitle>
          <DialogDescription>This portal inherits the panel's theme.</DialogDescription>
          <DialogBody>The surrounding page keeps its own theme.</DialogBody>
          <DialogFooter>
            <DialogClose>Done</DialogClose>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}

export const Island: Story = {
  globals: { theme: "light" },
  render: (args) => <IslandDialog {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const panel = canvas.getByTestId("island");
    await userEvent.click(canvas.getByRole("button", { name: "Open island dialog" }));
    await waitFor(() => {
      const popup = within(document.body).getByRole("dialog");
      expect(panel).toContainElement(popup);
      expect(getComputedStyle(popup).backgroundColor).toBe(getComputedStyle(panel).backgroundColor);
      if (!matchMedia("(forced-colors: active)").matches) expect(getComputedStyle(popup).colorScheme).toBe("dark");
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector("[data-slot=dialog-popup]")).toBeNull());
  },
};

export const Phone: Story = {
  args: { open: true },
  parameters: { vrt: "page" },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger>Edit translated alert</DialogTrigger>
      <DialogPopup>
        <DialogTitle>Keep matching opportunities in one easy-to-recognize job alert</DialogTitle>
        <DialogDescription>Long translations wrap within the available space.</DialogDescription>
        <DialogBody>
          <p>RemoteProductDesignOpportunitiesAcrossAllTeamsAndTimeZonesWithoutAbbreviations</p>
          <p lang="ar">فرص العمل عن بُعد مع تفاصيل جميع الفرق والمشروعات خلال الفترة المحددة</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Keep editing this alert</DialogClose>
          <DialogClose tone="primary">Save all matching opportunities</DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const document = canvasElement.ownerDocument;
    await waitFor(() => {
      expect(within(document.body).getByRole("dialog")).toBeVisible();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
      if (document.documentElement.clientWidth <= 320) {
        const footer = document.querySelector<HTMLElement>("[data-slot=dialog-footer]")!;
        const buttons = within(footer).getAllByRole("button");
        expect(buttons[0]!.getBoundingClientRect().width).toBeCloseTo(footer.getBoundingClientRect().width);
        expect(buttons[1]!.getBoundingClientRect().top).toBeGreaterThan(buttons[0]!.getBoundingClientRect().bottom);
      }
    });
  },
};

export const Open: Story = { args: { open: true }, parameters: { vrt: "page" } };
export const Small: Story = { args: { open: true, size: "sm" }, parameters: { vrt: "page" } };
export const Large: Story = { args: { open: true, size: "lg" }, parameters: { vrt: "page" } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Edit job alert" });
    await waitFor(() => expect(trigger).toBeDisabled());
    await userEvent.click(trigger);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(trigger).not.toHaveFocus();
      expect(canvasElement.ownerDocument.querySelector("[data-slot=dialog-popup]")).toBeNull();
      expect(args.onOpenChange).not.toHaveBeenCalled();
    });
  },
};

function ValidatedDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>Create job alert</DialogTrigger>
      <DialogPopup>
        <DialogTitle>Create job alert</DialogTitle>
        <DialogDescription>An alert needs a name before it can be saved.</DialogDescription>
        <Form
          className="flex min-h-0 flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <DialogBody>
            <Field name="alertName">
              <FieldLabel>Alert name</FieldLabel>
              <Input required />
              <FieldError>Name your alert.</FieldError>
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button type="submit" tone="primary">
              Save
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  );
}

export const Invalid: Story = {
  render: () => <ValidatedDialog />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Create job alert" }));
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
    await userEvent.click(body.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(body.getByRole("dialog")).toHaveAttribute("data-open");
      expect(body.getByRole("textbox", { name: "Alert name" })).toHaveAttribute("aria-invalid", "true");
      expect(body.getByText("Name your alert.")).toBeVisible();
    });
    await userEvent.type(body.getByRole("textbox", { name: "Alert name" }), "Remote roles");
    await userEvent.click(body.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(document.querySelector("[data-slot=dialog-popup]")).toBeNull());
  },
};

/** Closed trigger states appear side by side; modal content has its own Open story so it cannot hide these controls. */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-6">
      <EditAlert {...args} triggerLabel="Rest" />
      <EditAlert {...args} triggerLabel="Hover" demo="hover" />
      <EditAlert {...args} triggerLabel="Pressed" demo="active" />
      <EditAlert {...args} triggerLabel="Keyboard focus" demo="focus" />
      <EditAlert {...args} triggerLabel="Disabled" disabled />
    </div>
  ),
};
