"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "../lib/tv.ts";
import { buttonStyles } from "./button-styles.ts";

/** Props for shared tooltip delays and the instant-opening timeout.
 * Use when: typing TooltipProvider. Avoid when: setting one tooltip's state; use TooltipProps.
 */
export type TooltipProviderProps = BaseTooltip.Provider.Props;

/** Shares a 600ms hover delay and instant opening between nearby tooltips, with no closing delay.
 * Use when: grouping an app's tooltips once. Avoid when: adding a provider for every tooltip; each works without one.
 */
export function TooltipProvider({ delay = 600, closeDelay = 0, ...props }: TooltipProviderProps) {
  return <BaseTooltip.Provider {...props} delay={delay} closeDelay={closeDelay} />;
}

/** Props for Tooltip's controlled or uncontrolled open state and trigger payload.
 * Use when: typing Tooltip. Avoid when: typing its placement; use TooltipPopupProps.
 */
export type TooltipProps<Payload = unknown> = BaseTooltip.Root.Props<Payload>;

/** Shares a visual label's open state; Base UI does not open tooltips on touch input.
 * Use when: labeling an icon-only control for mouse and keyboard users; the control still needs its own accessible name.
 * Avoid when: text matters to understanding; use inline text or Popover with openOnHover.
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger render={<IconButton aria-label="Application actions" />}><MenuIcon /></TooltipTrigger>
 *   <TooltipPopup>Application actions</TooltipPopup>
 * </Tooltip>
 */
export function Tooltip<Payload = unknown>(props: TooltipProps<Payload>) {
  return <BaseTooltip.Root {...props} />;
}

/** Props for a tooltip trigger; disabled turns off the tooltip, not the control rendered with render.
 * Use when: typing TooltipTrigger. Avoid when: disabling the control; set disabled on its Button or IconButton.
 */
export interface TooltipTriggerProps<Payload = unknown> extends Omit<BaseTooltip.Trigger.Props<Payload>, "className"> {
  className?: string;
}

/** Attaches a visual tooltip to a named control, including an IconButton supplied with render.
 * Use when: labeling an icon-only control for mouse and keyboard users; give the control its own accessible name.
 * Avoid when: text matters to understanding or explains a disabled control; use visible text or Popover with openOnHover.
 */
export function TooltipTrigger<Payload = unknown>({ className, ...props }: TooltipTriggerProps<Payload>) {
  return (
    <BaseTooltip.Trigger
      {...props}
      data-slot="tooltip-trigger"
      className={
        props.render ? className : buttonStyles({ tone: "ghost", className: cn("max-w-full wrap-anywhere", className) })
      }
    />
  );
}

/** Props for Tooltip's portalled label, placement and optional arrow.
 * Use when: typing TooltipPopup. Avoid when: typing shared delays; use TooltipProviderProps.
 */
export interface TooltipPopupProps
  extends Omit<BaseTooltip.Popup.Props, "className">,
    Pick<BaseTooltip.Positioner.Props, "side" | "align" | "sideOffset"> {
  className?: string;
  arrow?: boolean;
}

/** Positions a wrapping strong-tone pill, fading and scaling unless Base UI requests an instant change.
 * Use when: visually labeling an icon-only control for mouse and keyboard users; keep its own accessible name.
 * Avoid when: text matters to understanding or contains controls; use inline text or Popover with openOnHover.
 */
export function TooltipPopup({
  className,
  children,
  arrow = false,
  side,
  align,
  sideOffset = 8,
  ...props
}: TooltipPopupProps) {
  return (
    <BaseTooltip.Portal data-slot="tooltip-portal">
      <BaseTooltip.Positioner
        data-slot="tooltip-positioner"
        className="z-tooltip"
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <BaseTooltip.Popup
          {...props}
          data-slot="tooltip-popup"
          className={cn(
            "tooltip-popup bg-strong text-strong-fg font-body text-label font-bold rounded-control",
            className,
          )}
        >
          {arrow && <BaseTooltip.Arrow data-slot="tooltip-arrow" className="popup-arrow tooltip-arrow" />}
          <div data-slot="tooltip-content" className="tooltip-content">
            {children}
          </div>
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
