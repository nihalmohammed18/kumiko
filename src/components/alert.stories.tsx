import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Alert } from "./alert.tsx";
import { Button } from "./button.tsx";

const meta = {
  title: "Feedback/Alert",
  component: Alert,
  args: { title: "Your profile is 80% complete" },
  argTypes: { status: { control: "inline-radio", options: ["info", "success", "warning", "danger"] } },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Statuses: Story = {
  render: (args) => (
    <div className="grid w-full max-w-2xl gap-4">
      <Alert {...args} status="info">
        Add your experience to help employers get to know you.
      </Alert>
      <Alert {...args} status="success" title="Your changes are saved">
        Your updated profile is ready to share.
      </Alert>
      <Alert {...args} status="warning" title="Your session expires soon">
        Save your work before signing in again.
      </Alert>
      <Alert {...args} status="danger" title="We couldn't save your changes">
        Check your connection and try again.
      </Alert>
    </div>
  ),
};

// The forced-colours project takes baselines from the States story.
export const States: Story = { ...Statuses };

const onAction = fn();
const onDismiss = fn();

export const WithAction: Story = {
  name: "With action",
  render: (args) => (
    <div className="w-full max-w-2xl">
      <Alert
        {...args}
        action={
          <div className="flex min-w-0 flex-wrap gap-3">
            <Button onClick={onAction}>Complete profile</Button>
            <Button disabled onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        }
      >
        Add your experience to finish your profile.
      </Alert>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    onAction.mockClear();
    onDismiss.mockClear();
    const action = canvas.getByRole("button", { name: "Complete profile" });
    await userEvent.tab();
    await waitFor(() => expect(action).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await userEvent.click(action);
    await waitFor(() => expect(onAction).toHaveBeenCalledTimes(2));
    const disabled = canvas.getByRole("button", { name: "Dismiss" });
    await userEvent.click(disabled);
    await waitFor(() => {
      expect(disabled).toBeDisabled();
      expect(onDismiss).not.toHaveBeenCalled();
    });
  },
};

export const LongText: Story = {
  name: "Long text",
  render: (args) => (
    <div className="w-80 max-w-full">
      <Alert
        {...args}
        status="danger"
        title="We couldn't save all of the changes to your profile because the connection was interrupted before the upload finished"
      >
        Your work is still here. Reconnect and try again, or share this reference with support:
        profile-save-abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789.
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]')!;
    await waitFor(() => expect(alert.scrollWidth - alert.clientWidth).toBeLessThanOrEqual(1));
  },
};
