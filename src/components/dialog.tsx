"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";
import { XIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useScrollFocus } from "../lib/use-scroll-focus.ts";
import { useKumiko } from "../provider.tsx";
import { type ButtonStyleProps, buttonStyles } from "./button-styles.ts";
import { dialogStyles } from "./dialog-styles.ts";

/** Controlled or uncontrolled dialog state and Base UI focus and dismissal options.
 * Use when: typing Dialog. Avoid when: typing its visible surface; use DialogPopupProps.
 */
export type DialogProps<Payload = unknown> = BaseDialog.Root.Props<Payload>;

/** Shares modal state, traps focus and locks page scrolling by default.
 * Use when: completing a focused task without leaving the page. Avoid when: confirming an irreversible action;
 * use AlertDialog.
 *
 * @example
 * <Dialog>
 *   <DialogTrigger>Application details</DialogTrigger>
 *   <DialogPopup size="sm">
 *     <DialogTitle>Frontend engineer at Cedar Labs</DialogTitle>
 *     <DialogDescription>Your interview is the next step.</DialogDescription>
 *     <DialogBody><p>Bring a project you are proud of to discuss with the team.</p></DialogBody>
 *     <DialogFooter><DialogClose>Done</DialogClose></DialogFooter>
 *   </DialogPopup>
 * </Dialog>
 */
export function Dialog<Payload>(props: DialogProps<Payload>) {
  return <BaseDialog.Root {...props} />;
}

/** Base UI trigger props with Button's tone and size.
 * Use when: typing DialogTrigger. Avoid when: typing a close action; use DialogCloseProps.
 */
export interface DialogTriggerProps<Payload = unknown> extends Omit<BaseDialog.Trigger.Props<Payload>, "className"> {
  tone?: ButtonStyleProps["tone"];
  size?: ButtonStyleProps["size"];
  className?: string;
}

/** Opens a dialog with a tactile button, preserving native disabled behavior.
 * Use when: opening Dialog from the page or a parent dialog. Avoid when: navigating; use LinkButton.
 */
export function DialogTrigger<Payload>({ tone, size, className, ...props }: DialogTriggerProps<Payload>) {
  return (
    <BaseDialog.Trigger {...props} data-slot="dialog-trigger" className={buttonStyles({ tone, size, className })} />
  );
}

/** Props for the centred surface, its width and its portal destination.
 * Use when: typing DialogPopup. Avoid when: configuring open state; use DialogProps.
 */
export interface DialogPopupProps extends Omit<BaseDialog.Popup.Props, "className"> {
  size?: "sm" | "md" | "lg";
  /** Portal destination for a themed island; body portals do not inherit a subtree's theme. */
  container?: BaseDialog.Portal.Props["container"];
  className?: string;
}

/** Portals a backdrop and centred modal with a permanent, localized corner close button.
 * Use when: containing a title, description, scrolling DialogBody and DialogFooter. Avoid when: anchoring content
 * to a trigger; use Popover. Set container to inherit a themed subtree instead of the document theme.
 */
export function DialogPopup({ size = "md", container, className, children, ...props }: DialogPopupProps) {
  const { labels, locale } = useKumiko();
  return (
    <BaseDialog.Portal container={container} data-slot="dialog-portal">
      <BaseDialog.Backdrop data-slot="dialog-backdrop" className="dialog-backdrop z-overlay" />
      <BaseDialog.Viewport
        data-slot="dialog-viewport"
        className="dialog-viewport fixed inset-0 z-overlay flex items-center justify-center p-4"
      >
        <BaseDialog.Popup
          {...props}
          data-slot="dialog-popup"
          role="dialog"
          data-size={size}
          className={cn(
            "dialog-popup @container relative z-overlay flex min-h-0 min-w-0 flex-col gap-4 rounded-overlay bg-surface p-6 font-body text-body text-ink wrap-anywhere",
            className,
          )}
        >
          <BaseDialog.Close
            data-slot="dialog-close"
            aria-label={formatLabel(labels.close, locale)}
            className={dialogStyles.cornerClose}
          >
            <XIcon />
          </BaseDialog.Close>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

/** Base UI heading props for an accessible dialog name.
 * Use when: typing DialogTitle. Avoid when: writing supporting text; use DialogDescriptionProps.
 */
export interface DialogTitleProps extends Omit<BaseDialog.Title.Props, "className"> {
  className?: string;
}

/** Names the dialog with a wrapping display heading that reserves space for the close button.
 * Use when: giving every DialogPopup a visible name. Avoid when: writing body content; use DialogBody.
 */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <BaseDialog.Title {...props} data-slot="dialog-title" className={cn(dialogStyles.title, className)} />;
}

/** Base UI paragraph props for the dialog's accessible description.
 * Use when: typing DialogDescription. Avoid when: typing long content; use DialogBodyProps.
 */
export interface DialogDescriptionProps extends Omit<BaseDialog.Description.Props, "className"> {
  className?: string;
}

/** Adds a muted, wrapping explanation announced with the dialog's title.
 * Use when: explaining the task briefly. Avoid when: presenting long or structured content; use DialogBody.
 */
export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <BaseDialog.Description
      {...props}
      data-slot="dialog-description"
      className={cn(dialogStyles.description, className)}
    />
  );
}

/** Native div props for a dialog's scrolling middle.
 * Use when: typing DialogBody. Avoid when: typing the fixed actions row; use DialogFooterProps.
 */
export interface DialogBodyProps extends ComponentProps<"div"> {}

/** Scrolls the middle while keeping the title, footer and controls' edges and focus rings visible.
 * Use when: containing the dialog's task or long content. Avoid when: placing its title or primary actions.
 */
export function DialogBody({ className, ref, ...props }: DialogBodyProps) {
  const [scrollRef, tabIndex] = useScrollFocus(ref);
  return (
    <div
      tabIndex={tabIndex}
      {...props}
      ref={scrollRef}
      data-slot="dialog-body"
      className={cn(dialogStyles.body, className)}
    />
  );
}

/** Native div props for a dialog's actions row.
 * Use when: typing DialogFooter. Avoid when: typing scrolling content; use DialogBodyProps.
 */
export interface DialogFooterProps extends ComponentProps<"div"> {}

/** Wraps actions at the inline end and stacks them at phone container widths, preserving DOM order.
 * Use when: placing Cancel before the primary action. Avoid when: placing content that should scroll.
 */
export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <div {...props} data-slot="dialog-footer" className={cn(dialogStyles.footer, className)} />;
}

/** Base UI close props with Button's tone and size.
 * Use when: typing DialogClose. Avoid when: opening a dialog; use DialogTriggerProps.
 */
export interface DialogCloseProps extends Omit<BaseDialog.Close.Props, "className"> {
  tone?: ButtonStyleProps["tone"];
  size?: ButtonStyleProps["size"];
  className?: string;
}

/** Closes its Dialog and restores focus to the trigger by default.
 * Use when: canceling or completing the task. Avoid when: submitting a form before validation; use Button.
 */
export function DialogClose({ tone, size, className, ...props }: DialogCloseProps) {
  return <BaseDialog.Close {...props} data-slot="dialog-close" className={buttonStyles({ tone, size, className })} />;
}
