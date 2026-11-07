import type { Meta, StoryObj } from "@storybook/react-vite";
import type { MouseEvent, MouseEventHandler, ReactNode } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { Badge } from "./badge.tsx";
import { Button } from "./button.tsx";
import { Card, CardDescription, CardLink, type CardProps, CardTitle } from "./card.tsx";

type StoryProps = CardProps & { onNavigate: MouseEventHandler<HTMLAnchorElement>; onSave: () => void };

const meta = {
  title: "Display/Card",
  component: Card,
  args: {
    onNavigate: fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()),
    onSave: fn(),
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<StoryProps>;

function JobCard({ onNavigate, children }: { onNavigate: StoryProps["onNavigate"]; children?: ReactNode }) {
  return (
    <Card className="w-full max-w-lg">
      <div className="flex min-w-0 items-start gap-4">
        <span
          aria-hidden
          className="inline-flex size-14 shrink-0 items-center justify-center rounded-thumb bg-brand-tint font-display text-title font-bold text-brand-text"
        >
          K
        </span>
        <CardTitle>
          <CardLink href="#job-42" onClick={onNavigate}>
            Product designer at Kumiko
          </CardLink>
        </CardTitle>
      </div>
      <CardDescription>Help a small team build thoughtful tools for everyday work.</CardDescription>
      <div className="flex flex-wrap gap-2">
        <Badge tone="leaf">Remote</Badge>
        <Badge tone="sun">Paid</Badge>
      </div>
      {children}
    </Card>
  );
}

function targetAtCenter(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return element.ownerDocument.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
}

export const Default: Story = {
  render: () => (
    <Card className="w-full max-w-lg">
      <CardTitle>Company profile</CardTitle>
      <CardDescription>Keep your company's details together so applicants know who you are.</CardDescription>
    </Card>
  ),
};

export const Linked: Story = {
  render: (args) => <JobCard onNavigate={args.onNavigate} />,
  play: async ({ args, canvas, userEvent }) => {
    const link = canvas.getByRole("link", { name: "Product designer at Kumiko" });
    const card = link.closest('[data-slot="card"]')!;
    await userEvent.tab();
    await waitFor(() => {
      expect(link).toHaveFocus();
      const ring = getComputedStyle(card, "::after");
      expect(ring.borderTopStyle).toBe("solid");
      expect(Number.parseFloat(ring.borderTopWidth)).toBeGreaterThanOrEqual(3);
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(args.onNavigate).toHaveBeenCalledOnce());
    const description = canvas.getByText("Help a small team build thoughtful tools for everyday work.");
    await waitFor(() => expect(targetAtCenter(description)).toBe(link));
    await userEvent.click(targetAtCenter(description)!);
    await waitFor(() => expect(args.onNavigate).toHaveBeenCalledTimes(2));
  },
};

export const WithAction: Story = {
  name: "With action",
  render: (args) => (
    <JobCard onNavigate={args.onNavigate}>
      <Button className="w-fit" onClick={args.onSave}>
        Save
      </Button>
    </JobCard>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const save = canvas.getByRole("button", { name: "Save" });
    await waitFor(() => expect(save.contains(targetAtCenter(save))).toBe(true));
    await userEvent.click(targetAtCenter(save)!);
    await waitFor(() => {
      expect(args.onSave).toHaveBeenCalledOnce();
      expect(args.onNavigate).not.toHaveBeenCalled();
    });
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(canvas.getByRole("link")).toHaveFocus());
    await userEvent.tab();
    await waitFor(() => {
      expect(save).toHaveFocus();
      expect(getComputedStyle(save, "::after").borderTopStyle).toBe("solid");
      expect(getComputedStyle(save.closest('[data-slot="card"]')!, "::after").content).toBe("none");
    });
  },
};

export const States: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] items-start gap-6">
      {(["rest", "hover", "focus", "active"] as const).map((state) => (
        <Card key={state}>
          <CardTitle>
            <CardLink href="#job-42" onClick={args.onNavigate} data-demo={state === "rest" ? undefined : state}>
              {state}
            </CardLink>
          </CardTitle>
          <CardDescription>A linked card in its {state} state.</CardDescription>
        </Card>
      ))}
    </div>
  ),
};
