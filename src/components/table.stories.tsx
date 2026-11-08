"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { Badge } from "./badge.tsx";
import { Checkbox } from "./checkbox.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  type TableProps,
  TableRow,
} from "./table.tsx";

const applications = [
  {
    id: "designer",
    role: "Product designer",
    company: "Kumiko",
    applied: "2026-10-28",
    status: "Interview",
    tone: "info",
    salary: 92000,
    location: "Remote",
    type: "Full time",
    contact: "Mina Shah",
    notes: "Portfolio review with the product team next week.",
  },
  {
    id: "frontend",
    role: "Frontend engineer",
    company: "Maple Studio",
    applied: "2026-10-24",
    status: "Applied",
    tone: "neutral",
    salary: 105000,
    location: "Toronto",
    type: "Full time",
    contact: "Alex Chen",
    notes: "Build accessible interfaces for customers across several languages and regions.",
  },
  {
    id: "systems",
    role: "Design systems engineer",
    company: "Cedar Labs",
    applied: "2026-10-20",
    status: "Offer",
    tone: "success",
    salary: 118000,
    location: "Remote",
    type: "Full time",
    contact: "Sam Rivera",
    notes: "Coordinate component accessibility and internationalization with teams across the company.",
  },
  {
    id: "researcher",
    role: "UX researcher",
    company: "Fieldwork",
    applied: "2026-10-15",
    status: "Withdrawn",
    tone: "neutral",
    salary: 85000,
    location: "London",
    type: "Contract",
    contact: "Noor Ali",
    notes: "The application was withdrawn before the first interview.",
  },
] as const;

