import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { commands } from "vitest/browser";
import { Button } from "./button.tsx";
import { Checkbox } from "./checkbox.tsx";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerPopup,
  type DrawerProps,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer.tsx";
import { Field, FieldError, FieldLabel } from "./field.tsx";
import { Form } from "./form.tsx";
import { Input } from "./input.tsx";

interface DemoProps extends DrawerProps {
  disabled?: boolean;
  demo?: string;
  triggerLabel?: string;
}

function JobFilters({ disabled, demo, triggerLabel = "Filter jobs", ...props }: DemoProps) {
  return (
    <Drawer {...props}>
      <DrawerTrigger disabled={disabled} data-demo={demo}>
        {triggerLabel}
      </DrawerTrigger>
      <DrawerPopup>
        <DrawerTitle>Filter jobs</DrawerTitle>
        <DrawerDescription>Choose the opportunities you want to see.</DrawerDescription>
        <DrawerBody>
          <div className="grid gap-4">
            <Checkbox defaultChecked>Remote roles</Checkbox>
            <Checkbox>Full-time roles</Checkbox>
            <Checkbox>Salary listed</Checkbox>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose tone="primary">Save</DrawerClose>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}

const meta = {
  title: "Overlays/Drawer",
  component: Drawer,
  subcomponents: { DrawerTrigger, DrawerPopup, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerClose },
  args: { onOpenChange: fn() },
  render: (args) => <JobFilters {...args} />,
} satisfies Meta<DemoProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BottomSheet: Story = {
  name: "Bottom sheet",
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Filter jobs" });
    await userEvent.click(trigger);
    await waitFor(() => {
      const popup = body.getByRole("dialog", { name: "Filter jobs" });
      expect(popup).toBeVisible();
      expect(popup.contains(document.activeElement)).toBe(true);
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
    });
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
    await userEvent.click(body.getByRole("checkbox", { name: "Full-time roles" }));
    await waitFor(() => expect(body.getByRole("checkbox", { name: "Full-time roles" })).toBeChecked());
    await userEvent.click(body.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
    });
  },
};

export const StartAndEnd: Story = {
  name: "Start and end",
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <JobFilters {...args} side="start" triggerLabel="Open start drawer" />
      <JobFilters {...args} side="end" triggerLabel="Open end drawer" />
    </div>
  ),
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    for (const side of ["start", "end"] as const) {
      const trigger = canvas.getByRole("button", { name: `Open ${side} drawer` });
      await userEvent.click(trigger);
      await waitFor(() => {
        const popup = body.getByRole("dialog");
        expect(popup).toBeVisible();
        expect(popup.getAnimations().filter((animation) => animation.playState === "running")).toHaveLength(0);
        const box = popup.getBoundingClientRect();
        const viewport = document.querySelector("[data-slot=drawer-viewport]")!.getBoundingClientRect();
        const atLeft = side === "start" ? globals.dir !== "rtl" : globals.dir === "rtl";
        expect(atLeft ? box.left : box.right).toBeCloseTo(atLeft ? viewport.left : viewport.right, 0);
        expect(box.width).toBeCloseTo(Math.min(360, viewport.width - 48), 0);
      });
      await userEvent.click(body.getByRole("button", { name: globals.dir === "rtl" ? "إغلاق" : "Close" }));
      await waitFor(() => {
        expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull();
        expect(trigger).toHaveFocus();
      });
    }
  },
};

type Point = { x: number; y: number };

/** Drawer ignores touch pointer moves; its native touch pipeline owns scrolling and swiping. */
/** Desktop WebKit can't build synthetic touches; the Chromium projects cover swiping there. */
function touchSupported() {
  try {
    new Touch({ identifier: 0, target: document.body });
    return true;
  } catch {
    return false;
  }
}

async function touchSwipe(target: Element, start: Point, end: Point) {
  target.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      buttons: 1,
      clientX: start.x,
      clientY: start.y,
    }),
  );
  const send = (type: string, progress: number) => {
    const touch = new Touch({
      identifier: 1,
      target,
      clientX: start.x + (end.x - start.x) * progress,
      clientY: start.y + (end.y - start.y) * progress,
    });
    const touches = type === "touchend" ? [] : [touch];
    target.dispatchEvent(
      new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        touches,
        targetTouches: touches,
        changedTouches: [touch],
      }),
    );
  };
  send("touchstart", 0);
  for (let step = 1; step <= 6; step++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    send("touchmove", step / 6);
  }
  send("touchend", 1);
  target.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      pointerId: 1,
      pointerType: "touch",
      clientX: end.x,
      clientY: end.y,
    }),
  );
}

