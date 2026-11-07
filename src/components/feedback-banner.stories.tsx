import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { labels } from "../labels.ts";
import { Button } from "./button.tsx";
import { FeedbackBanner } from "./feedback-banner.tsx";

const savedTitle = "Saved! 2 more to finish this chapter.";
const completedTitle = "Chapter complete! Your progress is saved.";
const onContinue = fn();

const meta = {
  title: "Feedback/FeedbackBanner",
  component: FeedbackBanner,
  args: {
    title: savedTitle,
    description: "Your progress is safe. Continue when you're ready.",
    action: (
      <Button tone="primary" onClick={onContinue}>
        Keep going
      </Button>
    ),
  },
  argTypes: { status: { control: "inline-radio", options: ["success", "danger", "info"] } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeedbackBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvas, userEvent }) => {
    onContinue.mockClear();
    const action = canvas.getByRole("button", { name: "Keep going" });
    await userEvent.tab();
    await waitFor(() => expect(action).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await userEvent.click(action);
    await waitFor(() => expect(onContinue).toHaveBeenCalledTimes(2));
  },
};

export const Danger: Story = {
  args: {
    status: "danger",
    title: "We couldn't save your changes",
    description: "Your work is still here. Check your connection and try again.",
    action: <Button>Try again</Button>,
  },
};

export const Info: Story = {
  args: {
    status: "info",
    title: "Your progress is saved on this device",
    description: "Sign in to continue from another device.",
    action: <Button>Sign in</Button>,
  },
};

export const States: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <FeedbackBanner {...args} />
      <FeedbackBanner
        {...args}
        status="danger"
        title="We couldn't save your changes"
        description="Reconnect to try again."
        action={<Button disabled>Try again</Button>}
      />
      <FeedbackBanner
        {...args}
        status="info"
        title="Saving your progress"
        description="This should only take a moment."
        action={<Button loading>Keep going</Button>}
      />
    </div>
  ),
};

export const Narrow: Story = {
  render: (args) => (
    <div className="w-80 max-w-full">
      <FeedbackBanner {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const banner = canvasElement.querySelector('[data-slot="feedback-banner"]')!;
    const layout = banner.firstElementChild!;
    const action = banner.querySelector('[data-slot="feedback-banner-action"]')!;
    const description = banner.querySelector('[data-slot="feedback-banner-description"]')!;
    const button = canvas.getByRole("button", { name: "Keep going" });
    await waitFor(() => {
      const padding = getComputedStyle(layout);
      expect(padding.paddingInlineStart).toBe("16px");
      expect(padding.paddingInlineEnd).toBe("16px");
      expect(action.getBoundingClientRect().top).toBeGreaterThanOrEqual(description.getBoundingClientRect().bottom);
      expect(action.getBoundingClientRect().width).toBeCloseTo(layout.clientWidth - 32, 0);
      expect(button.getBoundingClientRect().width).toBeCloseTo(action.getBoundingClientRect().width, 0);
      expect(banner.scrollWidth - banner.clientWidth).toBeLessThanOrEqual(1);
    });
  },
};

function AnnouncementExample() {
  const [shown, setShown] = useState(false);
  const [status, setStatus] = useState<"success" | "danger">("success");
  const [title, setTitle] = useState(savedTitle);
  const [description, setDescription] = useState("Your progress is safe.");
  return (
    <div className="grid gap-4">
      <div>
        <Button onClick={() => setShown(true)}>Show feedback</Button>
      </div>
      {shown && (
        <>
          <FeedbackBanner
            status={status}
            title={title}
            description={description}
            action={<Button onClick={() => setTitle(completedTitle)}>Keep going</Button>}
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setStatus("danger")}>Show error</Button>
            <Button onClick={() => setDescription("You can continue on any device.")}>Update description</Button>
          </div>
        </>
      )}
    </div>
  );
}

export const Announces: Story = {
  render: () => <AnnouncementExample />,
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const region = within(canvasElement.ownerDocument.body).getByRole("status");
    const statusLabels = globals.dir === "rtl" ? labels.ar : labels.en;
    const messages: string[] = [];
    const observer = new MutationObserver(() => {
      if (region.textContent) messages.push(region.textContent);
    });
    observer.observe(region, { childList: true, characterData: true, subtree: true });
    try {
      await userEvent.click(canvas.getByRole("button", { name: "Show feedback" }));
      await waitFor(() => {
        expect(region).toHaveTextContent(`${statusLabels.statusSuccess}: ${savedTitle}`);
        expect(messages).toEqual([`${statusLabels.statusSuccess}: ${savedTitle}`]);
        expect(canvas.getByRole("img", { name: statusLabels.statusSuccess })).toBeVisible();
        const banner = canvasElement.querySelector('[data-slot="feedback-banner"]');
        expect(banner).not.toHaveAttribute("role");
        expect(banner).not.toHaveAttribute("aria-live");
      });
      await userEvent.click(canvas.getByRole("button", { name: "Keep going" }));
      await waitFor(() =>
        expect(messages).toEqual([
          `${statusLabels.statusSuccess}: ${savedTitle}`,
          `${statusLabels.statusSuccess}: ${completedTitle}`,
        ]),
      );
      await userEvent.click(canvas.getByRole("button", { name: "Show error" }));
      const expectedMessages = [
        `${statusLabels.statusSuccess}: ${savedTitle}`,
        `${statusLabels.statusSuccess}: ${completedTitle}`,
        `${statusLabels.statusDanger}: ${completedTitle}`,
      ];
      await waitFor(() => {
        expect(region).toHaveTextContent(expectedMessages[2]!);
        expect(messages).toEqual(expectedMessages);
      });
      await userEvent.click(canvas.getByRole("button", { name: "Update description" }));
      await waitFor(() => expect(canvas.getByText("You can continue on any device.")).toBeVisible());
      // Let effects and the provider's next frame run before checking that a description-only change stays silent.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      await waitFor(() => expect(messages).toEqual(expectedMessages));
    } finally {
      observer.disconnect();
    }
  },
};

export const LongTitle: Story = {
  name: "Long title",
  render: (args) => (
    <div className="w-80 max-w-full">
      <FeedbackBanner
        {...args}
        title="Saved! You have only two more activities to finish this chapter and unlock everything you've been working towards, including chapter-abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const banner = canvasElement.querySelector('[data-slot="feedback-banner"]')!;
    const title = banner.querySelector('[data-slot="feedback-banner-title"]')!;
    await waitFor(() => {
      expect(title.getBoundingClientRect().height).toBeGreaterThan(parseFloat(getComputedStyle(title).lineHeight));
      expect(title.scrollWidth - title.clientWidth).toBeLessThanOrEqual(1);
      expect(banner.scrollWidth - banner.clientWidth).toBeLessThanOrEqual(1);
    });
  },
};
