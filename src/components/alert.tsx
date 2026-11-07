"use client";

import type { ComponentProps, ReactNode } from "react";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";

/** Props for an inline status message, its description and an optional action.
 * Use when: typing Alert. Avoid when: typing an announced result band; use FeedbackBannerProps.
 */
export interface AlertProps extends Omit<ComponentProps<"div">, "title"> {
  status?: "info" | "success" | "warning" | "danger";
  title: ReactNode;
  action?: ReactNode;
}

const statuses = {
  info: { band: "bg-info-tint text-info-text", icon: "text-info", Icon: InfoIcon, label: "statusInfo" },
  success: {
    band: "bg-success-tint text-success-text",
    icon: "text-success",
    Icon: CircleCheckIcon,
    label: "statusSuccess",
  },
  warning: {
    band: "bg-warning-tint text-warning-text",
    icon: "text-warning",
    Icon: TriangleAlertIcon,
    label: "statusWarning",
  },
  danger: {
    band: "bg-danger-tint text-danger-text",
    icon: "text-danger",
    Icon: CircleAlertIcon,
    label: "statusDanger",
  },
} as const;

/** An inline message with a named status icon and space for an action.
 * Use when: showing context in page content; static alerts need no role. Pass `role="alert"` for urgent,
 * dynamically shown errors.
 * Avoid when: announcing a completed answer or save; use FeedbackBanner.
 */
export function Alert({ status = "info", title, children, action, className, ...props }: AlertProps) {
  const { labels, locale } = useKumiko();
  const { band, icon, Icon, label } = statuses[status];
  return (
    <div
      {...props}
      data-slot="alert"
      data-status={status}
      className={cn(
        "grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-card border-2 border-transparent p-4 font-body forced-colors:border-forced-ink",
        band,
        className,
      )}
    >
      <span
        data-slot="alert-icon"
        role="img"
        aria-label={formatLabel(labels[label], locale)}
        className={cn("row-start-1 size-6", icon)}
      >
        <Icon className="size-6" />
      </span>
      <div data-slot="alert-title" className="col-start-2 min-w-0 wrap-anywhere text-body font-bold">
        {title}
      </div>
      {children != null && (
        <div data-slot="alert-description" className="col-start-2 min-w-0 wrap-anywhere text-body-sm">
          {children}
        </div>
      )}
      {action != null && (
        <div data-slot="alert-action" className="col-start-2 min-w-0 wrap-anywhere [&>*]:max-w-full">
          {action}
        </div>
      )}
    </div>
  );
}
