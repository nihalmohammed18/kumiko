"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import type { MouseEventHandler, ReactNode } from "react";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, XIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { buttonStyles } from "./button-styles.ts";
import { Illustration } from "./illustration.tsx";
import { Spinner } from "./spinner.tsx";

const manager = /* @__PURE__ */ BaseToast.createToastManager<{ art?: ReactNode }>();

/** Supporting content, an undo action and lifetime for a toast; an existing id updates it in place.
 * Use when: customizing a notification. Avoid when: rendering persistent page context; use Alert.
 */
export interface ToastOptions {
  description?: ReactNode;
  action?: { label: string; onClick: MouseEventHandler<HTMLButtonElement> };
  /** Milliseconds before dismissal; defaults to 5000. Set 0 to keep the toast until dismissed. */
  timeout?: number;
  id?: string;
}

/** Toast options and a decorative illustration for an achievement.
 * Use when: customizing a milestone notification. Avoid when: conveying essential information through art alone.
 */
export interface ToastAchievementOptions extends ToastOptions {
  /** Replaces the trophy; rendered in a 40px slot and hidden from assistive technology. */
  art?: ReactNode;
}

/** Changes to an existing toast's title, supporting content, action or lifetime.
 * Use when: updating a notification by id. Avoid when: creating one; call toast with a title.
 */
export interface ToastUpdateOptions extends Omit<ToastOptions, "id"> {
  title?: string;
}

type PromiseMessage<Value> = string | ToastUpdateOptions | ((value: Value) => string | ToastUpdateOptions);

/** Titles or options for a promise's loading, success and error notifications.
 * Use when: following one asynchronous operation. Avoid when: progress can be measured; use Progress.
 */
export interface ToastPromiseOptions<Value, ErrorValue = Error> {
  loading: string | ToastUpdateOptions;
  success: PromiseMessage<Value>;
  error: PromiseMessage<ErrorValue>;
}

function baseOptions(options: ToastOptions | ToastUpdateOptions) {
  const { action, ...rest } = options;
  return {
    ...rest,
    ...("action" in options && {
      actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
    }),
  };
}

function add(title: string, options: ToastOptions = {}, type = "neutral") {
  return manager.add({ ...baseOptions(options), title, type, priority: type === "error" ? "high" : "low" });
}

function promiseOptions(message: string | ToastUpdateOptions, priority: "low" | "high") {
  // Base UI's string shortcut fills description; Kumiko's messages are titles.
  return { ...baseOptions(typeof message === "string" ? { title: message } : message), priority };
}

/** Raises a neutral toast and returns its id; also provides status, promise, update and dismiss methods.
 * Use when: giving brief feedback after an action, with one Toaster inside KumikoProvider.
 * Avoid when: the message must stay in page content; use Alert or FeedbackBanner.
 */
export const toast = Object.assign((title: string, options?: ToastOptions) => add(title, options), {
  /** Confirms a completed action politely.
   * Use when: a save or other action succeeds. Avoid when: reporting an error; use toast.error.
   */
  success: (title: string, options?: ToastOptions) => add(title, options, "success"),
  /** Announces an error urgently.
   * Use when: an action fails and needs attention. Avoid when: giving routine information; use toast.info.
   */
  error: (title: string, options?: ToastOptions) => add(title, options, "error"),
  /** Raises a polite informational toast.
   * Use when: an action has useful supporting context. Avoid when: showing permanent guidance; use Alert.
   */
  info: (title: string, options?: ToastOptions) => add(title, options, "info"),
  /** Celebrates a milestone politely with a trophy or the supplied art.
   * Use when: recognizing an achievement. Avoid when: reporting routine saves; use toast.success.
   */
  achievement: (
    title: string,
    { art = <Illustration name="trophy" size={40} />, ...options }: ToastAchievementOptions = {},
  ) => manager.add({ ...baseOptions(options), title, type: "achievement", priority: "low", data: { art } }),
  /** Tracks a promise with one toast, announces errors urgently and preserves the promise's result or rejection.
   * Use when: showing loading followed by success or failure. Avoid when: announcing the same operation elsewhere.
   */
  promise<Value, ErrorValue = Error>(value: Promise<Value>, options: ToastPromiseOptions<Value, ErrorValue>) {
    return manager.promise(value, {
      loading: promiseOptions(options.loading, "low"),
      success: (result: Value) =>
        promiseOptions(typeof options.success === "function" ? options.success(result) : options.success, "low"),
      error: (error: ErrorValue) =>
        promiseOptions(typeof options.error === "function" ? options.error(error) : options.error, "high"),
    });
  },
  /** Dismisses one toast by id, or all toasts when the id is omitted.
   * Use when: feedback is no longer relevant. Avoid when: changing its content; use toast.update.
   */
  dismiss: (id?: string) => manager.close(id),
  /** Updates an existing toast without replacing its id or any omitted options.
   * Use when: feedback changes after an action. Avoid when: tracking a promise; use toast.promise.
   */
  update: (id: string, options: ToastUpdateOptions) => manager.update(id, baseOptions(options)),
});

