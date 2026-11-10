import type { Meta, StoryObj } from "@storybook/react-vite";
import type { MouseEvent, MouseEventHandler } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { Badge } from "./badge.tsx";
import { Button } from "./button.tsx";
import { CardLink } from "./card.tsx";
import { ListingCard, type ListingCardProps } from "./listing-card.tsx";
import { Rating } from "./rating.tsx";

type StoryProps = ListingCardProps & { onNavigate: MouseEventHandler<HTMLAnchorElement>; onSave: () => void };

const meta = {
  title: "Display/ListingCard",
  component: ListingCard,
  args: {
    title: "Python for everybody",
    onNavigate: fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()),
    onSave: fn(),
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<StoryProps>;

function Mark({ letter }: { letter: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center bg-brand-tint font-display text-title font-bold text-brand-text"
    >
      {letter}
    </span>
  );
}

function targetAtCenter(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return element.ownerDocument.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
}

function Course({ onNavigate, onSave }: Pick<StoryProps, "onNavigate" | "onSave">) {
  return (
    <ListingCard
      className="w-full max-w-lg"
      media={<Mark letter="P" />}
      title={
        <CardLink href="#python" onClick={onNavigate}>
          Python for everybody
        </CardLink>
      }
      description="Cedar Academy · 30 hours · Beginner"
      highlight="$49"
      action={<Button onClick={onSave}>Save</Button>}
    >
      <Rating value={4.7} count={12345} />
      <Badge tone="leaf">Certificate</Badge>
    </ListingCard>
  );
}

export const Default: Story = {
  render: (args) => <Course onNavigate={args.onNavigate} onSave={args.onSave} />,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const link = canvas.getByRole("link", { name: "Python for everybody" });
    const save = canvas.getByRole("button", { name: "Save" });
    // The whole card is the link, but the action on top of it still gets its own click.
    const highlight = canvasElement.querySelector<HTMLElement>('[data-slot="listing-card-highlight"]')!;
    await waitFor(() => expect(targetAtCenter(highlight)).toBe(link));
    await userEvent.click(targetAtCenter(highlight)!);
    await waitFor(() => expect(args.onNavigate).toHaveBeenCalledOnce());
    await waitFor(() => expect(save.contains(targetAtCenter(save))).toBe(true));
    await userEvent.click(targetAtCenter(save)!);
    await waitFor(() => {
      expect(args.onSave).toHaveBeenCalledOnce();
      expect(args.onNavigate).toHaveBeenCalledOnce();
    });
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(link).toHaveFocus());
  },
};

export const Job: Story = {
  render: (args) => (
    <ListingCard
      className="w-full max-w-lg"
      media={<Mark letter="K" />}
      title={
        <CardLink href="#job-42" onClick={args.onNavigate}>
          Junior product designer
        </CardLink>
      }
      description="Kumiko · Toronto, Canada"
      highlight="$62,000 a year"
      action={<Button onClick={args.onSave}>Save</Button>}
    >
      <Badge tone="leaf">Remote</Badge>
      <Badge tone="sun">Visa sponsorship</Badge>
    </ListingCard>
  ),
  play: async ({ canvasElement }) => {
    // Latin text stays left to right even in a right-to-left page, so the figure reads "$62,000 a year".
    const highlight = canvasElement.querySelector('[data-slot="listing-card-highlight"]')!;
    await waitFor(() => expect(getComputedStyle(highlight).direction).toBe("ltr"));
  },
};

export const TitleOnly: Story = {
  name: "Title only",
  render: () => <ListingCard className="w-full max-w-lg" title="Introduction to statistics" />,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="card"]')).toBeVisible());
    for (const part of ["media", "details", "footer"])
      expect(canvasElement.querySelector(`[data-slot="listing-card-${part}"]`)).toBeNull();
  },
};

export const States: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] items-start gap-6">
      <Course onNavigate={args.onNavigate} onSave={args.onSave} />
      <ListingCard title="Introduction to statistics" description="Free · 12 hours" highlight="Free" />
      <ListingCard
        media={<Mark letter="D" />}
        title={
          <CardLink href="#data" onClick={args.onNavigate}>
            The complete data analysis and visualisation bootcamp for absolute beginners
          </CardLink>
        }
        description="Northfield Institute of Technology and Professional Studies · 120 hours"
        highlight="$1,299 or 12 payments of $119"
        action={
          <>
            <Button onClick={args.onSave}>Compare</Button>
            <Button onClick={args.onSave}>Save</Button>
          </>
        }
      >
        <Rating value={0} count={0} />
        <Badge tone="tide">Instructor-led</Badge>
        <Badge tone="leaf">Certificate</Badge>
      </ListingCard>
    </div>
  ),
};
