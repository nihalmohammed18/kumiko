import type { ColumnDef } from "@tanstack/react-table";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { DataTable, type DataTableFeatures, type DataTableProps } from "./data-table.tsx";

type Application = { id: string; role: string; company: string; salary: number };
const data: Application[] = [
  { id: "a", role: "Designer", company: "Maple", salary: 90000 },
  { id: "b", role: "Engineer", company: "Cedar", salary: 120000 },
  { id: "c", role: "Researcher", company: "Maple", salary: 80000 },
];
const columns: ColumnDef<DataTableFeatures, Application>[] = [
  { accessorKey: "role", header: "Role" },
  { accessorKey: "company", header: "Company", enableSorting: false },
  { accessorKey: "salary", header: "Salary", meta: { align: "end" } },
];
function render(props: Partial<DataTableProps<Application>> = {}) {
  return renderToStaticMarkup(
    createElement(DataTable<Application>, {
      columns,
      data,
      caption: "Job applications",
      getRowId: (row) => row.id,
      ...props,
    } as DataTableProps<Application>),
  );
}

it("sorts the complete client dataset before taking a page", () => {
  const html = render({ pageSize: 2, size: "sm", defaultSorting: [{ id: "salary", desc: false }] });
  expect(html).toContain('data-size="sm"');
  expect(html).toMatch(/<caption[^>]*>Job applications<\/caption>/);
  expect(html).toMatch(/<th[^>]*aria-sort="ascending"/);
  expect(html.indexOf("Researcher")).toBeLessThan(html.indexOf("Designer"));
  expect(html).not.toContain("Engineer");
  expect(html).toMatch(/<td[^>]*data-align="end"[^>]*><span[^>]*>Salary<\/span>80000<\/td>/);
  expect(html).not.toMatch(/<button[^>]*>[^<]*Company/);
});

it("globally filters accessor columns before taking a page", () => {
  const html = render({ filter: true, defaultGlobalFilter: "Cedar", pageSize: 1 });
  expect(html).toContain("Engineer");
  expect(html).not.toContain("Designer");
  expect(html).not.toContain("Researcher");
  expect(html).toContain("Filter rows");
});

it("renders all client rows without navigation when pageSize is zero", () => {
  const html = render({ pageSize: 0 });
  expect(html).toContain("Designer");
  expect(html).toContain("Engineer");
  expect(html).toContain("Researcher");
  expect(html).not.toContain('data-slot="pagination"');
});

it("passes selected originals from every page to the bulk actions slot", () => {
  const html = render({
    selectable: true,
    getRowLabel: (row) => row.role,
    rowSelection: { a: true, c: true },
    pageSize: 1,
    bulkActions: (rows) => createElement("span", null, rows.map((row) => row.role).join(", ")),
  });
  expect(html).toContain("2 selected");
  expect(html).toContain("Designer, Researcher");
  expect(html).toMatch(/<tr[^>]*data-selected="true"/);
});

it("names mixed page selection and keeps a disabled checkbox focusable with its visible reason", () => {
  const html = render({
    selectable: true,
    getRowLabel: (row) => row.role,
    defaultRowSelection: { a: true },
    enableRowSelection: (row) => row.id !== "b",
    getRowDisabledReason: () => "Withdrawn applications cannot be selected.",
    pageSize: 0,
  });
  const locked = /<button\b[^>]*aria-label="Select Engineer"[^>]*>/.exec(html)?.[0];
  const header = /<button\b[^>]*aria-label="Select all rows on this page"[^>]*>/.exec(html)?.[0];
  expect(header).toContain('aria-checked="mixed"');
  expect(locked).toContain('aria-disabled="true"');
  expect(locked).toContain('tabindex="0"');
  expect(locked).not.toMatch(/\sdisabled=/);
  const descriptionId = /aria-describedby="([^"]+)"/.exec(locked ?? "")?.[1];
  expect(descriptionId).toBeTruthy();
  expect(html).toContain(`id="${descriptionId}"`);
  expect(html).toContain("Withdrawn applications cannot be selected.");
});

