import { Children, type ComponentProps, cloneElement, isValidElement } from "react";
import { ChevronRightIcon } from "../icons.tsx";
import { englishLabels, formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import type { KumikoLabels } from "../provider.tsx";
import { Link, type LinkProps } from "./link.tsx";

/** Props for a wrapping hierarchy trail made of direct BreadcrumbItem children.
 * Use when: typing Breadcrumbs' navigation landmark. Avoid when: typing page numbers; use PaginationProps.
 */
export interface BreadcrumbsProps extends ComponentProps<"nav"> {
  labels?: Pick<KumikoLabels, "breadcrumbs">;
  locale?: string;
}

/** A wrapping navigation trail whose last item is plain current-page text.
 * Use when: showing where a page sits in a hierarchy. Avoid when: switching peer views; use Tabs.
 * Server-safe: client code passes useKumiko().labels and useKumiko().locale for translated landmark names.
 */
export function Breadcrumbs({
  labels = englishLabels,
  locale = "en",
  className,
  children,
  ...props
}: BreadcrumbsProps) {
  const trail = Children.toArray(children).filter(isValidElement<BreadcrumbItemProps>);
  return (
    <nav
      {...props}
      data-slot="breadcrumbs"
      aria-label={props["aria-label"] ?? formatLabel(labels.breadcrumbs, locale)}
      className={cn("min-w-0 font-body text-body-sm", className)}
    >
      <ol className="flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1">
        {trail.map((item, index) => cloneElement(item, { current: index === trail.length - 1 }))}
      </ol>
    </nav>
  );
}

/** Props for a breadcrumb list item and its native or framework link.
 * Use when: typing BreadcrumbItem's href or render element. Avoid when: typing a standalone link; use LinkProps.
 */
export interface BreadcrumbItemProps extends ComponentProps<"li"> {
  href?: string;
  render?: LinkProps["render"];
  /** Assigned by Breadcrumbs: the final item is current and renders without a link or separator. */
  current?: boolean;
}

/** A hierarchy link with a directional separator, or plain text for the current page.
 * Use when: composing Breadcrumbs with direct children. Avoid when: drawing an unrelated collection of links.
 * Framework links use render={<NextLink href="/jobs" />}; the last item's href and render are ignored.
 */
export function BreadcrumbItem({ href, render, current = false, className, children, ...props }: BreadcrumbItemProps) {
  return (
    <li {...props} data-slot="breadcrumb-item" className={cn("flex min-w-0 max-w-full items-start gap-2", className)}>
      {current ? (
        <span
          data-slot="breadcrumb-current"
          aria-current="page"
          className="inline-flex min-h-control-sm min-w-0 items-center wrap-anywhere text-ink font-bold"
        >
          {children}
        </span>
      ) : (
        <Link
          href={href}
          render={render}
          className="inline-flex min-h-control-sm min-w-control-sm items-center wrap-anywhere text-ink-muted hover:text-ink active:text-brand-text"
        >
          {children}
        </Link>
      )}
      {!current && <ChevronRightIcon className="mt-3 size-4 shrink-0 text-ink-muted" />}
    </li>
  );
}
