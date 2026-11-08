"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef, PaginationState, RowSelectionState, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { formatLabel, labels } from "../labels.ts";
import { useKumiko } from "../provider.tsx";
import { Badge } from "./badge.tsx";
import { Button } from "./button.tsx";
import { DataTable, type DataTableFeatures, type DataTableProps } from "./data-table.tsx";

type Application = {
  id: string;
  role: string;
  company: string;
  applied: string;
  status: "Applied" | "Interview" | "Offer" | "Withdrawn";
  salary: number;
};
const roles = ["Product designer", "Frontend engineer", "Design systems engineer", "UX researcher", "Product manager"];
const companies = ["Kumiko", "Maple Studio", "Cedar Labs", "Fieldwork", "Northstar"];
const statuses = ["Applied", "Interview", "Offer", "Withdrawn"] as const;
const applications: Application[] = Array.from({ length: 25 }, (_, index) => ({
  id: `application-${index + 1}`,
  role: roles[index % roles.length]!,
  company: companies[Math.floor(index / 5)]!,
  applied: `2026-10-${String(index + 1).padStart(2, "0")}`,
  status: statuses[index % statuses.length]!,
  salary: 80000 + ((index * 7) % 25) * 2000,
}));
const pendingApplications: Application[] = [];
const rowLabel = (row: Application) => `${row.role} at ${row.company}`;
const disabledReason = "Withdrawn applications cannot be selected.";

function applicationColumns(locale: string): ColumnDef<DataTableFeatures, Application>[] {
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const dates = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });
  return [
    { accessorKey: "role", header: "Role" },
    { accessorKey: "company", header: "Company" },
    {
      accessorKey: "applied",
      header: "Applied date",
      cell: ({ cell }) => {
        const date = cell.getValue<string>();
        return <time dateTime={date}>{dates.format(new Date(date))}</time>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          tone={row.original.status === "Offer" ? "success" : row.original.status === "Interview" ? "info" : "neutral"}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "salary",
      header: "Salary",
      meta: { align: "end" },
      cell: ({ cell }) => currency.format(cell.getValue<number>()),
    },
  ];
}

function ApplicationsTable(props: DataTableProps<Application>) {
  const { locale } = useKumiko();
  const columns = useMemo(() => applicationColumns(locale), [locale]);
  return <DataTable {...props} columns={columns} />;
}

