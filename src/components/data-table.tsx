"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import {
  type Column,
  type ColumnDef,
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  filterFn_includesString,
  globalFilteringFeature,
  metaHelper,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowData,
  type RowSelectionState,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type SortingState,
  sortFns,
  type TableOptions,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { useTableVirtualizer } from "../lib/use-table-virtualizer.ts";
import { useKumiko } from "../provider.tsx";
import { Button } from "./button.tsx";
import { Checkbox } from "./checkbox.tsx";
import { EmptyState } from "./empty-state.tsx";
import { Field, FieldLabel } from "./field.tsx";
import { Pagination } from "./pagination.tsx";
import { SearchField } from "./search-field.tsx";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "./select.tsx";
import { Skeleton } from "./skeleton.tsx";
import { Spinner } from "./spinner.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  type TableProps,
  TableRow,
} from "./table.tsx";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnMeta: metaHelper<{
    align?: "start" | "end";
    label?: string;
    card?: "title" | "subtitle" | "badge" | "detail" | "hidden";
  }>(),
});

const cardOrder = { title: 0, subtitle: 1, badge: 2, detail: 3, hidden: 4 };
const cardSelectionStyle: CSSProperties = {
  position: "absolute",
  insetBlockStart: 0,
  insetInlineEnd: 0,
  display: "grid",
  placeItems: "center",
  inlineSize: "3rem",
  blockSize: "3rem",
  padding: 0,
  borderBlockEnd: 0,
};
const cardCellStyles: Partial<Record<keyof typeof cardOrder, CSSProperties>> = {
  title: { borderBlockEnd: 0, paddingBlockEnd: "0.25rem" },
  subtitle: { borderBlockEnd: 0, paddingBlockStart: 0, paddingBlockEnd: "0.25rem" },
  badge: {
    display: "inline-flex",
    flexWrap: "wrap",
    maxInlineSize: "100%",
    minInlineSize: 0,
    overflowWrap: "anywhere",
    borderBlockEnd: 0,
  },
};

/** DataTable's TanStack v9 feature type, with optional logical alignment, plain header text and card placement in meta.
 * Use when: typing ColumnDef<DataTableFeatures, Row> or createColumnHelper<DataTableFeatures, Row>().
 * Avoid when: defining a separate TanStack table with different features.
 */
export type DataTableFeatures = typeof features;

/** Native table props, TanStack column definitions and controlled or default state.
 * Use when: typing DataTable; native props and refs target its table. Avoid when: typing an individual table cell.
 */
export type DataTableProps<TData extends RowData> = Omit<TableProps, "children" | "toolbar"> & {
  columns: ReadonlyArray<ColumnDef<DataTableFeatures, TData>>;
  data: ReadonlyArray<TData>;
  caption: string;
  getRowId?: TableOptions<DataTableFeatures, TData>["getRowId"];
  enableSorting?: boolean;
  sorting?: SortingState;
  defaultSorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  filter?: boolean;
  filterLabel?: string;
  globalFilter?: string;
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
  /** Default rows per page; zero renders every row without pagination. */
  pageSize?: number;
  pagination?: PaginationState;
  defaultPagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  rowSelection?: RowSelectionState;
  defaultRowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  enableRowSelection?: TableOptions<DataTableFeatures, TData>["enableRowSelection"];
  getRowDisabledReason?: (row: TData) => string | null | undefined;
  /** Actions for the selection, given every selected row in data: rows the filter hides and rows on other pages too.
   * In manual mode that means the selected rows currently loaded. */
  bulkActions?: (selectedRows: TData[]) => ReactNode;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Decorative empty-state art; products choose whether to use the cast or objects. */
  emptyArt?: ReactNode;
  /** Replaces empty-state actions, including the default clear-filter action. */
  emptyActions?: ReactNode;
  loading?: boolean;
  /** Trust supplied rows and report sorting, filtering and pagination to the server. */
  manual?: boolean;
  /** Total matching server rows, used to calculate the page count in manual mode. */
  rowCount?: number;
} & ({ virtualize: true; height: string } | { virtualize?: false; height?: never }) &
  (
    | { selectable: true; getRowLabel: (row: TData) => string }
    | { selectable?: false; getRowLabel?: (row: TData) => string }
  );

