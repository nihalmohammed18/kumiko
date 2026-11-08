import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/tv.ts";

const tones = {
  brand: "bg-brand-tint text-brand-text",
  sun: "bg-sun-tint text-sun-text",
  leaf: "bg-leaf-tint text-leaf-text",
  coral: "bg-coral-tint text-coral-text",
  tide: "bg-tide-tint text-tide-text",
};

/** Accent palette slots available to a statistic's icon.
 * Use when: typing StatTile's tone. Avoid when: conveying a status solely through colour.
 */
export type StatTileTone = keyof typeof tones;

/** Native div props, a label and value, and optional decorative icon and caption.
 * Use when: typing StatTile. Avoid when: defining an action; place a separate control beside the statistic.
 */
export interface StatTileProps extends Omit<ComponentProps<"div">, "children"> {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: StatTileTone;
  caption?: ReactNode;
}

/** A wrapping statistic on a card surface with a neutral lower edge.
 * Use when: showing one labelled metric, including a CountUp value. Avoid when: presenting an interactive card.
 *
 * @example
 * <StatTile label="Offers received" value={2} tone="leaf" caption="This month" />
 */
export function StatTile({ label, value, icon, tone = "brand", caption, className, ...props }: StatTileProps) {
  return (
    <div
      {...props}
      data-slot="stat-tile"
      data-tone={tone}
      className={cn(
        "@container grid min-w-0 gap-2 rounded-card border-2 border-line bg-surface p-4",
        "[box-shadow:0_var(--kumiko-edge-h)_0_var(--kumiko-edge-neutral)]",
        className,
      )}
    >
      {icon != null && (
        <span
          data-slot="stat-tile-icon"
          aria-hidden
          className={cn("grid size-10 place-items-center rounded-full [&_svg]:size-5", tones[tone])}
        >
          {icon}
        </span>
      )}
      <p data-slot="stat-tile-label" className="min-w-0 wrap-anywhere text-label font-bold text-ink-muted">
        {label}
      </p>
      <div
        data-slot="stat-tile-value"
        className="min-w-0 wrap-anywhere font-display text-headline font-bold text-ink tabular-nums"
      >
        {value}
      </div>
      {caption != null && (
        <div data-slot="stat-tile-caption" className="min-w-0 wrap-anywhere text-body-sm text-ink-muted">
          {caption}
        </div>
      )}
    </div>
  );
}