export const Swipe: Story = {
  args: { side: "start", triggerLabel: "Open swipe drawer" },
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const trigger = canvas.getByRole("button", { name: "Open swipe drawer" });
    await userEvent.click(trigger);
    await waitFor(() => {
      const popup = within(document.body).getByRole("dialog");
      expect(popup).toBeVisible();
      expect(popup.getAnimations().filter((animation) => animation.playState === "running")).toHaveLength(0);
    });
    const popup = within(document.body).getByRole("dialog");
    const box = popup.getBoundingClientRect();
    const title = within(popup).getByRole("heading", { name: "Filter jobs" });
    const y = title.getBoundingClientRect().top + title.getBoundingClientRect().height / 2;
    const towardEdge = { x: box.left + box.width * (globals.dir === "rtl" ? 0.8 : 0.2), y };
    const awayFromEdge = { x: box.left + box.width * (globals.dir === "rtl" ? 0.2 : 0.8), y };
    if (!touchSupported()) {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull());
      return;
    }
    await touchSwipe(title, towardEdge, awayFromEdge);
    await waitFor(() => {
      expect(popup).toBeVisible();
      expect(popup.getAnimations().filter((animation) => animation.playState === "running")).toHaveLength(0);
      expect(popup.getBoundingClientRect().left).toBeCloseTo(box.left, 0);
    });
    await touchSwipe(title, awayFromEdge, towardEdge);
    await waitFor(() => {
      expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
    });
  },
};

const matchingRoles = Array.from({ length: 12 }, (_, index) => `Product designer · Team ${index + 1}`);

export const SnapPoints: Story = {
  name: "Snap points",
  args: { snapPoints: ["148px", 1], defaultSnapPoint: "148px" },
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger>View matching roles</DrawerTrigger>
      <DrawerPopup>
        <DrawerTitle>Matching roles</DrawerTitle>
        <DrawerBody>
          <DrawerDescription>Swipe up to explore the full list.</DrawerDescription>
          <ol className="grid gap-4 pt-4">
            {matchingRoles.map((role) => (
              <li key={role}>
                <h3 className="font-bold">{role}</h3>
                <p>Remote, full-time · Portfolio review included</p>
              </li>
            ))}
          </ol>
        </DrawerBody>
      </DrawerPopup>
    </Drawer>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const window = document.defaultView!;
    await userEvent.click(canvas.getByRole("button", { name: "View matching roles" }));
    await waitFor(() => {
      const popup = within(document.body).getByRole("dialog");
      expect(popup).toBeVisible();
      expect(popup.getAnimations().filter((animation) => animation.playState === "running")).toHaveLength(0);
      expect(window.innerHeight - popup.getBoundingClientRect().top).toBeCloseTo(148, 0);
    });
    const handle = document.querySelector("[data-slot=drawer-handle]")!;
    const box = handle.getBoundingClientRect();
    const start = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    if (touchSupported()) {
      await touchSwipe(handle, start, { x: start.x, y: start.y - window.innerHeight * 0.55 });
      await waitFor(() => {
        const popup = within(document.body).getByRole("dialog");
        expect(popup).toHaveAttribute("data-expanded");
        expect(popup.getBoundingClientRect().bottom).toBeCloseTo(window.innerHeight, 0);
        expect(popup.getBoundingClientRect().height).toBeCloseTo(window.innerHeight * 0.85, 0);
      });
    }
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull());
  },
};

const guideSteps = Array.from({ length: 20 }, (_, index) => `Application step ${index + 1}`);

