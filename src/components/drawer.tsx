"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { type ComponentProps, createContext, use } from "react";
import { XIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useScrollFocus } from "../lib/use-scroll-focus.ts";
import { type Direction, useKumiko } from "../provider.tsx";
import { type ButtonStyleProps, buttonStyles } from "./button-styles.ts";
import { dialogStyles } from "./dialog-styles.ts";

/** Base UI drawer state, snap points and dismissal options, with a logical screen edge.
 * Use when: typing Drawer. Avoid when: typing its visible surface; use DrawerPopupProps.
 */
export interface DrawerProps<Payload = unknown> extends Omit<BaseDrawer.Root.Props<Payload>, "swipeDirection"> {
  /** Screen edge; start and end follow KumikoProvider's direction. Defaults to bottom. */
  side?: "bottom" | "start" | "end";
}

interface DrawerSettings {
  side: NonNullable<DrawerProps["side"]>;
  direction: Direction;
  modal: NonNullable<DrawerProps["modal"]>;
  snapPoints: boolean;
}

const DrawerSettings = createContext<DrawerSettings>({
  side: "bottom",
  direction: "ltr",
  modal: true,
  snapPoints: false,
});

/** Shares controlled or uncontrolled drawer state and maps logical edges to physical dismissal swipes.
 * Use when: showing a sheet or side panel that can be swiped closed. Avoid when: gestures are unnecessary;
 * use Dialog, or AlertDialog for irreversible-action confirmations.
 */
export function Drawer<Payload>({ side = "bottom", modal = true, ...props }: DrawerProps<Payload>) {
  const { direction } = useKumiko();
  const swipeDirections = {
    bottom: "down",
    start: direction === "rtl" ? "right" : "left",
    end: direction === "rtl" ? "left" : "right",
  } as const;
  return (
    <DrawerSettings value={{ side, direction, modal, snapPoints: Boolean(props.snapPoints?.length) }}>
      <BaseDrawer.Root {...props} modal={modal} swipeDirection={swipeDirections[side]} />
    </DrawerSettings>
  );
}

/** Base UI trigger props with Button's tone and size.
 * Use when: typing DrawerTrigger. Avoid when: typing a close action; use DrawerCloseProps.
 */
export interface DrawerTriggerProps<Payload = unknown> extends Omit<BaseDrawer.Trigger.Props<Payload>, "className"> {
  tone?: ButtonStyleProps["tone"];
  size?: ButtonStyleProps["size"];
  className?: string;
}

/** Opens its drawer with a tactile button and native disabled behavior.
 * Use when: opening a sheet or side panel from the page. Avoid when: navigating; use LinkButton.
 */
export function DrawerTrigger<Payload>({ tone, size, className, ...props }: DrawerTriggerProps<Payload>) {
  return (
    <BaseDrawer.Trigger {...props} data-slot="drawer-trigger" className={buttonStyles({ tone, size, className })} />
  );
}

/** Drawer surface and focus props, including a portal destination for a themed subtree.
 * Use when: typing DrawerPopup. Avoid when: configuring its edge or snap points; use DrawerProps.
 */
export interface DrawerPopupProps extends Omit<BaseDrawer.Popup.Props, "className"> {
  /** Portal destination; body portals inherit the document theme rather than a subtree's theme. */
  container?: BaseDrawer.Portal.Props["container"];
  className?: string;
}

/** Portals a swipeable surface, modal scrim and permanent localized close button, with keyboard-aware scrolling.
 * Use when: containing DrawerTitle, DrawerDescription, DrawerBody and DrawerFooter. Avoid when: anchoring a
 * small popup to its trigger; use Popover. Set container to inherit a themed subtree.
 */
