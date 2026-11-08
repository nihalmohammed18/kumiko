"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import {
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
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { useKumiko } from "../provider.tsx";
import { Checkbox } from "./checkbox.tsx";
import { EmptyState } from "./empty-state.tsx";
import { Field, FieldLabel } from "./field.tsx";
import { Pagination } from "./pagination.tsx";
import { SearchField } from "./search-field.tsx";
import { Skeleton } from "./skeleton.tsx";
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
  columnMeta: metaHelper<{ align?: "start" | "end" }>(),
});

/** DataTable's TanStack v9 feature type, including optional logical column alignment in meta.
 * Use when: typing ColumnDef<DataTableFeatures, Row> or createColumnHelper<DataTableFeatures, Row>().
 * Avoid when: defining a separate TanStack table with different features.
 */
export type DataTableFeatures = typeof features;

/** Native table props, TanStack column definitions and controlled or default client state.
 * Use when: typing DataTable; native props and refs target its table. Avoid when: supplying server-paginated data.
 */
export type DataTableProps<TData extends RowData> = Omit<TableProps, "children"> & {
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
  bulkActions?: (selectedRows: TData[]) => ReactNode;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  loading?: boolean;
} & (
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

function DataTableRow<TData extends RowData>({
  row,
  selectionLabel,
  disabledReason,
}: {
  row: Row<DataTableFeatures, TData>;
  selectionLabel?: string;
  disabledReason?: string | null;
}) {
  const reasonId = useId();
  const reason = !row.getCanSelect() ? disabledReason : undefined;
  return (
    <TableRow selected={selectionLabel !== undefined && row.getIsSelected()}>
      {selectionLabel !== undefined && (
        <TableCell className="w-12">
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
      {row.getAllCells().map((cell, index) => (
        <TableCell key={cell.id} align={cell.column.columnDef.meta?.align}>
          <FlexRender cell={cell} />
          {selectionLabel !== undefined && reason && index === 0 && (
            <span id={reasonId} className="block wrap-anywhere text-body-sm text-ink-muted">
              {reason}
            </span>
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}

/** A named client-side table with sorting, global filtering, row selection and page navigation.
 * Use when: browsing a complete dataset with Kumiko's table parts. Avoid when: rendering server pages or virtual rows.
 * Keep data and columns stable; column meta.align="end" aligns numeric headers and cells.
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
  loading = false,
  size,
  ...props
}: DataTableProps<TData>) {
  const { labels, locale, announce } = useKumiko();
  const [sort, changeSorting] = useDataTableState(sorting, defaultSorting, onSortingChange);
  const [query, changeFilter] = useDataTableState(globalFilter, defaultGlobalFilter, onGlobalFilterChange);
  const [paging, changePagination] = useDataTableState(
    pagination,
    defaultPagination ?? { pageIndex: 0, pageSize },
    onPaginationChange,
  );
  const [selection, changeSelection] = useDataTableState(rowSelection, defaultRowSelection, onRowSelectionChange);
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
    manualPagination: pageSize === 0 || paging.pageSize === 0,
  });
  const pageCount = table.getPageCount();
  const rows = table.getRowModel().rows;
  const groups = table.getHeaderGroups();
  const leafColumns = table.getAllLeafColumns();
  const perPage = pageSize === 0 ? 0 : paging.pageSize;
  const placeholderCount = Number.isFinite(perPage) && perPage > 0 ? Math.trunc(perPage) : data.length || 10;
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

  return (
    <div
      data-slot="data-table"
      dir={props.dir}
      lang={props.lang ?? locale}
      className="@container min-w-0 max-w-full space-y-4"
    >
      {filter && (
        <Field>
          <FieldLabel>{filterLabel ?? formatLabel(labels.filterRows, locale)}</FieldLabel>
          <SearchField value={query} onValueChange={changeFilter} />
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
      <Table {...props} size={size} aria-busy={loading || undefined}>
        <TableCaption>{caption}</TableCaption>
        <TableHeader>
          {groups.map((group, index) => (
            <TableRow key={group.id}>
              {selectable && index === 0 && (
                <TableHead rowSpan={groups.length} className="w-12">
                  <Checkbox
                    nativeButton
                    render={<button type="button" />}
                    aria-label={formatLabel(labels.selectAllRows, locale)}
                    checked={table.getIsAllPageRowsSelected()}
                    indeterminate={!table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()}
                    disabled={loading || !rows.some((row) => row.getCanSelect())}
                    onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
                  />
                </TableHead>
              )}
              {group.headers.map((header) => {
                const sortable = !header.isPlaceholder && header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon;
                return (
                  <TableHead
                    key={header.id}
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
                        <span className="min-w-0 wrap-anywhere">
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
        <TableBody>
          {loading ? (
            Array.from({ length: placeholderCount }, (_, index) => `skeleton-${index}`).map((id) => (
              <TableRow key={id}>
                {selectable && (
                  <TableCell className="w-12">
                    <Skeleton className="size-6" />
                  </TableCell>
                )}
                {leafColumns.map((column) => (
                  <TableCell key={column.id} align={column.columnDef.meta?.align}>
                    <Skeleton shape="text" className="w-full min-w-6" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <DataTableRow
                key={row.id}
                row={row}
                selectionLabel={
                  selectable
                    ? formatLabel(labels.selectRow, locale, undefined, { label: getRowLabel?.(row.original) ?? row.id })
                    : undefined
                }
                disabledReason={selectable && !row.getCanSelect() ? getRowDisabledReason?.(row.original) : undefined}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={leafColumns.length + (selectable ? 1 : 0)}>
                <EmptyState
                  title={emptyTitle ?? formatLabel(query ? labels.noMatchingRows : labels.noRows, locale)}
                  description={emptyDescription}
                  className="px-3 py-8"
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!loading && perPage > 0 && Number.isFinite(perPage) && pageCount > 0 && (
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
