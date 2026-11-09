"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { pickStoryCopy, storyCopy } from "../../.storybook/story-copy.ts";
import { useKumiko } from "../provider.tsx";
import { Button } from "./button.tsx";
import { Character } from "./character.tsx";
import { EmptyState, type EmptyStateProps } from "./empty-state.tsx";
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

type Scenario = "emptyStateFirstRun" | "emptyStateNoResults" | "emptyStateFailure";

function EmptyStatePreview({ scenario, ...args }: EmptyStateProps & { scenario: Scenario }) {
  const { locale } = useKumiko();
  const copy = pickStoryCopy(storyCopy[scenario], locale);
  return (
    <EmptyState
      {...args}
      title={copy.title}
      description={copy.description}
      actions={
        scenario === "emptyStateFirstRun" ? (
          <LinkButton href="/jobs" tone="primary">
            {copy.action}
          </LinkButton>
        ) : (
          <Button
            tone={scenario === "emptyStateFailure" ? "primary" : "secondary"}
            onClick={scenario === "emptyStateFailure" ? retry : clearFilters}
          >
            {copy.action}
          </Button>
        )
      }
    />
  );
}

export const Default: Story = {
  name: "First run",
  render: (args) => <EmptyStatePreview {...args} scenario="emptyStateFirstRun" />,
  play: async ({ canvas, globals, userEvent }) => {
    const copy = pickStoryCopy(storyCopy.emptyStateFirstRun, globals.locale);
    const browse = canvas.getByRole("link", { name: copy.action });
    await waitFor(() => {
      expect(canvas.getByRole("heading", { level: 3, name: copy.title })).toBeVisible();
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
  render: (args) => <EmptyStatePreview {...args} scenario="emptyStateNoResults" />,
  play: async ({ canvas, globals, userEvent }) => {
    const copy = pickStoryCopy(storyCopy.emptyStateNoResults, globals.locale);
    await userEvent.click(canvas.getByRole("button", { name: copy.action }));
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
  render: (args) => <EmptyStatePreview {...args} scenario="emptyStateFailure" />,
  play: async ({ canvas, globals, userEvent }) => {
    const copy = pickStoryCopy(storyCopy.emptyStateFailure, globals.locale);
    await userEvent.tab();
    await waitFor(() => expect(canvas.getByRole("button", { name: copy.action })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(retry).toHaveBeenCalledOnce());
  },
};

export const ObjectsOnly: Story = {
  name: "Objects only",
  args: { art: <Illustration name="envelope" /> },
  render: (args) => <EmptyStatePreview {...args} scenario="emptyStateFirstRun" />,
};

export const Narrow: Story = {
  render: (args) => (
    <div className="w-80 max-w-full">
      <EmptyStatePreview {...args} scenario="emptyStateFirstRun" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="@container w-full max-w-3xl">
      <div className="grid items-start gap-6 @lg:grid-cols-2">
        <EmptyStatePreview {...args} headingLevel={2} scenario="emptyStateFirstRun" />
        <EmptyStatePreview {...args} {...NoResults.args} scenario="emptyStateNoResults" />
        <EmptyStatePreview {...args} {...Failure.args} scenario="emptyStateFailure" />
        <EmptyStatePreview {...args} {...ObjectsOnly.args} scenario="emptyStateFirstRun" />
      </div>
    </div>
  ),
};
