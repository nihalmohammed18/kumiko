"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { buttonStyles } from "./button-styles.ts";

/** Props for Popover's controlled or uncontrolled state and trigger payload.
 * Use when: typing Popover. Avoid when: typing its floating content; use PopoverPopupProps.
 */
export type PopoverProps<Payload = unknown> = BasePopover.Root.Props<Payload>;

/** Shares open state and trigger payload between an anchored popup's parts.
 * Use when: showing supplementary content or controls. Avoid when: blocking a task; use Dialog.
 */
export function Popover<Payload = unknown>(props: PopoverProps<Payload>) {
  return <BasePopover.Root {...props} />;
}

/** Props for Popover's trigger, including Base UI's openOnHover and delays.
 * Use when: typing PopoverTrigger. Avoid when: typing the popup's placement; use PopoverPopupProps.
 */
export interface PopoverTriggerProps<Payload = unknown> extends Omit<BasePopover.Trigger.Props<Payload>, "className"> {
  className?: string;
}

/** Opens Popover by press, or additionally by hover with openOnHover.
 * Use when: revealing content that touch and screen-reader users can also open. Avoid when: navigating; use Link.
 */
export function PopoverTrigger<Payload = unknown>({ className, ...props }: PopoverTriggerProps<Payload>) {
  return (
    <BasePopover.Trigger
      {...props}
      data-slot="popover-trigger"
      className={props.render ? className : buttonStyles({ className: cn("max-w-full wrap-anywhere", className) })}
    />
  );
}

/** Props for Popover's portalled bubble, placement, optional arrow and focus behavior.
 * Use when: typing PopoverPopup. Avoid when: typing open state; use PopoverProps.
 */
export interface PopoverPopupProps
  extends Omit<BasePopover.Popup.Props, "className">,
    Pick<BasePopover.Positioner.Props, "side" | "align" | "sideOffset"> {
  className?: string;
  arrow?: boolean;
}

/** Positions a padded, scrolling bubble within the available space and manages opening and returning focus.
 * Use when: containing PopoverTitle, PopoverDescription and controls. Avoid when: showing a visual label; use Tooltip.
 */
export function PopoverPopup({
  className,
  children,
  arrow = false,
  side,
  align,
  sideOffset = 8,
  ...props
}: PopoverPopupProps) {
  return (
    <BasePopover.Portal data-slot="popover-portal">
      <BasePopover.Positioner
        data-slot="popover-positioner"
        className="z-popup"
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <BasePopover.Popup
          {...props}
          data-slot="popover-popup"
          className={cn("popup popover-popup font-body text-body-sm", className)}
        >
          {arrow && <BasePopover.Arrow data-slot="popover-arrow" className="popup-arrow" />}
          <div data-slot="popover-content" className="popover-content">
            {children}
          </div>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

/** Props for Popover's accessible heading.
 * Use when: typing PopoverTitle. Avoid when: typing explanatory text; use PopoverDescriptionProps.
 */
export interface PopoverTitleProps extends Omit<BasePopover.Title.Props, "className"> {
  className?: string;
}

/** Names the popup with a wrapping heading.
 * Use when: labeling Popover's content. Avoid when: providing its explanation; use PopoverDescription.
 */
export function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <BasePopover.Title {...props} data-slot="popover-title" className={cn("m-0 wrap-anywhere font-bold", className)} />
  );
}

/** Props for Popover's accessible description.
 * Use when: typing PopoverDescription. Avoid when: typing a heading; use PopoverTitleProps.
 */
export interface PopoverDescriptionProps extends Omit<BasePopover.Description.Props, "className"> {
  className?: string;
}

/** Describes the popup with wrapping, muted text.
 * Use when: explaining Popover's content. Avoid when: hiding essential information that belongs inline.
 */
export function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return (
    <BasePopover.Description
      {...props}
      data-slot="popover-description"
      className={cn("mt-2 mb-0 wrap-anywhere text-ink-muted", className)}
    />
  );
}

/** Props for Popover's close button.
 * Use when: typing PopoverClose. Avoid when: typing the opening trigger; use PopoverTriggerProps.
 */
export interface PopoverCloseProps extends Omit<BasePopover.Close.Props, "className"> {
  className?: string;
}

/** Closes Popover with a button whose default text uses the provider's close label.
 * Use when: offering an explicit way to dismiss the popup. Avoid when: running another action; use Button.
 */
export function PopoverClose({ className, children, ...props }: PopoverCloseProps) {
  const { labels, locale } = useKumiko();
  return (
    <BasePopover.Close
      {...props}
      data-slot="popover-close"
      className={
        props.render ? className : buttonStyles({ size: "sm", className: cn("max-w-full wrap-anywhere", className) })
      }
    >
      {children ?? formatLabel(labels.close, locale)}
    </BasePopover.Close>
  );
}
