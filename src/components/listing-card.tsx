import type { ReactNode } from "react";
import { Card, CardDescription, type CardProps, CardTitle, type CardTitleProps } from "./card.tsx";

/** Card props and a listing's parts: a small image, a title, supporting text, a standout figure and an action.
 * Use when: typing ListingCard. Avoid when: typing a free-form card; use CardProps.
 */
export interface ListingCardProps extends Omit<CardProps, "title"> {
  /** A logo or thumbnail in a 56px box. The title names the listing, so give an image an empty alt. */
  media?: ReactNode;
  /** The listing's name. Wrap it in CardLink to make the whole card one link. */
  title: ReactNode;
  titleLevel?: CardTitleProps["level"];
  /** One muted line under the title, such as the provider or the company and place. */
  description?: ReactNode;
  /** The figure people compare listings by, such as a price or a salary. */
  highlight?: ReactNode;
  /** A button or two at the end of the footer. They stay clickable when the card is a link. */
  action?: ReactNode;
  /** Details between the heading and the footer: badges, a Rating, a line of facts. */
  children?: ReactNode;
}

/** A server-safe card for one item in a list of similar things: a course, a job, a deal or a product.
 * Use when: showing the same facts for every item, so people can compare them down a list.
 * Avoid when: the content is free-form; compose Card, CardTitle and CardDescription yourself.
 *
 * @example
 * <ListingCard
 *   title={<CardLink href="/courses/python-basics">Python basics</CardLink>}
 *   description="Cedar Academy · 30 hours"
 *   highlight="$49"
 *   action={<Button>Save</Button>}
 * >
 *   <Rating value={4.7} count={12345} />
 * </ListingCard>
 */
export function ListingCard({
  media,
  title,
  titleLevel,
  description,
  highlight,
  action,
  children,
  ...props
}: ListingCardProps) {
  const present = (part: ReactNode) => part !== undefined && part !== null && part !== false;
  return (
    <Card {...props}>
      <div data-slot="listing-card-header" className="flex min-w-0 items-start gap-4">
        {present(media) && (
          <span
            data-slot="listing-card-media"
            className="inline-flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-thumb *:size-full *:object-cover"
          >
            {media}
          </span>
        )}
        <div className="grid min-w-0 flex-1 gap-1">
          <CardTitle level={titleLevel}>{title}</CardTitle>
          {present(description) && <CardDescription>{description}</CardDescription>}
        </div>
      </div>
      {present(children) && (
        <div data-slot="listing-card-details" className="flex min-w-0 flex-wrap items-center gap-2">
          {children}
        </div>
      )}
      {(present(highlight) || present(action)) && (
        <div data-slot="listing-card-footer" className="flex min-w-0 flex-wrap items-center gap-3">
          {present(highlight) && (
            // A price such as "$62,000 a year" takes its direction from its own text, so it doesn't reorder in an
            // Arabic or Urdu page.
            <p
              dir="auto"
              data-slot="listing-card-highlight"
              className="min-w-0 wrap-anywhere font-display text-title-sm font-bold"
            >
              {highlight}
            </p>
          )}
          {present(action) && (
            <div data-slot="listing-card-action" className="ms-auto flex flex-wrap items-center gap-2">
              {action}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
