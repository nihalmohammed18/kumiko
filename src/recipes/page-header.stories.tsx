"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Ellipsis } from "lucide-react";
import type { MouseEvent } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { Badge } from "../components/badge.tsx";
import { BreadcrumbItem, Breadcrumbs } from "../components/breadcrumbs.tsx";
import { Button, IconButton } from "../components/button.tsx";
import { LinkButton } from "../components/link-button.tsx";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "../components/menu.tsx";
import { useKumiko } from "../provider.tsx";

function PageHeader({
  variant = "job",
  headingLevel = 1,
  onNavigate,
  onSecondary,
  onOverflow,
}: {
  variant?: "job" | "list" | "minimal";
  headingLevel?: 1 | 2;
  onNavigate: (event: MouseEvent<HTMLElement>) => void;
  onSecondary: () => void;
  onOverflow: () => void;
}) {
  const { locale, labels } = useKumiko();
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const isList = variant === "list";
  const title = isList ? "Your applications" : variant === "job" ? "Frontend engineer at Cedar Labs" : "Your next step";
  return (
    <header className="@container/page-header grid min-w-0 w-full max-w-6xl gap-4">
      {variant !== "minimal" && (
        <Breadcrumbs locale={locale} labels={labels} onClick={onNavigate}>
          <BreadcrumbItem href="/">Job board</BreadcrumbItem>
          {!isList && <BreadcrumbItem href="/jobs">Jobs</BreadcrumbItem>}
          <BreadcrumbItem>{isList ? "Your applications" : "Frontend engineer"}</BreadcrumbItem>
        </Breadcrumbs>
      )}
      <div className="grid min-w-0 gap-4 @[32rem]/page-header:grid-cols-[minmax(0,1fr)_auto]">
        <div className="grid min-w-0 gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <Heading className="min-w-0 wrap-anywhere font-display text-headline font-bold">{title}</Heading>
            {isList && <Badge tone="brand">{new Intl.NumberFormat(locale).format(3)} new</Badge>}
          </div>
          {variant !== "minimal" && (
            <p className="min-w-0 wrap-anywhere text-body text-ink-muted">
              {isList
                ? "Keep every small step toward your next role in one place."
                : "Build thoughtful tools with a team that helps you grow."}
            </p>
          )}
        </div>
        {variant !== "minimal" && (
          <div className="flex min-w-0 flex-wrap items-start gap-3 @[32rem]/page-header:justify-end">
            <LinkButton
              href={isList ? "/jobs" : "/jobs/frontend/apply"}
              tone="primary"
              className="w-full @[32rem]/page-header:w-auto"
              onClick={onNavigate}
            >
              {isList ? "Browse jobs" : "Apply now"}
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </LinkButton>
            <Button tone="secondary" onClick={onSecondary}>
              {isList ? "Export list" : "Save job"}
            </Button>
            <Menu>
              <MenuTrigger render={<IconButton aria-label="More actions" />}>
                <Ellipsis aria-hidden />
              </MenuTrigger>
              <MenuPopup>
                <MenuItem onClick={onOverflow}>{isList ? "Copy list link" : "Copy job link"}</MenuItem>
                <MenuItem onClick={onOverflow}>{isList ? "Manage reminders" : "Report this job"}</MenuItem>
              </MenuPopup>
            </Menu>
          </div>
        )}
      </div>
    </header>
  );
}

const meta = {
  title: "Recipes/Page header",
  component: PageHeader,
  args: {
    onNavigate: fn((event: MouseEvent<HTMLElement>) => event.preventDefault()),
    onSecondary: fn(),
    onOverflow: fn(),
  },
} satisfies Meta<typeof PageHeader>;

/** Metadata for responsive screen headers.
 * Use when: browsing page-level composition. Avoid when: importing a production component.
 */
export default meta;
type Story = StoryObj<typeof meta>;

/** A job header with a primary destination, save action and overflow menu.
 * Use when: presenting one opportunity. Avoid when: browsing a list of applications.
 */
export const JobPage: Story = {
  name: "Job page",
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("link", { name: "Apply now" }));
    await userEvent.tab();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Save job" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    const trigger = canvas.getByRole("button", { name: "More actions" });
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Copy job link" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(args.onNavigate).toHaveBeenCalledOnce();
      expect(args.onSecondary).toHaveBeenCalledOnce();
      expect(args.onOverflow).toHaveBeenCalledOnce();
      expect(body.queryByRole("menu")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
    await userEvent.unhover(trigger);
    trigger.blur();
  },
};

/** An application-list header with a localized new-item count.
 * Use when: naming a collection and its actions. Avoid when: presenting one job.
 */
export const ListPage: Story = { name: "List page", args: { variant: "list" } };

/** A title-only header for a quiet screen.
 * Use when: no navigation or actions are needed. Avoid when: hiding essential page actions.
 */
export const Minimal: Story = { args: { variant: "minimal" } };

/** The three header variants together, each responding to its own container.
 * Use when: comparing page hierarchies. Avoid when: building one screen with three primary headers.
 */
export const States: Story = {
  render: (args) => (
    <div className="@container grid min-w-0 w-full max-w-6xl gap-8 @[64rem]:grid-cols-2">
      {(["job", "list", "minimal"] as const).map((variant) => (
        <PageHeader key={variant} {...args} variant={variant} headingLevel={2} />
      ))}
    </div>
  ),
};
