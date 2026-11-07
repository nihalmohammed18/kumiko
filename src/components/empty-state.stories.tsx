import type { Meta, StoryObj } from "@storybook/react-vite";
import { BriefcaseBusiness } from "lucide-react";
import { expect, waitFor } from "storybook/test";
import { Button } from "./button.tsx";
import { EmptyState } from "./empty-state.tsx";

const meta = {
  title: "Display/EmptyState",
  component: EmptyState,
  args: {
    art: <BriefcaseBusiness className="text-brand" />,
    title: "No jobs yet",
    description: "Add your first application or browse opportunities to find your next role.",
    actions: (
      <>
        <Button tone="primary">Browse jobs</Button>
        <Button tone="secondary">Add a job</Button>
      </>
    ),
    className: "max-w-lg",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const browse = canvas.getByRole("button", { name: "Browse jobs" });
    const add = canvas.getByRole("button", { name: "Add a job" });
    await waitFor(() => expect(canvas.getByRole("heading", { level: 3, name: "No jobs yet" })).toBeVisible());
    await userEvent.tab();
    await waitFor(() => expect(browse).toHaveFocus());
    await userEvent.tab();
    await waitFor(() => expect(add).toHaveFocus());
    await userEvent.click(browse);
    await waitFor(() => expect(browse).toHaveFocus());
  },
};

export const Narrow: Story = {
  render: (args) => (
    <div className="w-80 max-w-full">
      <EmptyState {...args} />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="@container w-full max-w-3xl">
      <div className="grid items-start gap-6 @sm:grid-cols-3">
        <EmptyState {...args} headingLevel={2} />
        <EmptyState title="Nothing saved" description="Save an opportunity to return to it later." />
        <EmptyState title="No matching jobs" headingLevel={4} />
      </div>
    </div>
  ),
};
