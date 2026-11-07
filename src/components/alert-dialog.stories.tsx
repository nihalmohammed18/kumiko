import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogPopup,
  type AlertDialogPopupProps,
  type AlertDialogProps,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog.tsx";

interface DemoProps extends AlertDialogProps {
  size?: AlertDialogPopupProps["size"];
  disabled?: boolean;
  demo?: string;
  triggerLabel?: string;
  onDelete?: () => void;
}

function DeleteAlert({ size, disabled, demo, triggerLabel = "Delete job alert", onDelete, ...props }: DemoProps) {
  return (
    <AlertDialog {...props}>
      <AlertDialogTrigger tone="danger" disabled={disabled} data-demo={demo}>
        {triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogPopup
        size={size}
        cancel="Cancel"
        actions={
          <AlertDialogClose tone="danger" onClick={onDelete}>
            Delete
          </AlertDialogClose>
        }
      >
        <AlertDialogTitle>Delete this job alert?</AlertDialogTitle>
        <AlertDialogDescription>
          You will stop receiving matching opportunities. This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogPopup>
    </AlertDialog>
  );
}

const meta = {
  title: "Overlays/AlertDialog",
  component: AlertDialog,
  subcomponents: {
    AlertDialogTrigger,
    AlertDialogPopup,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogClose,
  },
  args: { onOpenChange: fn(), onDelete: fn() },
  render: (args) => <DeleteAlert {...args} />,
} satisfies Meta<DemoProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeleteConfirmation: Story = {
  name: "Delete confirmation",
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Delete job alert" });
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("alertdialog", { name: "Delete this job alert?" })).toBeVisible());
    const popup = body.getByRole("alertdialog");
    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=alert-dialog-backdrop]")!);
    await waitFor(() => {
      expect(popup).toHaveAttribute("data-open");
      expect(args.onOpenChange).not.toHaveBeenCalledWith(false, expect.anything());
    });
    await userEvent.click(within(popup).getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(document.querySelector("[data-slot=alert-dialog-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
      expect(args.onDelete).not.toHaveBeenCalled();
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body.getByRole("button", { name: "Cancel" })).toHaveFocus());
    await userEvent.click(body.getByRole("button", { name: "Delete" }));
    await waitFor(() => {
      expect(args.onDelete).toHaveBeenCalledTimes(1);
      expect(document.querySelector("[data-slot=alert-dialog-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
    });
  },
};

export const Open: Story = { args: { open: true }, parameters: { vrt: "page" } };
export const Small: Story = { args: { open: true, size: "sm" }, parameters: { vrt: "page" } };
export const Large: Story = { args: { open: true, size: "lg" }, parameters: { vrt: "page" } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Delete job alert" });
    await waitFor(() => expect(trigger).toBeDisabled());
    await userEvent.click(trigger);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(trigger).not.toHaveFocus();
      expect(canvasElement.ownerDocument.querySelector("[data-slot=alert-dialog-popup]")).toBeNull();
      expect(args.onOpenChange).not.toHaveBeenCalled();
      expect(args.onDelete).not.toHaveBeenCalled();
    });
  },
};

/** Closed triggers are comparable side by side; the modal confirmation is covered by Open. */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-6">
      <DeleteAlert {...args} triggerLabel="Rest" />
      <DeleteAlert {...args} triggerLabel="Hover" demo="hover" />
      <DeleteAlert {...args} triggerLabel="Pressed" demo="active" />
      <DeleteAlert {...args} triggerLabel="Keyboard focus" demo="focus" />
      <DeleteAlert {...args} triggerLabel="Disabled" disabled />
    </div>
  ),
};