export const LongContent: Story = {
  name: "Long content",
  render: (args) => (
    <div className="min-h-[120rem]" data-testid="page-position">
      <Drawer {...args}>
        <DrawerTrigger>Read application guide</DrawerTrigger>
        <DrawerPopup>
          <DrawerTitle>Application guide</DrawerTitle>
          <DrawerDescription>Review every step without losing your place on the page.</DrawerDescription>
          <DrawerBody>
            {guideSteps.map((step) => (
              <section key={step} className="mb-4">
                <h3 className="font-bold">{step}</h3>
                <p>
                  Choose roles that match your experience, preferred working hours and location. Review the team's
                  expectations before applying, and keep a note of the opportunities you want to revisit.
                </p>
              </section>
            ))}
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose>Done</DrawerClose>
          </DrawerFooter>
        </DrawerPopup>
      </Drawer>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const window = document.defaultView!;
    const pageTop = window.scrollY;
    expect(document.documentElement.scrollHeight).toBeGreaterThan(window.innerHeight);
    await userEvent.click(canvas.getByRole("button", { name: "Read application guide" }));
    await waitFor(() => {
      const popup = within(document.body).getByRole("dialog");
      expect(popup).toBeVisible();
      expect(popup.getAnimations().filter((animation) => animation.playState === "running")).toHaveLength(0);
      expect(
        [document.documentElement, document.body].some((node) => /hidden|clip/.test(getComputedStyle(node).overflowY)),
      ).toBe(true);
    });
    const title = document.querySelector("[data-slot=drawer-title]")!;
    const footer = document.querySelector("[data-slot=drawer-footer]")!;
    const titleTop = title.getBoundingClientRect().top;
    const footerTop = footer.getBoundingClientRect().top;
    await commands.uxWheel("[data-slot=drawer-body]", 700);
    await waitFor(() => expect(document.querySelector("[data-slot=drawer-body]")!.scrollTop).toBeGreaterThan(0));
    await commands.uxWheel("[data-slot=drawer-viewport]", 700);
    await waitFor(() => {
      expect(window.scrollY).toBe(pageTop);
      expect(title.getBoundingClientRect().top).toBeCloseTo(titleTop);
      expect(footer.getBoundingClientRect().top).toBeCloseTo(footerTop);
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull());
  },
};

export const Open: Story = { args: { open: true }, parameters: { vrt: "page" } };
export const OpenStart: Story = { args: { open: true, side: "start" }, parameters: { vrt: "page" } };
export const OpenEnd: Story = { args: { open: true, side: "end" }, parameters: { vrt: "page" } };
export const OpenPeek: Story = {
  args: { ...SnapPoints.args, open: true },
  render: SnapPoints.render,
  parameters: { vrt: "page" },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Filter jobs" });
    await waitFor(() => expect(trigger).toBeDisabled());
    await userEvent.click(trigger);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(trigger).not.toHaveFocus();
      expect(canvasElement.ownerDocument.querySelector("[data-slot=drawer-popup]")).toBeNull();
      expect(args.onOpenChange).not.toHaveBeenCalled();
    });
  },
};

function ValidatedDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>Save job filters</DrawerTrigger>
      <DrawerPopup>
        <DrawerTitle>Save job filters</DrawerTitle>
        <DrawerDescription>Name this filter set before saving it.</DrawerDescription>
        <Form
          className="flex min-h-0 flex-1 flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <DrawerBody>
            <Field name="filterName">
              <FieldLabel>Filter name</FieldLabel>
              <Input required />
              <FieldError>Name your filters.</FieldError>
            </Field>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose>Cancel</DrawerClose>
            <Button type="submit" tone="primary">
              Save
            </Button>
          </DrawerFooter>
        </Form>
      </DrawerPopup>
    </Drawer>
  );
}

export const Invalid: Story = {
  render: () => <ValidatedDrawer />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Save job filters" }));
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
    await userEvent.click(body.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(body.getByRole("dialog")).toHaveAttribute("data-open");
      expect(body.getByRole("textbox", { name: "Filter name" })).toHaveAttribute("aria-invalid", "true");
      expect(body.getByText("Name your filters.")).toBeVisible();
    });
    await userEvent.type(body.getByRole("textbox", { name: "Filter name" }), "Remote roles");
    await userEvent.click(body.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull());
  },
};

/** Trigger states remain side by side; the Open stories show modal surfaces without hiding these controls. */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-6">
      <JobFilters {...args} triggerLabel="Rest" />
      <JobFilters {...args} triggerLabel="Hover" demo="hover" />
      <JobFilters {...args} triggerLabel="Pressed" demo="active" />
      <JobFilters {...args} triggerLabel="Keyboard focus" demo="focus" />
      <JobFilters {...args} triggerLabel="Disabled" disabled />
    </div>
  ),
};