export function DrawerPopup({ container, className, children, ...props }: DrawerPopupProps) {
  const { side, direction, modal, snapPoints } = use(DrawerSettings);
  const { labels, locale } = useKumiko();
  return (
    <BaseDrawer.VirtualKeyboardProvider>
      <BaseDrawer.Portal container={container} data-slot="drawer-portal">
        {modal === true && (
          <BaseDrawer.Backdrop data-slot="drawer-backdrop" className="dialog-backdrop drawer-backdrop z-overlay" />
        )}
        <BaseDrawer.Viewport
          data-slot="drawer-viewport"
          data-side={side}
          dir={direction}
          className="drawer-viewport fixed inset-0 z-overlay flex"
        >
          <BaseDrawer.Popup
            {...props}
            data-slot="drawer-popup"
            role="dialog"
            dir={direction}
            data-side={side}
            data-snap-points={snapPoints ? "" : undefined}
            className={cn(
              "drawer-popup @container relative z-overlay flex min-h-0 min-w-0 flex-col gap-4 bg-surface p-6 font-body text-body text-ink wrap-anywhere touch-none",
              className,
            )}
          >
            {side === "bottom" && (
              <div data-slot="drawer-handle" aria-hidden className="mx-auto h-1 w-10 shrink-0 rounded-pill bg-line" />
            )}
            <BaseDrawer.Close
              data-slot="drawer-close"
              aria-label={formatLabel(labels.close, locale)}
              className={dialogStyles.cornerClose}
            >
              <XIcon />
            </BaseDrawer.Close>
            {children}
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.VirtualKeyboardProvider>
  );
}

/** Base UI heading props for the drawer's accessible name.
 * Use when: typing DrawerTitle. Avoid when: writing supporting text; use DrawerDescriptionProps.
 */
export interface DrawerTitleProps extends Omit<BaseDrawer.Title.Props, "className"> {
  className?: string;
}

/** Names the drawer with a wrapping display heading and room for the corner close button.
 * Use when: giving every DrawerPopup a visible name. Avoid when: writing long content; use DrawerBody.
 */
export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return <BaseDrawer.Title {...props} data-slot="drawer-title" className={cn(dialogStyles.title, className)} />;
}

/** Base UI paragraph props for the drawer's accessible description.
 * Use when: typing DrawerDescription. Avoid when: typing structured content; use DrawerBodyProps.
 */
export interface DrawerDescriptionProps extends Omit<BaseDrawer.Description.Props, "className"> {
  className?: string;
}

/** Adds a muted, wrapping explanation announced with the drawer's title.
 * Use when: briefly explaining the panel's task. Avoid when: presenting long content; use DrawerBody.
 */
export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <BaseDrawer.Description
      {...props}
      data-slot="drawer-description"
      className={cn(dialogStyles.description, className)}
    />
  );
}

/** Base UI content props for the drawer's scrolling middle.
 * Use when: typing DrawerBody. Avoid when: typing fixed actions; use DrawerFooterProps.
 */
export interface DrawerBodyProps extends Omit<BaseDrawer.Content.Props, "className"> {
  className?: string;
}

/** Scrolls and permits mouse text selection while keeping the header, footer, press edges and focus rings visible.
 * Use when: containing a drawer's task, form fields or long content. Avoid when: placing its fixed primary actions.
 */
export function DrawerBody({ className, ref, ...props }: DrawerBodyProps) {
  const [scrollRef, tabIndex] = useScrollFocus(ref);
  return (
    <BaseDrawer.Content
      tabIndex={tabIndex}
      {...props}
      ref={scrollRef}
      data-slot="drawer-body"
      className={cn(dialogStyles.body, "flex-1 touch-auto", className)}
    />
  );
}

/** Native div props for a drawer's fixed actions row.
 * Use when: typing DrawerFooter. Avoid when: typing scrolling content; use DrawerBodyProps.
 */
export interface DrawerFooterProps extends ComponentProps<"div"> {}

/** Keeps actions at the inline end, wrapping or stacking them in their DOM order at phone container widths.
 * Use when: placing Cancel before the primary action. Avoid when: placing content that should scroll.
 */
export function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return <div {...props} data-slot="drawer-footer" className={cn(dialogStyles.footer, className)} />;
}

/** Base UI close props with Button's tone and size.
 * Use when: typing DrawerClose. Avoid when: typing its opener; use DrawerTriggerProps.
 */
export interface DrawerCloseProps extends Omit<BaseDrawer.Close.Props, "className"> {
  tone?: ButtonStyleProps["tone"];
  size?: ButtonStyleProps["size"];
  className?: string;
}

/** Closes its drawer and restores focus to the trigger by default.
 * Use when: canceling or completing the task. Avoid when: submitting before validation; use Button.
 */
export function DrawerClose({ tone, size, className, ...props }: DrawerCloseProps) {
  return <BaseDrawer.Close {...props} data-slot="drawer-close" className={buttonStyles({ tone, size, className })} />;
}