/** The visible toast limit and additional viewport classes.
 * Use when: configuring an app's Toaster. Avoid when: changing a toast's lifetime; set timeout on toast.
 */
export interface ToasterProps {
  limit?: number;
  className?: string;
}

const statuses = {
  neutral: { band: "bg-surface text-ink", icon: "text-ink-muted", Icon: InfoIcon, label: undefined },
  success: {
    band: "bg-success-tint text-success-text",
    icon: "text-success",
    Icon: CircleCheckIcon,
    label: "statusSuccess",
  },
  error: {
    band: "bg-danger-tint text-danger-text",
    icon: "text-danger",
    Icon: CircleAlertIcon,
    label: "statusDanger",
  },
  info: { band: "bg-info-tint text-info-text", icon: "text-info", Icon: InfoIcon, label: "statusInfo" },
  loading: { band: "bg-surface text-ink", icon: "text-ink-muted", Icon: InfoIcon, label: "loading" },
  achievement: { band: "bg-sun-tint text-sun-text", icon: "text-sun-text", Icon: InfoIcon, label: undefined },
} as const;

/** Renders global notifications with pauseable timers, F6 navigation and swipe dismissal toward the inline end.
 * Use when: once per app, inside KumikoProvider; Base UI's live region also stays accessible over modal dialogs.
 * Avoid when: adding another announcer for these messages; Base UI already announces each toast.
 *
 * @example
 * <>
 *   <Toaster />
 *   <Button onClick={() => toast.success("Job alert saved")}>Save job alert</Button>
 * </>
 */
export function Toaster({ limit = 3, className }: ToasterProps) {
  return (
    <BaseToast.Provider toastManager={manager} limit={limit}>
      <ToastViewport className={className} />
    </BaseToast.Provider>
  );
}

function ToastViewport({ className }: Pick<ToasterProps, "className">) {
  const { toasts } = BaseToast.useToastManager();
  const { direction, labels, locale } = useKumiko();
  return (
    <BaseToast.Portal data-slot="toast-portal">
      <BaseToast.Viewport
        data-slot="toast-viewport"
        aria-label={formatLabel(labels.notifications, locale)}
        className={cn("toast-viewport z-toast", className)}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          // Escape belongs to the toast even when a modal dialog is underneath it.
          event.stopPropagation();
          if (event.target === event.currentTarget) {
            const front = toasts.find((item) => !item.limited && item.transitionStatus !== "ending");
            if (front) manager.close(front.id);
          }
        }}
      >
        {toasts.map((item) => {
          const status = statuses[item.type as keyof typeof statuses] ?? statuses.neutral;
          const { band, icon, Icon, label } = status;
          return (
            <BaseToast.Root
              key={item.id}
              toast={item}
              swipeDirection={["down", direction === "rtl" ? "left" : "right"]}
              data-slot="toast"
              className={cn("toast @container/toast rounded-card font-body text-body-sm", band)}
            >
              <BaseToast.Content data-slot="toast-content" className="flex flex-wrap items-center gap-3 p-4">
                <span
                  data-slot="toast-icon"
                  role="img"
                  aria-label={label ? formatLabel(labels[label], locale) : undefined}
                  aria-hidden={label ? undefined : true}
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-pill border-2 border-transparent bg-surface forced-colors:border-forced-ink",
                    icon,
                    item.type === "achievement" && "border-0 [&>*]:max-h-full [&>*]:max-w-full [&_svg]:size-10",
                  )}
                >
                  {item.type === "achievement" ? (
                    item.data?.art
                  ) : item.type === "loading" ? (
                    <Spinner className="size-6" />
                  ) : (
                    <Icon className="size-6" />
                  )}
                </span>
                <div className="min-w-0 flex-1 wrap-anywhere">
                  <BaseToast.Title data-slot="toast-title" className="font-bold" />
                  {item.description != null && <BaseToast.Description data-slot="toast-description" />}
                </div>
                {item.actionProps && (
                  <div className="ms-auto min-w-0 max-w-full @max-xs/toast:order-1 @max-xs/toast:flex @max-xs/toast:w-full @max-xs/toast:justify-end">
                    <BaseToast.Action
                      data-slot="toast-action"
                      className={buttonStyles({ tone: "secondary", size: "sm", className: "max-w-full" })}
                      onClick={() => manager.close(item.id)}
                    />
                  </div>
                )}
                <BaseToast.Close
                  data-slot="toast-close"
                  aria-label={formatLabel(labels.close, locale)}
                  className={buttonStyles({
                    tone: "ghost",
                    size: "sm",
                    iconOnly: true,
                    className: "[--press-radius:var(--kumiko-radius-pill)]",
                  })}
                >
                  <XIcon />
                </BaseToast.Close>
              </BaseToast.Content>
            </BaseToast.Root>
          );
        })}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}
