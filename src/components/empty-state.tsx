import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/tv.ts";

/** Content slots, status and heading level for an empty or failed content region.
 * Use when: typing EmptyState. Avoid when: typing inline field errors or page notices; use FieldError or Alert.
 */
export interface EmptyStateProps extends Omit<ComponentProps<"div">, "title" | "children"> {
  /** Decorative art, such as an icon or character; hidden from assistive technology. */
  art?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Announces a failure once when the region appears. */
  status?: "empty" | "error";
  headingLevel?: 2 | 3 | 4;
}

/** A centred empty or error state with decorative art, explanatory text and wrapping actions.
 * Use when: a collection has no items or an error replaces a whole region, with a useful next step.
 * Avoid when: showing inline field errors (FieldError), page-level notices (Alert), or loading content (Skeleton).
 *
 * @example
 * <EmptyState title="No applications yet" description="Your next role starts with a search."
 *   art={<Illustration name="envelope" />} actions={<LinkButton href="/jobs" tone="primary">Browse jobs</LinkButton>} />
 */
export function EmptyState({
  art,
  title,
  description,
  actions,
  status = "empty",
  headingLevel = 3,
  className,
  ...props
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div
      {...props}
      data-slot="empty-state"
      role={status === "error" ? "alert" : props.role}
      className={cn("@container w-full min-w-0", className)}
    >
      <div
        data-slot="empty-state-content"
        className="grid min-w-0 justify-items-center gap-4 text-center @max-sm:gap-3"
      >
        {art != null && (
          <div
            data-slot="empty-state-art"
            aria-hidden
            className="grid size-30 max-w-full place-items-center text-ink-muted @max-sm:size-20 [&>*]:max-h-full [&>*]:max-w-full [&_svg]:size-full"
          >
            {art}
          </div>
        )}
        <Heading
          data-slot="empty-state-title"
          className="min-w-0 max-w-full wrap-anywhere font-display text-title-sm font-bold text-ink"
        >
          {title}
        </Heading>
        {description != null && (
          <p
            data-slot="empty-state-description"
            className="min-w-0 max-w-[40ch] wrap-anywhere text-body text-ink-muted"
          >
            {description}
          </p>
        )}
        {actions != null && (
          <div
            data-slot="empty-state-actions"
            className="flex min-w-0 max-w-full flex-wrap items-center justify-center gap-3 [&>*]:max-w-full"
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
