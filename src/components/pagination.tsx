import { type ComponentProps, cloneElement, type ReactElement, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons.tsx";
import { englishLabels, formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import type { KumikoLabels } from "../provider.tsx";

/** Builds a bounded page window with sibling pages, boundary pages and gaps.
 * Use when: composing custom pagination. Avoid when: paginating data; this only chooses navigation items.
 * Pages and counts are integers; defaults show at most seven items. Zero boundaries keeps only the sibling window.
 */
export function paginationRange({
  page,
  pageCount,
  siblings = 1,
  boundaries = 1,
}: {
  page: number;
  pageCount: number;
  siblings?: number;
  boundaries?: number;
}): Array<number | "ellipsis"> {
  const count = Math.max(0, Math.trunc(pageCount));
  if (count === 0) return [];
  const current = Math.max(1, Math.min(count, Math.trunc(page)));
  const siblingCount = Math.max(0, Math.trunc(siblings));
  const boundaryCount = Math.max(0, Math.trunc(boundaries));
  const pages = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

  if (boundaryCount === 0) {
    const start = Math.max(1, current - siblingCount);
    const end = Math.min(count, current + siblingCount);
    return [
      ...(start > 1 ? ["ellipsis" as const] : []),
      ...pages(start, end),
      ...(end < count ? ["ellipsis" as const] : []),
    ];
  }
  if (count <= 2 * (siblingCount + boundaryCount) + 3) return pages(1, count);

  const start = Math.max(
    boundaryCount + 2,
    Math.min(current - siblingCount, count - boundaryCount - 2 * siblingCount - 1),
  );
  const end = Math.min(
    count - boundaryCount - 1,
    Math.max(current + siblingCount, boundaryCount + 2 * siblingCount + 2),
  );
  return [
    ...pages(1, boundaryCount),
    start > boundaryCount + 2 ? "ellipsis" : boundaryCount + 1,
    ...pages(start, end),
    end < count - boundaryCount - 1 ? "ellipsis" : count - boundaryCount,
    ...pages(count - boundaryCount + 1, count),
  ];
}

/** Props for page navigation using either href links or onPageChange buttons.
 * Use when: typing Pagination's pages, labels and navigation mode. Avoid when: selecting panels; use TabsProps.
 */
export type PaginationProps = Omit<ComponentProps<"nav">, "children"> & {
  /** The current one-based page. */
  page: number;
  /** The number of pages. */
  pageCount: number;
  labels?: Pick<KumikoLabels, "pagination" | "previousPage" | "nextPage" | "page">;
  locale?: string;
} & (
    | { href: (page: number) => string; render?: ReactElement<Record<string, unknown>>; onPageChange?: never }
    | { onPageChange: (page: number) => void; href?: never; render?: never }
  );

/** A compact page navigator with locale-formatted numbers and disabled previous/next controls at the ends.
 * Use when: navigating a paginated collection. Avoid when: navigating a short hierarchy; use Breadcrumbs.
 * Server-safe: labels and locale default to English; client code passes useKumiko().labels and useKumiko().locale.
 * Link mode clones render onto each generated href. Its unavailable ends are native disabled buttons.
 *
 * @example
 * <Pagination page={2} pageCount={8} href={(page) => "/applications?page=" + page} />
 */
export function Pagination({
  page,
  pageCount,
  href,
  render,
  onPageChange,
  labels = englishLabels,
  locale = "en",
  className,
  ...props
}: PaginationProps) {
  const count = Math.max(0, Math.trunc(pageCount));
  const current = Math.max(1, Math.min(count, Math.trunc(page)));
  const numbers = new Intl.NumberFormat(locale);

  function control(target: number, name: string, children: ReactNode, disabled = false, slot = "pagination-page") {
    const selected = slot === "pagination-page" && target === current;
    const controlProps = {
      "aria-label": name,
      "aria-current": selected ? ("page" as const) : undefined,
      "data-slot": slot,
      className: cn(
        "press inline-flex size-control-sm shrink-0 items-center justify-center font-body text-label font-extrabold tabular-nums @md:size-control",
        selected ? "press-selected underline decoration-2 underline-offset-4" : "press-secondary",
      ),
    };
    if (href && !disabled) {
      const anchorProps = {
        ...render?.props,
        ...controlProps,
        href: href(target),
        className: cn(render?.props.className as string | undefined, controlProps.className),
        children,
      };
      return render ? cloneElement(render, anchorProps) : <a {...anchorProps} />;
    }
    return (
      <button
        {...controlProps}
        type="button"
        disabled={disabled}
        data-disabled={disabled ? "" : undefined}
        onClick={disabled ? undefined : () => onPageChange?.(target)}
      >
        {children}
      </button>
    );
  }

  function items(range: Array<number | "ellipsis">, display: string) {
    let gap = 0;
    return range.map((item) => (
      <li
        key={`${display}-${item === "ellipsis" ? `ellipsis-${++gap}` : item}`}
        className={display}
        aria-hidden={item === "ellipsis" ? true : undefined}
      >
        {item === "ellipsis" ? (
          <span
            data-slot="pagination-ellipsis"
            aria-hidden
            className="inline-flex w-3 items-center justify-center text-caption text-ink-muted"
          >
            …
          </span>
        ) : (
          control(item, formatLabel(labels.page, locale, item), numbers.format(item))
        )}
      </li>
    ));
  }

  return (
    <nav
      {...props}
      data-slot="pagination"
      aria-label={props["aria-label"] ?? formatLabel(labels.pagination, locale)}
      className={cn("@container min-w-0", className)}
    >
      <ol className="flex w-fit max-w-full items-center gap-1 p-2 pb-3">
        <li>
          {control(
            current - 1,
            formatLabel(labels.previousPage, locale),
            <ChevronLeftIcon className="size-4" />,
            current <= 1,
            "pagination-previous",
          )}
        </li>
        {items(paginationRange({ page: current, pageCount: count }), "hidden @sm:block")}
        {items(paginationRange({ page: current, pageCount: count, boundaries: 0 }), "@sm:hidden")}
        <li>
          {control(
            current + 1,
            formatLabel(labels.nextPage, locale),
            <ChevronRightIcon className="size-4" />,
            current >= count,
            "pagination-next",
          )}
        </li>
      </ol>
    </nav>
  );
}
