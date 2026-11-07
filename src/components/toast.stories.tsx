import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { labels } from "../labels.ts";
import { Button } from "./button.tsx";
import { Toaster, toast } from "./toast.tsx";

const onUnavailable = fn(() => toast("Unavailable"));

function StatusButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast("Draft saved", { timeout: 0 })}>Neutral</Button>
      <Button onClick={() => toast.success("Saved", { description: "Your changes are safe.", timeout: 0 })}>
        Saved
      </Button>
      <Button onClick={() => toast.error("Could not save", { description: "Try again shortly.", timeout: 0 })}>
        Error
      </Button>
      <Button onClick={() => toast.info("A new version is ready", { timeout: 0 })}>Info</Button>
      <Button disabled onClick={onUnavailable}>
        Unavailable
      </Button>
    </div>
  );
}

const meta = {
  title: "Feedback/Toast",
  component: Toaster,
  args: { limit: 3 },
  parameters: { vrt: "page" },
  decorators: [
    (Story, { args }) => (
      <>
        <Story />
        <Toaster {...args} />
      </>
    ),
  ],
  render: () => <StatusButtons />,
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

function notifications(element: HTMLElement, dir: unknown) {
  return within(element.ownerDocument.body).findByRole("region", {
    name: dir === "rtl" ? labels.ar.notifications : labels.en.notifications,
  });
}

function roots(viewport: HTMLElement) {
  return viewport.querySelectorAll<HTMLElement>('[data-slot="toast"]');
}

export const Statuses: Story = {
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    onUnavailable.mockClear();
    const viewport = await notifications(canvasElement, globals.dir);
    await userEvent.click(canvas.getByRole("button", { name: "Saved" }));
    await waitFor(() => expect(within(viewport).getByRole("dialog", { name: "Saved" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Unavailable" }));
    await waitFor(() => {
      expect(onUnavailable).not.toHaveBeenCalled();
      expect(roots(viewport)).toHaveLength(1);
      expect(within(canvasElement.ownerDocument.body).getByRole("status")).toBeEmptyDOMElement();
    });
  },
};

export const States: Story = {
  args: { limit: 5 },
  render: () => (
    <Button
      onClick={() => {
        toast("Ready", { timeout: 0 });
        toast.success("Saved", { timeout: 0 });
        toast.error("Failed", { timeout: 0 });
        toast.info("Note", { timeout: 0 });
        void toast.promise(new globalThis.Promise<string>(() => {}), {
          loading: "Loading",
          success: "Loaded",
          error: "Failed",
        });
      }}
    >
      Show states
    </Button>
  ),
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const viewport = await notifications(canvasElement, globals.dir);
    await userEvent.click(canvas.getByRole("button", { name: "Show states" }));
    await userEvent.keyboard("{F6}");
    await waitFor(() => {
      expect(roots(viewport)).toHaveLength(5);
      expect(viewport).toHaveAttribute("data-expanded");
      expect(within(viewport).getByRole("alertdialog", { name: "Failed" })).toBeVisible();
    });
  },
};

const initialItems = ["Notebook", "Calendar", "Sketchbook"];

function UndoExample() {
  const [items, setItems] = useState(initialItems);
  return (
    <ul className="grid w-80 max-w-full gap-3">
      {items.map((item) => (
        <li key={item} className="flex min-w-0 items-center justify-between gap-3">
          <span className="min-w-0 wrap-anywhere">{item}</span>
          <Button
            size="sm"
            aria-label={`Delete ${item}`}
            onClick={() => {
              setItems((current) => current.filter((entry) => entry !== item));
              toast(`Removed ${item}`, {
                timeout: 0,
                action: {
                  label: "Undo",
                  onClick: () =>
                    setItems((current) => initialItems.filter((entry) => entry === item || current.includes(entry))),
                },
              });
            }}
          >
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
}

export const Undo: Story = {
  render: () => <UndoExample />,
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const viewport = await notifications(canvasElement, globals.dir);
    await userEvent.click(canvas.getByRole("button", { name: "Delete Notebook" }));
    await waitFor(() => expect(canvas.queryByText("Notebook")).not.toBeInTheDocument());
    await userEvent.click(await within(viewport).findByRole("button", { name: "Undo" }));
    await waitFor(() => {
      expect(canvas.getByText("Notebook")).toBeVisible();
      expect(roots(viewport)).toHaveLength(0);
    });
  },
};

function PromiseButton({ fail = false }: { fail?: boolean }) {
  return (
    <Button
      onClick={() => {
        const operation = new globalThis.Promise<string>((resolve, reject) => {
          setTimeout(() => (fail ? reject(new Error("Report failed")) : resolve("Report ready")), 600);
        });
        void toast
          .promise(operation, {
            loading: "Preparing report…",
            success: (result) => ({ title: result, timeout: 0 }),
            error: (error) => ({ title: error.message, timeout: 0 }),
          })
          .catch(() => undefined);
      }}
    >
      {fail ? "Fail report" : "Prepare report"}
    </Button>
  );
}

export const PromiseToast: Story = {
  name: "Promise",
  render: () => <PromiseButton />,
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const viewport = await notifications(canvasElement, globals.dir);
    await userEvent.click(canvas.getByRole("button", { name: "Prepare report" }));
    await waitFor(() => expect(within(viewport).getByRole("heading", { name: "Preparing report…" })).toBeVisible());
    await waitFor(() => expect(within(viewport).getByRole("heading", { name: "Report ready" })).toBeVisible());
    await waitFor(() => expect(roots(viewport)).toHaveLength(1));
  },
};

export const PromiseError: Story = {
  name: "Promise error",
  render: () => <PromiseButton fail />,
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const viewport = await notifications(canvasElement, globals.dir);
    await userEvent.click(canvas.getByRole("button", { name: "Fail report" }));
    await waitFor(() => expect(within(viewport).getByRole("heading", { name: "Preparing report…" })).toBeVisible());
    await waitFor(() =>
      expect(within(canvasElement.ownerDocument.body).getByRole("alert")).toHaveTextContent("Report failed"),
    );
    await userEvent.keyboard("{F6}");
    await waitFor(() => expect(within(viewport).getByRole("alertdialog", { name: "Report failed" })).toBeVisible());
  },
};

export const Stack: Story = {
  render: () => (
    <Button
      onClick={() => {
        for (let index = 1; index <= 4; index++) {
          toast(`Notification ${index}`, {
            timeout: 0,
            description:
              index === 3
                ? "This longer message checks that different heights still stack without overlapping."
                : undefined,
          });
        }
      }}
    >
      Show four toasts
    </Button>
  ),
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const viewport = await notifications(canvasElement, globals.dir);
    await userEvent.click(canvas.getByRole("button", { name: "Show four toasts" }));
    await waitFor(() => {
      expect(viewport.querySelectorAll('[data-slot="toast"]:not([data-limited])')).toHaveLength(3);
      const oldest = viewport.querySelector('[data-slot="toast"][data-limited]');
      expect(oldest).toHaveTextContent("Notification 1");
      expect(oldest).toHaveAttribute("inert");
      expect(getComputedStyle(oldest!).opacity).toBe("0");
    });
    const layout = () => Array.from(roots(viewport), (root) => [root.offsetTop, root.offsetWidth, root.offsetHeight]);
    const atRest = layout();
    await userEvent.hover(viewport);
    await waitFor(() => {
      expect(viewport).toHaveAttribute("data-expanded");
      expect(layout()).toEqual(atRest);
      const visible = viewport.querySelectorAll<HTMLElement>('[data-slot="toast"]:not([data-limited])');
      expect(visible[1]!.getBoundingClientRect().bottom).toBeLessThan(visible[0]!.getBoundingClientRect().top);
      expect(visible[2]!.getBoundingClientRect().bottom).toBeLessThan(visible[1]!.getBoundingClientRect().top);
    });
  },
};

export const Keyboard: Story = {
  render: () => <Button onClick={() => toast("Keyboard notification", { timeout: 0 })}>Notify</Button>,
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const viewport = await notifications(canvasElement, globals.dir);
    const notify = canvas.getByRole("button", { name: "Notify" });
    await userEvent.click(notify);
    await userEvent.keyboard("{F6}");
    await waitFor(() => expect(viewport.contains(canvasElement.ownerDocument.activeElement)).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(roots(viewport)).toHaveLength(0));
    await userEvent.click(notify);
    // Base UI keeps Close out of the accessibility tree until the viewport is hovered or focused, so screen readers
    // don't hear a Close button with every toast. A mouse hovers the viewport on its way to the button.
    await userEvent.hover(viewport);
    await userEvent.click(
      await within(viewport).findByRole("button", { name: globals.dir === "rtl" ? labels.ar.close : labels.en.close }),
    );
    await waitFor(() => expect(roots(viewport)).toHaveLength(0));
  },
};

function DialogExample() {
  const [restored, setRestored] = useState(false);
  function notify() {
    setRestored(false);
    toast("Reminder removed", { timeout: 0, action: { label: "Undo", onClick: () => setRestored(true) } });
  }
  return (
    <BaseDialog.Root>
      <div className="flex flex-wrap gap-3">
        <Button onClick={notify}>Notify before opening</Button>
        <BaseDialog.Trigger render={<Button />}>Open dialog</BaseDialog.Trigger>
      </div>
      <BaseDialog.Portal className="relative z-overlay">
        <BaseDialog.Backdrop className="fixed inset-0 bg-scrim" />
        <BaseDialog.Viewport className="fixed inset-0 grid place-items-center p-4">
          <BaseDialog.Popup className="popup flex w-96 max-w-full flex-col gap-4 p-6 font-body">
            <BaseDialog.Title className="font-display text-title-sm font-bold">Edit reminder</BaseDialog.Title>
            <BaseDialog.Description className="text-body-sm">
              Remove a reminder and restore it from its notification.
            </BaseDialog.Description>
            <Button onClick={notify}>Notify from dialog</Button>
            {restored && <p>Reminder restored</p>}
            <BaseDialog.Close render={<Button />}>Close dialog</BaseDialog.Close>
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export const OverADialog: Story = {
  name: "Over a dialog",
  render: () => <DialogExample />,
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const viewport = await notifications(canvasElement, globals.dir);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Notify before opening" }));
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    const dialog = await body.findByRole("dialog", { name: "Edit reminder" });
    await userEvent.click(await within(viewport).findByRole("button", { name: "Undo" }));
    await waitFor(() => {
      expect(within(dialog).getByText("Reminder restored")).toBeVisible();
      expect(dialog).toBeVisible();
      expect(roots(viewport)).toHaveLength(0);
    });
    await userEvent.click(within(dialog).getByRole("button", { name: "Notify from dialog" }));
    await userEvent.click(await within(viewport).findByRole("button", { name: "Undo" }));
    await waitFor(() => {
      expect(within(dialog).getByText("Reminder restored")).toBeVisible();
      expect(dialog).toBeVisible();
      expect(roots(viewport)).toHaveLength(0);
    });
    await userEvent.click(within(dialog).getByRole("button", { name: "Notify from dialog" }));
    await userEvent.keyboard("{F6}{Escape}");
    await waitFor(() => {
      expect(roots(viewport)).toHaveLength(0);
      expect(dialog).toBeVisible();
    });
    // Leave a persistent toast over the open dialog for the screenshot.
    await userEvent.click(within(dialog).getByRole("button", { name: "Notify from dialog" }));
    await waitFor(() => expect(within(viewport).getByRole("dialog", { name: "Reminder removed" })).toBeVisible());
  },
};

export const Pauses: Story = {
  render: () => <Button onClick={() => toast("Timer paused", { timeout: 1500 })}>Start timer</Button>,
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const viewport = await notifications(canvasElement, globals.dir);
    const start = canvas.getByRole("button", { name: "Start timer" });
    await userEvent.click(start);
    await userEvent.hover(viewport);
    await new globalThis.Promise((resolve) => setTimeout(resolve, 1700));
    await waitFor(() => expect(within(viewport).getByRole("dialog", { name: "Timer paused" })).toBeVisible());
    await userEvent.unhover(viewport);
    await userEvent.keyboard("{F6}");
    await waitFor(() => expect(viewport).toHaveFocus());
    await new globalThis.Promise((resolve) => setTimeout(resolve, 1700));
    await waitFor(() => expect(within(viewport).getByRole("dialog", { name: "Timer paused" })).toBeVisible());
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(start).toHaveFocus());
    await waitFor(() => expect(roots(viewport)).toHaveLength(0), { timeout: 3500 });
  },
};

export const Updates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast("Draft saved", { id: "draft", timeout: 0 })}>Save draft</Button>
      <Button onClick={() => toast.update("draft", { title: "Draft published", description: "Ready to share." })}>
        Publish draft
      </Button>
      <Button onClick={() => toast.dismiss("draft")}>Dismiss draft</Button>
    </div>
  ),
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const viewport = await notifications(canvasElement, globals.dir);
    const save = canvas.getByRole("button", { name: "Save draft" });
    await userEvent.click(save);
    await userEvent.click(save);
    await waitFor(() => expect(roots(viewport)).toHaveLength(1));
    await userEvent.click(canvas.getByRole("button", { name: "Publish draft" }));
    await waitFor(() => expect(within(viewport).getByRole("heading", { name: "Draft published" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss draft" }));
    await waitFor(() => expect(roots(viewport)).toHaveLength(0));
  },
};