it("distinguishes an empty collection from a filter with no matches", () => {
  expect(render({ data: [] })).toContain("Nothing here yet");
  const filtered = render({ defaultGlobalFilter: "unobtainium" });
  expect(filtered).toContain("No rows match your filter");
  expect(filtered).not.toContain("Nothing here yet");
});

it("replaces data with page-sized skeleton rows and guarantees the table's busy state", () => {
  const html = render({ loading: true, pageSize: 2, "aria-busy": false });
  expect(html).toMatch(/<table[^>]*aria-busy="true"/);
  expect(html.match(/data-slot="skeleton"/g)).toHaveLength(6);
  expect(html).not.toContain("Designer");
  expect(html).not.toContain("Nothing here yet");
});

it("trusts server ordering, filtering and page boundaries and uses the server total for navigation", () => {
  const html = render({
    manual: true,
    rowCount: 200,
    defaultSorting: [{ id: "salary", desc: false }],
    defaultGlobalFilter: "unobtainium",
    pagination: { pageIndex: 1, pageSize: 1 },
  });
  expect(html.indexOf("Designer")).toBeLessThan(html.indexOf("Engineer"));
  expect(html.indexOf("Engineer")).toBeLessThan(html.indexOf("Researcher"));
  expect(html).toContain('aria-label="Page 200"');
});

it("keeps server rows readable while refreshing and uses skeletons only for the first load", () => {
  const html = render({ manual: true, loading: true, pageSize: 2, "aria-busy": false });
  expect(html).toMatch(/<table[^>]*aria-busy="true"/);
  expect(html).toContain("Designer");
  expect(html).toContain("Engineer");
  expect(html).not.toContain('data-slot="skeleton"');
  expect(html).toContain('data-slot="pagination"');
  const firstLoad = render({ manual: true, loading: true, pageSize: 2, data: [] });
  expect(firstLoad.match(/data-slot="skeleton"/g)).toHaveLength(6);
});

it("reserves a single updating status in manual mode and reveals it only while refreshing existing rows", () => {
  const status = (html: string) => /<div[^>]*data-slot="data-table-updating"[^>]*>[\s\S]*?<\/div>/.exec(html)?.[0];
  const updating = status(render({ manual: true, loading: true }));
  expect(updating).toContain('role="status"');
  expect(updating).toContain("Updating results…");
  expect(updating).toContain('data-slot="spinner"');
  expect(updating).not.toContain("invisible");
  expect(status(render({ manual: true }))).toContain("invisible");
  expect(status(render({ manual: true, loading: true, data: [] }))).toContain("invisible");
  expect(status(render({ loading: true }))).toBeUndefined();
});

it("bounds the initial DOM for ten thousand rows while exposing the full row count and logical row indexes", () => {
  const html = render({
    virtualize: true,
    height: "30rem",
    pageSize: 0,
    data: Array.from({ length: 10000 }, (_, index) => ({
      ...data[0]!,
      id: String(index),
      role: `Application ${index}`,
    })),
  });
  expect(html.match(/<tr\b/g)?.length).toBeLessThanOrEqual(60);
  expect(html).toMatch(/<table[^>]*aria-rowcount="10001"/);
  expect(html).toMatch(/<tr[^>]*aria-rowindex="2"/);
  expect(html).not.toContain("Application 9999");
});

it("keeps explicit table roles and hidden per-cell header labels alongside the card sorting control", () => {
  const html = render();
  expect(html).toMatch(/<table[^>]*role="table"/);
  expect(html).toMatch(/<thead[^>]*role="rowgroup"/);
  expect(html).toMatch(/<tbody[^>]*role="rowgroup"/);
  expect(html).toMatch(/<tr[^>]*role="row"/);
  expect(html).toMatch(/<th[^>]*role="columnheader"[^>]*aria-label="Salary"/);
  expect(html).toMatch(/<td[^>]*role="cell"/);
  expect(html).toMatch(/<span[^>]*data-slot="data-table-card-label"[^>]*aria-hidden="true"[^>]*>Role<\/span>/);
  expect(html).toContain('data-slot="data-table-card-tools"');
  expect(html).toContain("Sort by");
});
