import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Button } from "./button.tsx";
import { Character } from "./character.tsx";
import { EmptyState } from "./empty-state.tsx";
import { Illustration } from "./illustration.tsx";
import { LinkButton } from "./link-button.tsx";

const clearFilters = fn();
const retry = fn();

const meta = {
  title: "Display/EmptyState",
  component: EmptyState,
  args: {
    art: <Character name="pip" pose="waving" />,
    title: "No applications yet",
    description: "Find a role you love and send your first application.",
    actions: (
      <LinkButton href="/jobs" tone="primary">
        Browse jobs
      </LinkButton>
    ),
    className: "max-w-lg",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "First run",
  play: async ({ canvas, userEvent }) => {
    const browse = canvas.getByRole("link", { name: "Browse jobs" });
    await waitFor(() => {
      expect(canvas.getByRole("heading", { level: 3, name: "No applications yet" })).toBeVisible();
      expect(browse).toHaveAttribute("href", "/jobs");
    });
    await userEvent.tab();
    await waitFor(() => expect(browse).toHaveFocus());
  },
};

export const NoResults: Story = {
  name: "No results",
  args: {
    art: <Character name="mori" pose="thinking" />,
    title: "No jobs match these filters",
    description: "Try widening your search to find more opportunities.",
    actions: (
      <Button tone="secondary" onClick={clearFilters}>
        Clear filters
      </Button>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(clearFilters).toHaveBeenCalledOnce());
  },
};

export const Failure: Story = {
  args: {
    status: "error",
    art: <Character name="tuck" pose="oops" />,
    title: "We couldn't load your applications",
    description: "Your applications are safe. Try loading them again.",
    actions: (
      <Button tone="primary" onClick={retry}>
        Try again
      </Button>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Try again" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(retry).toHaveBeenCalledOnce());
  },
};

export const ObjectsOnly: Story = {
  name: "Objects only",
  args: { art: <Illustration name="envelope" /> },
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
      <div className="grid items-start gap-6 @lg:grid-cols-2">
        <EmptyState {...args} headingLevel={2} />
        <EmptyState {...args} {...NoResults.args} />
        <EmptyState {...args} {...Failure.args} />
        <EmptyState {...args} {...ObjectsOnly.args} />
      </div>
    </div>
  ),
};
