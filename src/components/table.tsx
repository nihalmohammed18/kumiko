import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/tv.ts";
import { TableScroll } from "./table-scroll.tsx";

/** Native table props and the minimum row height.
 * Use when: typing Table; props and refs target the table inside its card. Avoid when: typing an individual row or cell.
 */
export interface TableProps extends ComponentProps<"table"> {
  size?: "sm" | "md" | "lg";
  /** Controls inside the card, before its scroll area. */
  toolbar?: ReactNode;
}

/** A server-safe table in a clipped, tactile card with an inner horizontal scroll region.
 * Use when: presenting tabular data; give the table a name with TableCaption or aria-label.
 * Avoid when: presenting a layout grid or expecting built-in sorting or selection.
 * Its scroll area becomes a Tab stop only while the table overflows (a small client part; Table stays server-safe).
 */
export function Table({ size = "md", className, children, toolbar, ...props }: TableProps) {
  return (
    <div
      data-slot="table-card"
      dir={props.dir}
      lang={props.lang}
      className="min-w-0 max-w-full overflow-hidden rounded-card border-2 border-line bg-surface"
    >
      {toolbar}
      <TableScroll>
        <table {...props} data-slot="table" data-size={size} className={cn("w-full border-collapse", className)}>
          {children}
        </table>
      </TableScroll>
    </div>
  );
}

/** Native props for the table's visible name.
 * Use when: typing TableCaption. Avoid when: typing a column heading; use TableHeadProps.
 */
export interface TableCaptionProps extends ComponentProps<"caption"> {}

/** A bold, wrapping table name at the top, aligned to the inline start.
 * Use when: naming a Table; every table needs a caption or aria-label. Avoid when: adding a section heading outside a table.
 */
export function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      {...props}
      data-slot="table-caption"
      className={cn("caption-top wrap-break-word px-3 py-3 text-start text-body-sm font-bold text-ink", className)}
    />
  );
}

/** Native props for a table's header row group.
 * Use when: typing TableHeader. Avoid when: typing a heading cell; use TableHeadProps.
 */
export interface TableHeaderProps extends ComponentProps<"thead"> {}

/** The native header group for a table's column headings.
 * Use when: grouping heading rows. Avoid when: grouping data rows; use TableBody.
 */
export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead {...props} data-slot="table-header" className={className} />;
}

/** Native props for the table's data row group.
 * Use when: typing TableBody. Avoid when: typing summary rows; use TableFooterProps.
 */
export interface TableBodyProps extends ComponentProps<"tbody"> {}

/** A native body group with thin rules between its rows and no trailing rule.
 * Use when: grouping data rows. Avoid when: grouping column headings; use TableHeader.
 */
export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody {...props} data-slot="table-body" className={className} />;
}

/** Native props for the table's summary row group.
 * Use when: typing TableFooter. Avoid when: typing the table's name; use TableCaptionProps.
 */
export interface TableFooterProps extends ComponentProps<"tfoot"> {}

/** A bold footer on a field fill, separated from the data by a two-pixel rule.
 * Use when: presenting totals or summaries. Avoid when: placing pagination controls; keep those outside the table.
 */
export function TableFooter({ className, ...props }: TableFooterProps) {
  return <tfoot {...props} data-slot="table-footer" className={cn("bg-field font-bold", className)} />;
}

/** Native row props and a selection marker.
 * Use when: typing TableRow. Avoid when: managing selection state; keep that in the table's consumer.
 */
export interface TableRowProps extends ComponentProps<"tr"> {
  selected?: boolean;
}

/** A wrapping row whose minimum height follows Table's size and whose selected fill matches the press recipe.
 * Use when: composing table rows; selected rows need a checkbox or another visible state indicator.
 * Avoid when: making the entire row an action; put controls or links in its cells.
 */
export function TableRow({ selected = false, className, ...props }: TableRowProps) {
  return <tr {...props} data-slot="table-row" data-selected={selected || undefined} className={className} />;
}

/** Native heading-cell props with logical numeric alignment.
 * Use when: typing TableHead; align="end" adds tabular numerals. Avoid when: typing a data cell; use TableCellProps.
 */
export interface TableHeadProps extends Omit<ComponentProps<"th">, "align"> {
  align?: "start" | "end";
}

/** A bold heading cell on a field fill, with column scope unless row scope is supplied.
 * Use when: naming a column or row; use scope="row" for row headings. Avoid when: displaying ordinary data; use TableCell.
 */
export function TableHead({ align = "start", scope = "col", className, ...props }: TableHeadProps) {
  return (
    <th
      {...props}
      data-slot="table-head"
      data-align={align}
      scope={scope}
      className={cn(
        "wrap-break-word bg-field px-3 py-1 align-middle text-label font-bold text-ink",
        align === "end" ? "text-end tabular-nums" : "text-start",
        className,
      )}
    />
  );
}

/** Native data-cell props with logical numeric alignment.
 * Use when: typing TableCell; align="end" adds tabular numerals. Avoid when: typing a heading cell; use TableHeadProps.
 */
export interface TableCellProps extends Omit<ComponentProps<"td">, "align"> {
  align?: "start" | "end";
}

/** A wrapping data cell with twelve-pixel inline padding and optional end-aligned tabular numerals.
 * Use when: displaying a row's values. Avoid when: naming a column or row; use TableHead.
 */
export function TableCell({ align = "start", className, ...props }: TableCellProps) {
  return (
    <td
      {...props}
      data-slot="table-cell"
      data-align={align}
      className={cn(
        "wrap-break-word px-3 py-1 align-middle text-body-sm text-ink",
        align === "end" ? "text-end tabular-nums" : "text-start",
        className,
      )}
    />
  );
}