function useDataTableState<T>(controlled: T | undefined, defaultValue: T, onChange?: OnChangeFn<T>) {
  const [local, setLocal] = useState(defaultValue);
  const change = useCallback<OnChangeFn<T>>(
    (updater) => {
      if (controlled === undefined) setLocal(updater);
      onChange?.(updater);
    },
    [controlled, onChange],
  );
  return [controlled === undefined ? local : controlled, change] as const;
}

function columnLabel<TData extends RowData>(column: Column<DataTableFeatures, TData>) {
  return (
    column.columnDef.meta?.label ?? (typeof column.columnDef.header === "string" ? column.columnDef.header : column.id)
  );
}

function DataTableRow<TData extends RowData>({
  row,
  selectionLabel,
  disabledReason,
  cardMode,
  headerId,
  index,
  rowIndex,
  measure,
}: {
  row: Row<DataTableFeatures, TData>;
  selectionLabel?: string;
  disabledReason?: string | null;
  cardMode: boolean;
  headerId: string;
  index?: number;
  rowIndex?: number;
  measure?: Ref<HTMLTableRowElement>;
}) {
  const reasonId = useId();
  const reason = !row.getCanSelect() ? disabledReason : undefined;
  const cells = row.getAllCells();
  const orderedCells = cardMode
    ? cells.toSorted(
        (a, b) =>
          cardOrder[a.column.columnDef.meta?.card ?? "detail"] - cardOrder[b.column.columnDef.meta?.card ?? "detail"],
      )
    : cells;
  return (
    <TableRow
      role="row"
      ref={measure}
      data-index={index}
      aria-rowindex={rowIndex}
      selected={selectionLabel !== undefined && row.getIsSelected()}
      style={cardMode && selectionLabel !== undefined ? { position: "relative", minBlockSize: "3rem" } : undefined}
    >
      {selectionLabel !== undefined && (
        <TableCell role="cell" data-selection className="w-12" style={cardMode ? cardSelectionStyle : undefined}>
          <Checkbox
            nativeButton
            render={<BaseButton focusableWhenDisabled={Boolean(reason)} tabIndex={reason ? 0 : undefined} />}
            aria-label={selectionLabel}
            aria-describedby={reason ? reasonId : undefined}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(_, details) => row.getToggleSelectedHandler()(details.event)}
          />
        </TableCell>
      )}
      {orderedCells.map((cell, index) => (
        <TableCell
          key={cell.id}
          role="cell"
          headers={cardMode ? `${headerId}-${cell.column.id}` : undefined}
          align={cell.column.columnDef.meta?.align}
          data-card={cell.column.columnDef.meta?.card ?? "detail"}
          style={
            cardMode
              ? {
                  ...cardCellStyles[cell.column.columnDef.meta?.card ?? "detail"],
                  paddingInlineEnd: selectionLabel !== undefined && index === 0 ? "3.5rem" : undefined,
                }
              : undefined
          }
          className={
            cardMode && cell.column.columnDef.meta?.card === "title"
              ? "font-display text-body font-bold"
              : cardMode && cell.column.columnDef.meta?.card === "subtitle"
                ? "text-ink-muted"
                : undefined
          }
        >
          {(cell.column.columnDef.meta?.card ?? "detail") === "detail" && (
            <span data-slot="data-table-card-label" aria-hidden className="text-label font-bold text-ink-muted">
              {columnLabel(cell.column)}
            </span>
          )}
          <FlexRender cell={cell} />
          {selectionLabel !== undefined && reason && index === 0 && (
            <span id={reasonId} className="block wrap-break-word text-body-sm text-ink-muted">
              {reason}
            </span>
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}

function DataTableSpacer({ height, columns }: { height: number; columns: number }) {
  return height > 0 ? (
    <tr data-slot="data-table-spacer" aria-hidden style={{ blockSize: height }}>
      <td colSpan={columns} />
    </tr>
  ) : null;
}

/** A named table with sorting, global filtering, row selection and page navigation.
 * Use when: browsing client data or server pages with Kumiko's table parts. Avoid when: laying out unrelated content.
 * Keep data and columns stable; column meta.align="end" aligns numeric headers and cells.
 * Rows become cards below 30rem of card width (phones). Supply meta.label for headers that render custom markup.
 * meta.card groups title, subtitle, badge and detail cells in reading order; hidden cells remain screen-reader readable. Defaults to detail.
 * For a failed server refresh, compose a danger Alert with a retry Button above the table and retain its rows and filter.
 * virtualize requires a CSS height; use pageSize=0 to virtualize the whole dataset. --kumiko-data-table-height sizes its scroll area.
 *
 * @example
 * import { useMemo } from "react";
 * const applications = [{ id: "a1", role: "Frontend engineer", status: "Interview", salary: 90000 }];
 * function ApplicationsPage() {
 *   const { locale } = useKumiko();
 *   const columns = useMemo<DataTableProps<(typeof applications)[number]>["columns"]>(() => [
 *     { accessorKey: "role", header: "Role" },
 *     { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge>{row.original.status}</Badge> },
 *     { accessorKey: "salary", header: "Salary", meta: { align: "end" }, cell: ({ row }) =>
 *       new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(row.original.salary) },
 *   ], [locale]);
 *   return <DataTable caption="Job applications" data={applications} columns={columns} filter selectable
 *     getRowId={(row) => row.id} getRowLabel={(row) => row.role} />;
 * }
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  caption,
  getRowId,
  enableSorting = true,
  sorting,
  defaultSorting = [],
  onSortingChange,
  filter = false,
  filterLabel,
  globalFilter,
  defaultGlobalFilter = "",
  onGlobalFilterChange,
  pageSize = 10,
  pagination,
  defaultPagination,
  onPaginationChange,
  selectable = false,
  getRowLabel,
  rowSelection,
  defaultRowSelection = {},
  onRowSelectionChange,
  enableRowSelection,
  getRowDisabledReason,
  bulkActions,
  emptyTitle,
  emptyDescription,
  emptyArt,
  emptyActions,
  loading = false,
  manual = false,
  rowCount,
  virtualize = false,
  height,
  size,
  ...props
}: DataTableProps<TData>) {
  const { labels, locale, announce } = useKumiko();
  const headerId = useId();
  const [sort, changeSorting] = useDataTableState(sorting, defaultSorting, onSortingChange);
  const [query, changeFilter] = useDataTableState(globalFilter, defaultGlobalFilter, onGlobalFilterChange);
  const [paging, changePagination] = useDataTableState(
    pagination,
    defaultPagination ?? { pageIndex: 0, pageSize },
    onPaginationChange,
  );
  const [selection, changeSelection] = useDataTableState(rowSelection, defaultRowSelection, onRowSelectionChange);
  const [filterInput, setFilterInput] = useState(query);
  const filterRef = useRef<HTMLInputElement>(null);
  useEffect(() => setFilterInput(query), [query]);
  const reportFilter = useCallback(
    (next: string) => {
      // Batch the page reset with the query so a server doesn't fetch the old page first.
      if (paging.pageIndex !== 0) changePagination((old) => ({ ...old, pageIndex: 0 }));
      changeFilter(next);
    },
    [paging.pageIndex, changePagination, changeFilter],
  );
  const filterReporter = useRef(reportFilter);
  useEffect(() => {
    filterReporter.current = reportFilter;
  }, [reportFilter]);
  useEffect(() => {
    if (!manual || filterInput === query) return;
    const timeout = setTimeout(() => filterReporter.current(filterInput), 300);
    return () => clearTimeout(timeout);
  }, [manual, filterInput, query]);
  const table = useTable({
    features,
    columns,
    data,
    getRowId,
    enableSorting,
    enableRowSelection,
    initialState: { sorting: sort, globalFilter: query, pagination: paging, rowSelection: selection },
    state: { sorting: sort, globalFilter: query, pagination: paging, rowSelection: selection },
    onSortingChange: changeSorting,
    onGlobalFilterChange: changeFilter,
    onPaginationChange: changePagination,
    onRowSelectionChange: changeSelection,
    autoResetPageIndex: false,
    manualSorting: manual,
    manualFiltering: manual,
    manualPagination: manual || pageSize === 0 || paging.pageSize === 0,
    rowCount: manual ? rowCount : undefined,
  });
  const pageCount = table.getPageCount();
  const rows = table.getRowModel().rows;
  const groups = table.getHeaderGroups();
  const leafColumns = table.getAllLeafColumns();
  const sortItems = useMemo(
    () => [
      { value: "", label: formatLabel(labels.sortNone, locale), sorting: [] as SortingState },
      ...leafColumns
        .filter((column) => enableSorting && column.getCanSort())
        .flatMap((column) =>
          [false, true].map((desc) => ({
            value: `${column.id}:${desc ? "desc" : "asc"}`,
            label: formatLabel(desc ? labels.sortDescending : labels.sortAscending, locale, undefined, {
              label: columnLabel(column),
            }),
            sorting: [{ id: column.id, desc }],
          })),
        ),
    ],
    [leafColumns, labels, locale, enableSorting],
  );
  const perPage = pageSize === 0 ? 0 : paging.pageSize;
  const placeholderCount = Number.isFinite(perPage) && perPage > 0 ? Math.trunc(perPage) : data.length || 10;
  const showSkeleton = loading && (!manual || rows.length === 0);
  const getItemKey = useCallback(
    (index: number) => (showSkeleton ? `skeleton-${index}` : rows[index]!.id),
    [showSkeleton, rows],
  );
  const { rootRef, bodyRef, virtualizer } = useTableVirtualizer({
    enabled: virtualize,
    size,
    count: showSkeleton ? placeholderCount : rows.length,
    getItemKey,
  });
  const [cardMode, setCardMode] = useState(false);
  useEffect(() => {
    const card = rootRef.current?.querySelector<HTMLElement>("[data-slot=table-card]");
    if (!card) return;
    // Match the card's content width to the CSS query so DOM reading order changes only in cards.
    const observer = new ResizeObserver(([entry]) => {
      const rem = Number.parseFloat(getComputedStyle(card.ownerDocument.documentElement).fontSize);
      setCardMode(entry!.contentRect.width < 30 * rem);
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, [rootRef]);
  const cardColumns = cardMode
    ? leafColumns.toSorted(
        (a, b) => cardOrder[a.columnDef.meta?.card ?? "detail"] - cardOrder[b.columnDef.meta?.card ?? "detail"],
      )
    : leafColumns;
  const items = virtualizer.getVirtualItems();
  const indexes = virtualize
    ? items.map((item) => item.index)
    : Array.from({ length: showSkeleton ? placeholderCount : rows.length }, (_, index) => index);
  const before = items.length ? items[0]!.start - virtualizer.options.scrollMargin : 0;
  const after = items.length
    ? virtualizer.getTotalSize() - items[items.length - 1]!.end + virtualizer.options.scrollMargin
    : 0;
  const rowOffset = perPage > 0 && Number.isFinite(perPage) ? paging.pageIndex * perPage : 0;
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const selectedCount = selectable ? selectedRows.length : 0;
  const selectedText = formatLabel(labels.selectedCount, locale, selectedCount);
  const previousCount = useRef(0);
  useEffect(() => {
    if (previousCount.current !== selectedCount) {
      previousCount.current = selectedCount;
      // Defer past provider effect replay, which clears pending announcements.
      queueMicrotask(() => announce(selectedText));
    }
  }, [selectedCount, selectedText, announce]);
  const previousPageInputs = useRef({ query, pageSize });
  useEffect(() => {
    const filterChanged = previousPageInputs.current.query !== query;
    const sizeChanged = previousPageInputs.current.pageSize !== pageSize;
    previousPageInputs.current = { query, pageSize };
    const lastPage = Math.max(0, pageCount - 1);
    if (sizeChanged && pagination === undefined) {
      changePagination((old) => ({ ...old, pageIndex: 0, pageSize }));
    } else if (filterChanged && paging.pageIndex !== 0) {
      table.firstPage();
    } else if (!loading && perPage > 0 && paging.pageIndex > lastPage) {
      table.setPageIndex(lastPage);
    }
  }, [query, pageSize, pagination, paging.pageIndex, pageCount, perPage, loading, table, changePagination]);

  function selectAll(labelled = false) {
    return (
      <Checkbox
        nativeButton
        render={<button type="button" />}
        aria-label={formatLabel(labels.selectAllRows, locale)}
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={!table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()}
        disabled={loading || !rows.some((row) => row.getCanSelect())}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      >
        {labelled ? formatLabel(labels.selectAllRows, locale) : undefined}
      </Checkbox>
    );
  }

  return (
    <div
      ref={rootRef}
      data-slot="data-table"
      data-virtualize={virtualize || undefined}
      dir={props.dir}
      lang={props.lang ?? locale}
      className="@container min-w-0 max-w-full space-y-4"
      style={virtualize ? ({ "--kumiko-data-table-height": height } as CSSProperties) : undefined}
    >
      {filter && (
        <Field>
          <FieldLabel>{filterLabel ?? formatLabel(labels.filterRows, locale)}</FieldLabel>
          <SearchField
            ref={filterRef}
            value={manual ? filterInput : query}
            onValueChange={manual ? setFilterInput : changeFilter}
          />
        </Field>
      )}
      {selectedCount > 0 && (
        <div
          data-slot="data-table-bulk"
          className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-control border-2 border-brand-text bg-brand-tint px-3 py-2 text-body-sm text-brand-text"
        >
          <span className="min-w-0 wrap-anywhere font-bold">{selectedText}</span>
          {bulkActions && (
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 [&>*]:max-w-full">
              {bulkActions(selectedRows)}
            </div>
          )}
        </div>
      )}
      {manual && (
        <div
          data-slot="data-table-updating"
          role="status"
          className={`flex min-w-0 items-center gap-2 text-body-sm text-ink-muted${loading && rows.length > 0 ? "" : " invisible"}`}
        >
          <Spinner />
          <span className="min-w-0 wrap-break-word">{formatLabel(labels.updatingResults, locale)}</span>
        </div>
      )}
      <Table
        {...props}
        role="table"
        data-cards
        size={size}
        aria-busy={loading || undefined}
        aria-rowcount={virtualize ? table.getRowCount() + groups.length : props["aria-rowcount"]}
        toolbar={
          (selectable || sortItems.length > 1) && (
            <div data-slot="data-table-card-tools" className="min-w-0 gap-3 p-3">
              {selectable && selectAll(true)}
              {sortItems.length > 1 && (
                <Field>
                  <FieldLabel>{formatLabel(labels.sortBy, locale)}</FieldLabel>
                  <Select
                    items={sortItems}
                    value={sort[0] ? `${sort[0].id}:${sort[0].desc ? "desc" : "asc"}` : ""}
                    onValueChange={(value) =>
                      table.setSorting(sortItems.find((item) => item.value === value)?.sorting ?? [])
                    }
                  >
                    <SelectTrigger size={size}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {sortItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </Field>
              )}
            </div>
          )
        }
      >
        <TableCaption>{caption}</TableCaption>
        <TableHeader role="rowgroup">
          {groups.map((group, index) => (
            <TableRow key={group.id} role="row" aria-rowindex={virtualize ? index + 1 : undefined}>
              {selectable && index === 0 && (
                <TableHead
                  role="columnheader"
                  aria-label={formatLabel(labels.selectAllRows, locale)}
                  rowSpan={groups.length}
                  className="w-12"
                >
                  {selectAll()}
                </TableHead>
              )}
              {group.headers.map((header) => {
                const sortable = !header.isPlaceholder && header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon;
                return (
                  <TableHead
                    key={header.id}
                    role="columnheader"
                    id={header.isPlaceholder ? undefined : `${headerId}-${header.column.id}`}
                    aria-label={columnLabel(header.column)}
                    colSpan={header.colSpan}
                    scope={header.subHeaders.length ? "colgroup" : "col"}
                    align={header.column.columnDef.meta?.align}
                    aria-sort={
                      sortable
                        ? sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                    className={sortable ? "h-(--kumiko-table-row-height) p-0" : undefined}
                  >
                    {header.isPlaceholder ? null : sortable ? (
                      <BaseButton
                        data-slot="data-table-sort"
                        className="press press-ghost flex h-full min-h-control-sm w-full min-w-0 items-center justify-start gap-2 px-3 py-1 text-start font-body text-label font-bold text-ink"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="min-w-0 wrap-break-word">
                          <FlexRender header={header} />
                        </span>
                        <Icon className="size-4 shrink-0" />
                      </BaseButton>
                    ) : (
                      <FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody ref={bodyRef} role="rowgroup">
          {virtualize && <DataTableSpacer height={before} columns={leafColumns.length + (selectable ? 1 : 0)} />}
          {showSkeleton ? (
            indexes.map((index) => (
              <TableRow
                key={`skeleton-${index}`}
                role="row"
                aria-hidden
                data-index={virtualize ? index : undefined}
                ref={virtualize ? virtualizer.measureElement : undefined}
                style={cardMode && selectable ? { position: "relative", minBlockSize: "3rem" } : undefined}
              >
                {selectable && (
                  <TableCell
                    role="cell"
                    data-selection
                    className="w-12"
                    style={cardMode ? cardSelectionStyle : undefined}
                  >
                    <Skeleton className="size-6" />
                  </TableCell>
                )}
                {cardColumns.map((column, columnIndex) => (
                  <TableCell
                    key={column.id}
                    role="cell"
                    align={column.columnDef.meta?.align}
                    data-card={column.columnDef.meta?.card ?? "detail"}
                    style={
                      cardMode
                        ? {
                            ...cardCellStyles[column.columnDef.meta?.card ?? "detail"],
                            paddingInlineEnd: selectable && columnIndex === 0 ? "3.5rem" : undefined,
                          }
                        : undefined
                    }
                  >
                    {(column.columnDef.meta?.card ?? "detail") === "detail" && (
                      <span
                        data-slot="data-table-card-label"
                        aria-hidden
                        className="text-label font-bold text-ink-muted"
                      >
                        {columnLabel(column)}
                      </span>
                    )}
                    <Skeleton shape="text" className="w-full min-w-6" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            indexes.map((index) => {
              const row = rows[index]!;
              return (
                <DataTableRow
                  key={row.id}
                  row={row}
                  cardMode={cardMode}
                  headerId={headerId}
                  index={virtualize ? index : undefined}
                  rowIndex={virtualize ? rowOffset + index + groups.length + 1 : undefined}
                  measure={virtualize ? virtualizer.measureElement : undefined}
                  selectionLabel={
                    selectable
                      ? formatLabel(labels.selectRow, locale, undefined, {
                          label: getRowLabel?.(row.original) ?? row.id,
                        })
                      : undefined
                  }
                  disabledReason={selectable && !row.getCanSelect() ? getRowDisabledReason?.(row.original) : undefined}
                />
              );
            })
          ) : (
            <TableRow role="row">
              <TableCell role="cell" colSpan={leafColumns.length + (selectable ? 1 : 0)}>
                <EmptyState
                  title={emptyTitle ?? formatLabel(query ? labels.noMatchingRows : labels.noRows, locale)}
                  description={emptyDescription}
                  art={emptyArt}
                  actions={
                    emptyActions ??
                    (query ? (
                      <Button
                        tone="secondary"
                        onClick={() => {
                          setFilterInput("");
                          reportFilter("");
                          filterRef.current?.focus();
                        }}
                      >
                        {formatLabel(labels.clearFilter, locale)}
                      </Button>
                    ) : undefined)
                  }
                  className="px-3 py-8"
                />
              </TableCell>
            </TableRow>
          )}
          {virtualize && <DataTableSpacer height={after} columns={leafColumns.length + (selectable ? 1 : 0)} />}
        </TableBody>
      </Table>
      {!showSkeleton && perPage > 0 && Number.isFinite(perPage) && pageCount > 0 && (
        <Pagination
          page={paging.pageIndex + 1}
          pageCount={pageCount}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          labels={labels}
          locale={locale}
        />
      )}
    </div>
  );
}