const meta = {
  title: "Data/DataTable",
  component: DataTable<Application>,
  args: {
    columns: applicationColumns("en"),
    data: applications,
    caption: "Job applications",
    getRowId: (row: Application) => row.id,
    selectable: true,
    getRowLabel: rowLabel,
    filter: true,
    bulkActions: () => (
      <Button size="sm" tone="ghost">
        Export selected
      </Button>
    ),
  },
  render: (args) => <ApplicationsTable {...args} />,
} satisfies Meta<typeof DataTable<Application>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, globals, userEvent, step }) => {
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const table = canvas.getByRole("table", { name: "Job applications" });
    const root = table.closest("[data-slot=data-table]")!;
    const header = within(table).getByRole("checkbox", { name: formatLabel(catalog.selectAllRows, locale) });
    const salary = within(table).getByRole("button", { name: "Salary" });
    const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const firstSalary = () => table.querySelector("tbody tr td:last-child");

    await step("Salary sorts the entire dataset by pointer and keyboard", async () => {
      await userEvent.click(salary);
      await waitFor(() => {
        expect(salary.closest("th")).toHaveAttribute("aria-sort", "descending");
        // toHaveTextContent folds the cell's no-break spaces (Arabic puts one before US$), so fold the expectation too.
        expect(firstSalary()).toHaveTextContent(currency.format(128000).replace(/\s/g, " "));
      });
      await userEvent.tab({ shift: true });
      await userEvent.tab();
      await waitFor(() => expect(salary).toHaveFocus());
      await userEvent.keyboard("{Enter}");
      await waitFor(() => {
        expect(salary.closest("th")).toHaveAttribute("aria-sort", "ascending");
        expect(firstSalary()).toHaveTextContent(currency.format(80000).replace(/\s/g, " "));
      });
    });
    await step("Select all affects only the current page", async () => {
      await userEvent.click(canvas.getByRole("button", { name: formatLabel(catalog.nextPage, locale) }));
      await waitFor(() =>
        expect(canvas.getByRole("button", { name: formatLabel(catalog.page, locale, 2) })).toHaveAttribute(
          "aria-current",
          "page",
        ),
      );
      await userEvent.click(header);
      await waitFor(() => {
        expect(root.querySelector("[data-slot=data-table-bulk]")).toHaveTextContent(
          formatLabel(catalog.selectedCount, locale, 10),
        );
        expect(header).toHaveAttribute("aria-checked", "true");
      });
      await userEvent.click(header);
      await waitFor(() => expect(root.querySelector("[data-slot=data-table-bulk]")).toBeNull());
    });
    await step("Filtering narrows the rows and resets to page one", async () => {
      await userEvent.type(canvas.getByRole("searchbox", { name: formatLabel(catalog.filterRows, locale) }), "Maple");
      await waitFor(() => {
        expect(table.querySelectorAll("tbody tr")).toHaveLength(5);
        expect(canvas.getByRole("button", { name: formatLabel(catalog.previousPage, locale) })).toBeDisabled();
        expect(canvas.getByRole("button", { name: formatLabel(catalog.page, locale, 1) })).toHaveAttribute(
          "aria-current",
          "page",
        );
      });
    });
    await step("Selecting two rows shows the bulk count and a mixed header", async () => {
      const choices = within(table.querySelector("tbody")!).getAllByRole("checkbox");
      await userEvent.click(choices[0]!);
      await userEvent.click(choices[1]!);
      await waitFor(() => {
        expect(root.querySelector("[data-slot=data-table-bulk]")).toHaveTextContent(
          formatLabel(catalog.selectedCount, locale, 2),
        );
        expect(header).toHaveAttribute("aria-checked", "mixed");
        expect(table.querySelectorAll("tbody tr[data-selected]")).toHaveLength(2);
        expect(canvasElement.ownerDocument.querySelector('[role="status"][aria-live="polite"]')).toHaveTextContent(
          formatLabel(catalog.selectedCount, locale, 2),
        );
      });
    });
  },
};

export const DisabledRows: Story = {
  name: "Disabled rows",
  args: {
    data: applications.slice(0, 8),
    pageSize: 0,
    enableRowSelection: (row) => row.original.status !== "Withdrawn",
    getRowDisabledReason: () => disabledReason,
  },
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const table = canvas.getByRole("table");
    const locked = within(table)
      .getAllByRole("checkbox")
      .filter((control) => control.getAttribute("aria-disabled") === "true");
    await waitFor(() => {
      expect(locked).toHaveLength(2);
      for (const control of locked) {
        expect(control).toHaveAccessibleDescription(disabledReason);
        expect(within(control.closest("tr")!).getByText(disabledReason)).toBeVisible();
      }
    });
    const header = within(table).getByRole("checkbox", { name: formatLabel(catalog.selectAllRows, locale) });
    await userEvent.click(header);
    for (let i = 0; i < 18 && canvasElement.ownerDocument.activeElement !== locked[0]; i++) await userEvent.tab();
    await waitFor(() => expect(locked[0]).toHaveFocus());
    await userEvent.keyboard(" {Enter}");
    await userEvent.click(locked[1]!);
    await waitFor(() => {
      for (const control of locked) expect(control).toHaveAttribute("aria-checked", "false");
      expect(header).toHaveAttribute("aria-checked", "true");
      expect(table.querySelectorAll("tbody tr[data-selected]")).toHaveLength(6);
    });
  },
};

export const Empty: Story = {
  args: { data: [], emptyDescription: "Your job applications will appear here." },
  play: async ({ canvas, globals }) => {
    await waitFor(() =>
      expect(
        canvas.getByRole("heading", { name: globals.dir === "rtl" ? labels.ar.noRows : labels.en.noRows }),
      ).toBeVisible(),
    );
  },
};

