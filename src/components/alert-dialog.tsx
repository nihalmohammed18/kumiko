"use client";

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/tv.ts";
import { useScrollFocus } from "../lib/use-scroll-focus.ts";
import { type ButtonStyleProps, buttonStyles } from "./button-styles.ts";
import type { DialogPopupProps } from "./dialog.tsx";

/** Controlled or uncontrolled confirmation state and Base UI callbacks.
 * Use when: typing AlertDialog. Avoid when: typing a dismissible task dialog; use DialogProps.
 */
export type AlertDialogProps<Payload = unknown> = BaseAlertDialog.Root.Props<Payload>;

/** Requires a response to a modal confirmation and prevents dismissal by pressing outside.
 * Use when: confirming a destructive or irreversible action. Avoid when: editing or reading content; use Dialog.
 *
 * @example
 * <AlertDialog>
 *   <AlertDialogTrigger tone="danger">Delete job alert</AlertDialogTrigger>
 *   <AlertDialogPopup cancel="Keep alert" actions={<AlertDialogClose tone="danger">Delete alert</AlertDialogClose>}>
 *     <AlertDialogTitle>Delete your frontend alert?</AlertDialogTitle>
 *     <AlertDialogDescription>You will stop receiving matching jobs.</AlertDialogDescription>
 *   </AlertDialogPopup>
 * </AlertDialog>
 */
export function AlertDialog<Payload>(props: AlertDialogProps<Payload>) {
  return <BaseAlertDialog.Root {...props} />;
}

/** Base UI confirmation trigger props with Button's tone and size.
 * Use when: typing AlertDialogTrigger. Avoid when: typing the confirming action; use AlertDialogCloseProps.
 */
export interface AlertDialogTriggerProps<Payload = unknown>
  extends Omit<BaseAlertDialog.Trigger.Props<Payload>, "className"> {
  tone?: ButtonStyleProps["tone"];
  size?: ButtonStyleProps["size"];
  className?: string;
}

/** Opens an irreversible-action confirmation from a tactile button.
 * Use when: asking before deleting or discarding something. Avoid when: performing the action without confirmation.
 */
export function AlertDialogTrigger<Payload>({ tone, size, className, ...props }: AlertDialogTriggerProps<Payload>) {
  return (
    <BaseAlertDialog.Trigger
      {...props}
      data-slot="alert-dialog-trigger"
      className={buttonStyles({ tone, size, className })}
    />
  );
}

/** Confirmation surface props, including its required visible Cancel label.
 * Use when: typing AlertDialogPopup. Avoid when: making cancellation optional; use DialogPopup for ordinary tasks.
 */
export interface AlertDialogPopupProps extends Omit<BaseAlertDialog.Popup.Props, "className"> {
  size?: DialogPopupProps["size"];
  /** Portal destination for a themed island; body portals do not inherit a subtree's theme. */
  container?: BaseAlertDialog.Portal.Props["container"];
  /** Required label for the always-rendered Cancel action in the footer. */
  cancel: string;
  /** Actions rendered after Cancel; put the destructive action last and give it tone="danger". */
  actions?: ReactNode;
  className?: string;
}

/** Portals an alertdialog with a scrim and an automatic footer containing its required Cancel action.
 * Use when: confirming an irreversible action with Title and Description children and actions after Cancel.
 * Avoid when: needing a corner close button or outside dismissal; use DialogPopup.
 */
export function AlertDialogPopup({
  size = "md",
  container,
  cancel,
  actions,
  className,
  children,
  ...props
}: AlertDialogPopupProps) {
  return (
    <BaseAlertDialog.Portal container={container} data-slot="alert-dialog-portal">
      <BaseAlertDialog.Backdrop data-slot="alert-dialog-backdrop" className="dialog-backdrop z-overlay" />
      <BaseAlertDialog.Viewport
        data-slot="alert-dialog-viewport"
        className="dialog-viewport fixed inset-0 z-overlay flex items-center justify-center p-4"
      >
        <BaseAlertDialog.Popup
          {...props}
          data-slot="alert-dialog-popup"
          role="alertdialog"
          data-size={size}
          className={cn(
            "dialog-popup @container relative z-overlay flex min-h-0 min-w-0 flex-col gap-4 rounded-overlay bg-surface p-6 font-body text-body text-ink wrap-anywhere",
            className,
          )}
        >
          {children}
          <AlertDialogFooter>
            <AlertDialogClose>{cancel}</AlertDialogClose>
            {actions}
          </AlertDialogFooter>
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Viewport>
    </BaseAlertDialog.Portal>
  );
}

/** Base UI heading props for an accessible confirmation name.
 * Use when: typing AlertDialogTitle. Avoid when: explaining consequences; use AlertDialogDescriptionProps.
 */
export interface AlertDialogTitleProps extends Omit<BaseAlertDialog.Title.Props, "className"> {
  className?: string;
}

/** Names the confirmation with a wrapping display heading.
 * Use when: stating the action being confirmed. Avoid when: using a vague heading such as "Are you sure?".
 */
export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <BaseAlertDialog.Title
      {...props}
      data-slot="alert-dialog-title"
      className={cn("min-w-0 shrink-0 font-display text-title font-extrabold", className)}
    />
  );
}

/** Base UI paragraph props for the confirmation's accessible explanation.
 * Use when: typing AlertDialogDescription. Avoid when: naming the action; use AlertDialogTitleProps.
 */
export interface AlertDialogDescriptionProps extends Omit<BaseAlertDialog.Description.Props, "className"> {
  className?: string;
}

/** Explains the consequences of the irreversible action with muted, wrapping text.
 * Use when: stating what will be lost or changed. Avoid when: omitting information needed to make the decision.
 */
export function AlertDialogDescription({ className, ref, ...props }: AlertDialogDescriptionProps) {
  const [scrollRef, tabIndex] = useScrollFocus(ref);
  return (
    <BaseAlertDialog.Description
      tabIndex={tabIndex}
      {...props}
      ref={scrollRef}
      data-slot="alert-dialog-description"
      className={cn("dialog-body min-h-0 min-w-0 -mx-3 p-3 text-body text-ink-muted", className)}
    />
  );
}

/** Native div props for a confirmation's actions row.
 * Use when: typing AlertDialogFooter. Avoid when: configuring cancellation; set AlertDialogPopup's required cancel.
 */
export interface AlertDialogFooterProps extends ComponentProps<"div"> {}

/** Keeps confirmation actions fixed, wrapping or stacking them in their DOM order.
 * Use when: grouping confirmation actions; AlertDialogPopup renders this automatically. Avoid when: placing content.
 */
export function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <div
      {...props}
      data-slot="alert-dialog-footer"
      className={cn("dialog-footer flex shrink-0 flex-wrap justify-end gap-3", className)}
    />
  );
}

/** Base UI close props with Button's tone and size.
 * Use when: typing a confirmation action. Avoid when: typing its opener; use AlertDialogTriggerProps.
 */
export interface AlertDialogCloseProps extends Omit<BaseAlertDialog.Close.Props, "className"> {
  tone?: ButtonStyleProps["tone"];
  size?: ButtonStyleProps["size"];
  className?: string;
}

/** Closes the confirmation and restores focus; an onClick handler can perform the confirmed action.
 * Use when: confirming with tone="danger" in AlertDialogPopup's actions. Avoid when: submitting before validation.
 */
export function AlertDialogClose({ tone, size, className, ...props }: AlertDialogCloseProps) {
  return (
    <BaseAlertDialog.Close
      {...props}
      data-slot="alert-dialog-close"
      className={buttonStyles({ tone, size, className })}
    />
  );
}
