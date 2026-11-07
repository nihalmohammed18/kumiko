"use client";

import { type ComponentProps, type ReactNode, useEffect } from "react";
import { CheckIcon, InfoIcon, XIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";

/** Props for an announced result, its supporting text and an optional next action.
 * Use when: typing FeedbackBanner. Avoid when: typing a static inline message; use AlertProps.
 */
export interface FeedbackBannerProps extends Omit<ComponentProps<"section">, "children"> {
  status?: "success" | "danger" | "info";
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

const statuses = {
  success: {
    band: "bg-success-tint text-success-text",
    badge: "bg-success text-success-fg",
    Icon: CheckIcon,
    label: "statusSuccess",
  },
  danger: {
    band: "bg-danger-tint text-danger-text",
    badge: "bg-danger text-danger-fg",
    Icon: XIcon,
    label: "statusDanger",
  },
  info: { band: "bg-info-tint text-info-text", badge: "bg-info text-info-fg", Icon: InfoIcon, label: "statusInfo" },
} as const;

/** A result band that announces its status and title when shown or changed.
 * Use when: confirming an answer or save and offering the next step. Keep the title plain text for announcements.
 * Avoid when: showing static page context; use Alert. The provider announces this band, so add no live-region role.
 */
export function FeedbackBanner({
  status = "success",
  title,
  description,
  action,
  className,
  ...props
}: FeedbackBannerProps) {
  const { announce, labels, locale } = useKumiko();
  const { band, badge, Icon, label } = statuses[status];
  useEffect(() => {
    let active = true;
    // Wait for the provider's effect replay to finish before scheduling its announcement frame.
    queueMicrotask(() => {
      if (active) announce(`${formatLabel(labels[statuses[status].label], locale)}: ${title}`);
    });
    return () => {
      active = false;
    };
  }, [announce, labels, locale, status, title]);
  return (
    <section
      {...props}
      data-slot="feedback-banner"
      data-status={status}
      className={cn(
        "@container/feedback-banner min-w-0 border-2 border-transparent font-body transition-[opacity,translate] duration-toast-in ease-enter starting:translate-y-2 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:starting:translate-y-0 forced-colors:border-forced-ink",
        band,
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-4 px-8 py-6 @max-md/feedback-banner:px-4">
        <span
          data-slot="feedback-banner-icon"
          role="img"
          aria-label={formatLabel(labels[label], locale)}
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-pill border-2 border-transparent forced-colors:border-forced-ink",
            badge,
          )}
        >
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1 wrap-anywhere">
          <p data-slot="feedback-banner-title" className="font-display text-title-sm font-bold">
            {title}
          </p>
          {description != null && (
            <div data-slot="feedback-banner-description" className="text-body-sm">
              {description}
            </div>
          )}
        </div>
        {action != null && (
          <div
            data-slot="feedback-banner-action"
            className="ms-auto min-w-0 max-w-full wrap-anywhere @max-md/feedback-banner:w-full [&>*]:max-w-full @max-md/feedback-banner:[&>*]:w-full"
          >
            {action}
          </div>
        )}
      </div>
    </section>
  );
}
