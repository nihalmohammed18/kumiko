"use client";

import type { ComponentProps } from "react";
import { StarIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";

/** Native span props, an average rating, and an optional maximum and rating count.
 * Use when: typing Rating. Avoid when: collecting a rating from the user.
 */
export interface RatingProps extends Omit<ComponentProps<"span">, "children"> {
  /** The average, from 0 to max, rounded to one decimal place. Values outside the range are clamped. */
  value: number;
  /** The highest possible rating, which is also the number of stars. Defaults to 5. */
  max?: number;
  /** How many ratings the average comes from, shown in brackets. 0 shows "No ratings yet" instead of stars. */
  count?: number;
}

/** A read-only star rating with its average as text and an optional rating count.
 * Use when: showing the score of a course, product or review. Avoid when: someone gives a rating; there's no input version.
 *
 * @example
 * <Rating value={4.7} count={12345} />
 */
export function Rating({ value, max = 5, count, className, ...props }: RatingProps) {
  const { locale, labels } = useKumiko();
  const stars = Math.max(1, Math.round(max));
  const score = Math.round(Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), stars) * 10) / 10;
  const ratings = count !== undefined && Number.isFinite(count) ? Math.max(0, Math.round(count)) : undefined;
  const number = new Intl.NumberFormat(locale);
  const parameters = {
    value: new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(score),
    max: number.format(stars),
  };
  const root = cn("inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-body-sm text-ink", className);

  // A course with no ratings has no average; "0.0" with empty stars would read as a bad score.
  if (ratings === 0)
    return (
      <span {...props} data-slot="rating" data-empty="" className={cn(root, "text-ink-muted")}>
        {formatLabel(labels.noRatings, locale)}
      </span>
    );

  return (
    <span {...props} data-slot="rating" className={root}>
      <span aria-hidden data-slot="rating-value" className="font-bold">
        {parameters.value}
      </span>
      <span aria-hidden data-slot="rating-stars" className="inline-flex shrink-0 gap-0.5">
        {Array.from({ length: stars }, (_, index) => index + 1).map((position) => {
          const fill = Math.round(Math.min(Math.max(score - position + 1, 0), 1) * 100);
          return (
            <span key={position} data-slot="rating-star" className="relative inline-flex size-4 shrink-0">
              <StarIcon className="size-full text-ink-muted forced-colors:forced-color-adjust-none forced-colors:text-forced-ink" />
              {fill > 0 && (
                // Anchored at the inline start, so a partly filled star fills from the right in right-to-left.
                <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ inlineSize: `${fill}%` }}>
                  <StarIcon className="size-4 fill-sun text-sun-text forced-colors:forced-color-adjust-none forced-colors:fill-forced-ink forced-colors:text-forced-ink" />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {ratings !== undefined && (
        <span aria-hidden data-slot="rating-count" className="text-ink-muted">
          ({number.format(ratings)})
        </span>
      )}
      <span className="sr-only">
        {ratings === undefined
          ? formatLabel(labels.rating, locale, undefined, parameters)
          : formatLabel(labels.ratingCount, locale, ratings, parameters)}
      </span>
    </span>
  );
}