function ApplicationsTable({
  selection = false,
  wide = false,
  footer = false,
  caption = "Job applications",
  ...props
}: TableProps & { selection?: boolean; wide?: boolean; footer?: boolean; caption?: string }) {
  const { locale } = useKumiko();
  const [selected, setSelected] = useState<string[]>(["designer", "systems"]);
  const captionId = `${props.id ?? "applications"}-caption`;
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const dates = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });
  return (
    <Table {...props} lang={locale} aria-labelledby={captionId} className={cn(wide && "min-w-5xl", props.className)}>
      <TableCaption id={captionId}>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {selection && (
            <TableHead>
              <span className="sr-only">Select application</span>
            </TableHead>
          )}
          <TableHead>Role</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead>Status</TableHead>
          {wide && (
            <>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Notes</TableHead>
            </>
          )}
          <TableHead align="end">Salary</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => {
          const locked = application.status === "Withdrawn";
          const reasonId = `${props.id ?? "applications"}-${application.id}-reason`;
          return (
            <TableRow key={application.id} selected={selection && selected.includes(application.id)}>
              {selection && (
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${application.role} at ${application.company}`}
                    aria-describedby={locked ? reasonId : undefined}
                    disabled={locked}
                    checked={selected.includes(application.id)}
                    onCheckedChange={(checked) =>
                      setSelected((rows) =>
                        checked ? [...rows, application.id] : rows.filter((id) => id !== application.id),
                      )
                    }
                  />
                </TableCell>
              )}
              <TableCell>
                {application.role}
                {selection && locked && (
                  <span id={reasonId} className="block text-body-sm text-ink-muted">
                    Withdrawn applications cannot be selected.
                  </span>
                )}
              </TableCell>
              <TableCell>{application.company}</TableCell>
              <TableCell>
                <time dateTime={application.applied}>{dates.format(new Date(application.applied))}</time>
              </TableCell>
              <TableCell>
                <Badge tone={application.tone}>{application.status}</Badge>
              </TableCell>
              {wide && (
                <>
                  <TableCell>{application.location}</TableCell>
                  <TableCell>{application.type}</TableCell>
                  <TableCell>{application.contact}</TableCell>
                  <TableCell>{application.notes}</TableCell>
                </>
              )}
              <TableCell align="end">{currency.format(application.salary)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      {footer && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4 + (selection ? 1 : 0) + (wide ? 4 : 0)}>
              {new Intl.NumberFormat(locale).format(applications.length)} applications · total annual salary
            </TableCell>
            <TableCell align="end">{currency.format(applications.reduce((sum, row) => sum + row.salary, 0))}</TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}

const meta = {
  title: "Data/Table",
  component: Table,
  args: { size: "md" },
  render: (args) => <ApplicationsTable {...args} />,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function SizeExamples(args: TableProps) {
  const { locale } = useKumiko();
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return (
    <div className="grid min-w-0 gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Table {...args} key={size} size={size} lang={locale} aria-labelledby={`${size}-caption`}>
          <TableCaption id={`${size}-caption`}>{size} job applications</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead align="end">Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Designer</TableCell>
              <TableCell align="end">{currency.format(92000)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ))}
    </div>
  );
}

export const Sizes: Story = {
  render: (args) => <SizeExamples {...args} />,
  play: async ({ canvas }) => {
    for (const [size, height] of [
      ["sm", 40],
      ["md", 48],
      ["lg", 56],
    ] as const) {
      const table = canvas.getByRole("table", { name: `${size} job applications` });
      const row = within(table).getAllByRole("row")[1]!;
      await waitFor(() => expect(row.getBoundingClientRect().height).toBe(height));
    }
  },
};

export const Selection: Story = {
  render: (args) => <ApplicationsTable {...args} selection />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const first = canvas.getByRole("checkbox", { name: "Select Product designer at Kumiko" });
    const second = canvas.getByRole("checkbox", { name: "Select Frontend engineer at Maple Studio" });
    const locked = canvas.getByRole("checkbox", { name: "Select UX researcher at Fieldwork" });
    const table = canvas.getByRole("table", { name: "Job applications" });
    await userEvent.tab();
    // A table that overflows (phone widths) puts its scroll area first.
    if (canvasElement.ownerDocument.activeElement?.matches("[data-slot=table-scroll]")) await userEvent.tab();
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(first).toHaveAttribute("aria-checked", "false");
      expect(first.closest("tr")).not.toHaveAttribute("data-selected");
    });
    await userEvent.keyboard(" ");
    await waitFor(() => expect(first.closest("tr")).toHaveAttribute("data-selected"));
    await userEvent.click(second);
    await waitFor(() => {
      expect(second).toHaveAttribute("aria-checked", "true");
      expect(second.closest("tr")).toHaveAttribute("data-selected");
    });
    await userEvent.click(second);
    await userEvent.click(locked);
    await waitFor(() => {
      expect(locked).toHaveAttribute("aria-disabled", "true");
      expect(locked).toHaveAttribute("aria-checked", "false");
      expect(locked).toHaveAccessibleDescription("Withdrawn applications cannot be selected.");
      expect(locked.closest("tr")).not.toHaveAttribute("data-selected");
      expect(table.querySelectorAll("tbody tr[data-selected]")).toHaveLength(2);
    });
  },
};

export const Wide: Story = {
  render: (args) => (
    <div className="min-w-0 max-w-3xl">
      <ApplicationsTable {...args} wide caption="Wide job applications" />
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    // The table scrolls inside its card, never the page, and its scroll area becomes a Tab stop so keyboards can
    // scroll it (arrow keys scroll natively; synthetic test key events can't show that).
    const region = canvasElement.querySelector<HTMLElement>("[data-slot=table-scroll]")!;
    await waitFor(() => {
      expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    });
    await userEvent.tab();
    await waitFor(() => expect(region).toHaveFocus());
  },
};

export const Footer: Story = { render: (args) => <ApplicationsTable {...args} footer /> };

export const States: Story = {
  render: (args) => (
    <div className="@container min-w-0">
      <div className="grid min-w-0 gap-6 @3xl:grid-cols-2">
        <ApplicationsTable {...args} id="plain-applications" caption="Plain rows" />
        <ApplicationsTable {...args} id="selectable-applications" caption="Selectable rows" selection />
      </div>
    </div>
  ),
};
