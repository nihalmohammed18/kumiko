"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef, PaginationState, RowSelectionState, SortingState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { expect, fn, type UserEventObject, waitFor, within } from "storybook/test";
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

async function sortSalary(
  root: HTMLElement,
  userEvent: UserEventObject,
  catalog: typeof labels.en,
  locale: string,
  desc: boolean,
  keyboard = false,
) {
  const salary = within(root).queryByRole("button", { name: "Salary" });
  const trigger = salary ?? within(root).getByRole("combobox", { name: formatLabel(catalog.sortBy, locale) });
  if (keyboard) {
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard(salary ? "{Enter}" : "{ArrowDown}");
  } else {
    await userEvent.click(trigger);
  }
  if (!salary) {
    const body = within(root.ownerDocument.body);
    const optionName = formatLabel(desc ? catalog.sortDescending : catalog.sortAscending, locale, undefined, {
      label: "Salary",
    });
    await waitFor(() => expect(body.getByRole("listbox")).toBeVisible());
    if (keyboard) {
      await userEvent.keyboard(desc ? "{End}" : "{End}{ArrowUp}");
      await waitFor(() => expect(body.getByRole("option", { name: optionName })).toHaveFocus());
      await userEvent.keyboard("{Enter}");
    } else {
      await userEvent.click(body.getByRole("option", { name: optionName }));
    }
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
  }
}