export const NoMatches: Story = {
  name: "No matches",
  args: { defaultGlobalFilter: "unobtainium" },
  play: async ({ canvas, globals }) => {
    await waitFor(() =>
      expect(
        canvas.getByRole("heading", {
          name: globals.dir === "rtl" ? labels.ar.noMatchingRows : labels.en.noMatchingRows,
        }),
      ).toBeVisible(),
    );
  },
};

export const Loading: Story = {
  args: { loading: true, data: [] },
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table");
    await waitFor(() => {
      expect(table).toHaveAttribute("aria-busy", "true");
      expect(table.querySelectorAll("tbody tr")).toHaveLength(10);
      expect(table.querySelectorAll("[data-slot=skeleton]")).toHaveLength(60);
    });
  },
};

function ControlledTable(props: DataTableProps<Application>) {
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setFilter] = useState("");
  const [rowSelection, setSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 1, pageSize: 10 });
  return (
    <div className="grid min-w-0 gap-4">
      <ApplicationsTable
        {...props}
        data={loading ? pendingApplications : props.data}
        loading={loading}
        sorting={sorting}
        onSortingChange={setSorting}
        globalFilter={globalFilter}
        onGlobalFilterChange={setFilter}
        rowSelection={rowSelection}
        onRowSelectionChange={setSelection}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
      <Button size="sm" onClick={() => setLoading((value) => !value)} className="justify-self-start">
        Toggle loading
      </Button>
    </div>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledTable {...args} />,
  play: async ({ canvas, globals, userEvent }) => {
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: formatLabel(catalog.page, locale, 2) })).toHaveAttribute(
        "aria-current",
        "page",
      ),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Toggle loading" }));
    await waitFor(() => expect(canvas.getByRole("table")).toHaveAttribute("aria-busy", "true"));
    await userEvent.click(canvas.getByRole("button", { name: "Toggle loading" }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: formatLabel(catalog.page, locale, 2) })).toHaveAttribute(
        "aria-current",
        "page",
      ),
    );
    await userEvent.type(canvas.getByRole("searchbox", { name: formatLabel(catalog.filterRows, locale) }), "Maple");
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: formatLabel(catalog.previousPage, locale) })).toBeDisabled(),
    );
    const table = canvas.getByRole("table");
    await userEvent.click(within(table.querySelector("tbody")!).getAllByRole("checkbox")[0]!);
    await userEvent.click(within(table).getByRole("button", { name: "Salary" }));
    await waitFor(() => {
      expect(table.querySelector("th[aria-sort=descending]")).toHaveTextContent("Salary");
      expect(table.closest("[data-slot=data-table]")!.querySelector("[data-slot=data-table-bulk]")).toHaveTextContent(
        formatLabel(catalog.selectedCount, locale, 1),
      );
    });
  },
};

export const States: Story = {
  render: (args) => (
    <div className="@container min-w-0">
      <div className="grid min-w-0 gap-6 @3xl:grid-cols-2">
        {[
          "Rest",
          "Hover",
          "Press",
          "Focus",
          "Ascending",
          "Descending",
          "Selected",
          "Disabled",
          "Empty",
          "No matches",
          "Loading",
        ].map((state) => (
          <section key={state} data-state={state} className="min-w-0">
            <ApplicationsTable
              {...args}
              caption={`${state} job applications`}
              data={state === "Empty" || state === "Loading" ? [] : applications.slice(0, state === "Disabled" ? 4 : 2)}
              pageSize={state === "Loading" ? 2 : 0}
              filter={state === "No matches"}
              loading={state === "Loading"}
              defaultGlobalFilter={state === "No matches" ? "unobtainium" : ""}
              defaultSorting={
                state === "Ascending" || state === "Descending" ? [{ id: "salary", desc: state === "Descending" }] : []
              }
              defaultRowSelection={state === "Selected" ? { "application-1": true } : {}}
              enableRowSelection={state === "Disabled" ? (row) => row.original.status !== "Withdrawn" : true}
              getRowDisabledReason={() => disabledReason}
            />
          </section>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const [state, demo] of [
      ["Hover", "hover"],
      ["Press", "active"],
      ["Focus", "focus"],
    ]) {
      canvasElement
        .querySelector(`[data-state="${state}"] [data-slot=data-table-sort]`)!
        .setAttribute("data-demo", demo!);
    }
  },
};