export const Default: Story = {
  play: async ({ canvas, canvasElement, globals, userEvent, step }) => {
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const table = canvas.getByRole("table", { name: "Job applications" });
    const root = table.closest<HTMLElement>("[data-slot=data-table]")!;
    const header = within(root).getByRole("checkbox", { name: formatLabel(catalog.selectAllRows, locale) });
    const salary = within(table).getByRole("columnheader", { name: "Salary" });
    const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const firstSalary = () => table.querySelector("tbody tr td:last-child");

    await step("Salary sorts the entire dataset by pointer and keyboard", async () => {
      await sortSalary(root, userEvent, catalog, locale, true);
      await waitFor(() => {
        expect(salary).toHaveAttribute("aria-sort", "descending");
        // toHaveTextContent folds the cell's no-break spaces (Arabic puts one before US$), so fold the expectation too.
        expect(firstSalary()).toHaveTextContent(currency.format(128000).replace(/\s/g, " "));
      });
      await sortSalary(root, userEvent, catalog, locale, false, true);
      await waitFor(() => {
        expect(salary).toHaveAttribute("aria-sort", "ascending");
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
    const header = within(table.closest<HTMLElement>("[data-slot=data-table]")!).getByRole("checkbox", {
      name: formatLabel(catalog.selectAllRows, locale),
    });
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
    await sortSalary(table.closest<HTMLElement>("[data-slot=data-table]")!, userEvent, catalog, locale, true);
    await waitFor(() => {
      expect(table.querySelector("th[aria-sort=descending]")).toHaveTextContent("Salary");
      expect(table.closest("[data-slot=data-table]")!.querySelector("[data-slot=data-table-bulk]")).toHaveTextContent(
        formatLabel(catalog.selectedCount, locale, 1),
      );
    });
  },
};

function manyApplications(count: number, locale: string): Application[] {
  const numbers = new Intl.NumberFormat(locale);
  return Array.from({ length: count }, (_, index) => ({
    ...applications[index % applications.length]!,
    id: `application-${index + 1}`,
    role: `Application ${numbers.format(index + 1)}`,
    salary: 80000 + index * 2000,
  }));
}

function LargeTable(props: DataTableProps<Application>) {
  const { locale } = useKumiko();
  const data = useMemo(() => manyApplications(10000, locale), [locale]);
  return <ApplicationsTable {...props} data={data} />;
}

export const TenThousandRows: Story = {
  name: "Ten thousand rows",
  args: { virtualize: true, height: "30rem", pageSize: 0 },
  render: (args) => <LargeTable {...args} />,
  play: async ({ canvas, globals, userEvent, step }) => {
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const table = canvas.getByRole("table");
    const root = table.closest<HTMLElement>("[data-slot=data-table]")!;
    const scroller = root.querySelector<HTMLElement>("[data-slot=table-scroll]")!;
    const lastLabel = `Application ${new Intl.NumberFormat(locale).format(10000)}`;
    const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    await step("Ten thousand rows keep a bounded DOM and preserve offscreen selection", async () => {
      await waitFor(() => {
        expect(table).toHaveAttribute("aria-rowcount", "10001");
        expect(table.querySelectorAll("tr").length).toBeLessThanOrEqual(60);
        expect(table.querySelector("tbody tr:not([data-slot=data-table-spacer])")).toHaveAttribute(
          "aria-rowindex",
          "2",
        );
      });
      await userEvent.click(within(table.querySelector("tbody")!).getAllByRole("checkbox")[0]!);
      for (let index = 0; index < 16; index++) await userEvent.tab();
      await waitFor(() => {
        expect(root.ownerDocument.activeElement?.closest("tbody")).toBe(table.querySelector("tbody"));
        expect(scroller.scrollTop).toBeGreaterThan(0);
        expect(table.querySelectorAll("tr").length).toBeLessThanOrEqual(60);
      });
      await waitFor(() => {
        scroller.scrollTop = scroller.scrollHeight;
        scroller.dispatchEvent(new Event("scroll"));
        expect(within(table).getByText(lastLabel)).toBeVisible();
      });
      const lastRow = within(table).getByText(lastLabel).closest("tr")!;
      await userEvent.click(within(lastRow).getByRole("checkbox"));
      await waitFor(() => {
        expect(lastRow).toHaveAttribute("aria-rowindex", "10001");
        expect(root.querySelector("[data-slot=data-table-bulk]")).toHaveTextContent(
          formatLabel(catalog.selectedCount, locale, 2),
        );
        expect(table.querySelectorAll("tr").length).toBeLessThanOrEqual(60);
      });
    });
    await step("Sorting still considers every row", async () => {
      scroller.scrollTop = 0;
      scroller.dispatchEvent(new Event("scroll"));
      await sortSalary(root, userEvent, catalog, locale, true);
      await waitFor(() => {
        const first = table.querySelector<HTMLTableRowElement>("tbody tr:not([data-slot=data-table-spacer])")!;
        expect(first).toHaveTextContent(lastLabel);
        expect(first.querySelector("td:last-child")).toHaveTextContent(currency.format(20078000).replace(/\s/g, " "));
        expect(within(first).getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
        expect(table.querySelector("th[aria-sort=descending]")).toHaveTextContent("Salary");
        expect(table.querySelectorAll("tr").length).toBeLessThanOrEqual(60);
      });
      // End at rest: TanStack Virtual measures newly rendered rows a frame later and nudges the ones after them.
      await settled(table);
    });
  },
};

/** Waits until the rendered rows stop moving. */
async function settled(table: HTMLElement) {
  let last = "";
  for (let frame = 0; frame < 30; frame++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const now = Array.from(table.querySelectorAll("tbody tr"), (row) => row.getBoundingClientRect().top).join();
    if (now === last) return;
    last = now;
  }
}

const fetchApplications = fn(
  (data: Application[], sorting: SortingState, filter: string, pagination: PaginationState) =>
    new Promise<{ rows: Application[]; rowCount: number }>((resolve) => {
      setTimeout(() => {
        const matches = data.filter((row) =>
          Object.values(row).some((value) => String(value).toLowerCase().includes(filter.toLowerCase())),
        );
        const ordered = matches.toSorted((a, b) => {
          for (const { id, desc } of sorting) {
            const left = a[id as keyof Application];
            const right = b[id as keyof Application];
            const order =
              typeof left === "number" && typeof right === "number"
                ? left - right
                : String(left).localeCompare(String(right), undefined, { numeric: true });
            if (order) return desc ? -order : order;
          }
          return 0;
        });
        const start = pagination.pageIndex * pagination.pageSize;
        resolve({ rows: ordered.slice(start, start + pagination.pageSize), rowCount: matches.length });
      }, 300);
    }),
);

function ServerTable(props: DataTableProps<Application>) {
  const { locale } = useKumiko();
  const data = useMemo(() => manyApplications(200, locale), [locale]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [response, setResponse] = useState<{ rows: Application[]; rowCount: number }>({ rows: [], rowCount: 200 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let current = true;
    setLoading(true);
    void fetchApplications(data, sorting, globalFilter, pagination).then((page) => {
      if (!current) return;
      setResponse(page);
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, [data, sorting, globalFilter, pagination]);
  return (
    <ApplicationsTable
      {...props}
      manual
      data={response.rows}
      rowCount={response.rowCount}
      loading={loading}
      sorting={sorting}
      onSortingChange={setSorting}
      globalFilter={globalFilter}
      onGlobalFilterChange={setFilter}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
}

export const ServerMode: Story = {
  name: "Server mode",
  args: { manual: true },
  render: (args) => <ServerTable {...args} />,
  play: async ({ canvas, globals, userEvent, step }) => {
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const table = canvas.getByRole("table");
    const root = table.closest<HTMLElement>("[data-slot=data-table]")!;
    const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const firstSalary = () => table.querySelector("tbody tr td:last-child");
    await waitFor(() => expect(table).not.toHaveAttribute("aria-busy"));
    await step("Sorting keeps readable rows while fetching the sorted first page", async () => {
      const previous = firstSalary()!.textContent;
      await sortSalary(root, userEvent, catalog, locale, true);
      await waitFor(() => {
        expect(table).toHaveAttribute("aria-busy", "true");
        expect(firstSalary()!.textContent).toBe(previous);
        expect(table.querySelector("[data-slot=skeleton]")).toBeNull();
      });
      await waitFor(() => {
        expect(table).not.toHaveAttribute("aria-busy");
        expect(firstSalary()).toHaveTextContent(currency.format(478000).replace(/\s/g, " "));
        expect(table.querySelectorAll("tbody tr")).toHaveLength(10);
      });
    });
    await step("The filter reports once after debouncing and resets the server page", async () => {
      await userEvent.click(canvas.getByRole("button", { name: formatLabel(catalog.nextPage, locale) }));
      await waitFor(() => {
        expect(table).not.toHaveAttribute("aria-busy");
        expect(firstSalary()).toHaveTextContent(currency.format(458000).replace(/\s/g, " "));
      });
      const before = fetchApplications.mock.calls.length;
      const query = `Application ${new Intl.NumberFormat(locale).format(2)}`;
      const input = canvas.getByRole("searchbox", { name: formatLabel(catalog.filterRows, locale) });
      await userEvent.type(input, query);
      expect(input).toHaveValue(query);
      expect(fetchApplications).toHaveBeenCalledTimes(before);
      await waitFor(() => expect(fetchApplications).toHaveBeenCalledTimes(before + 1));
      expect(fetchApplications.mock.lastCall?.[2]).toBe(query);
      await waitFor(() => {
        expect(table).not.toHaveAttribute("aria-busy");
        expect(canvas.getByRole("button", { name: formatLabel(catalog.page, locale, 1) })).toHaveAttribute(
          "aria-current",
          "page",
        );
        expect(firstSalary()).toHaveTextContent(currency.format(478000).replace(/\s/g, " "));
      });
      expect(fetchApplications).toHaveBeenCalledTimes(before + 1);
    });
  },
};

export const Phone: Story = {
  render: (args) => (
    <div className="w-80 max-w-full">
      <ApplicationsTable {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const table = canvas.getByRole("table");
    const headings = within(table)
      .getAllByRole("columnheader")
      .slice(1)
      .map((header) => header.getAttribute("aria-label"));
    await waitFor(() => {
      expect(table).toHaveAttribute("role", "table");
      expect(getComputedStyle(table).display).toBe("block");
      for (const row of table.querySelectorAll("tbody tr")) {
        const labels = Array.from(row.querySelectorAll("[data-slot=data-table-card-label]"));
        expect(labels.map((label) => label.textContent)).toEqual(headings);
        for (const label of labels) {
          expect(label).toBeVisible();
          expect(label).toHaveAttribute("aria-hidden", "true");
        }
        expect(row.querySelector("td:first-child [data-slot=checkbox]")).toBeInTheDocument();
      }
    });
    const trigger = canvas.getByRole("combobox", { name: formatLabel(catalog.sortBy, locale) });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole("listbox")).toBeVisible());
    await userEvent.keyboard("{End}");
    await waitFor(() =>
      expect(
        body.getByRole("option", { name: formatLabel(catalog.sortDescending, locale, undefined, { label: "Salary" }) }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    await waitFor(() => {
      expect(table.querySelector("th[aria-sort=descending]")).toHaveTextContent("Salary");
      expect(table.querySelector("tbody tr td:last-child")).toHaveTextContent(
        currency.format(128000).replace(/\s/g, " "),
      );
      expect(body.queryByRole("listbox")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
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
      const section = canvasElement.querySelector(`[data-state="${state}"]`)!;
      const button = section.querySelector<HTMLElement>("[data-slot=data-table-sort]")!;
      const control =
        getComputedStyle(button).display === "none" ? section.querySelector("[data-slot=select-trigger]")! : button;
      control.setAttribute("data-demo", demo!);
    }
  },
};
