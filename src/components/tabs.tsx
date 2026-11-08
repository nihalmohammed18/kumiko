"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cloneElement } from "react";
import { cn } from "../lib/tv.ts";

/** Props for a group of related tabs and panels.
 * Use when: typing Tabs' controlled or uncontrolled selection. Avoid when: typing a selection tray; use ToggleGroupProps.
 */
export interface TabsProps extends Omit<BaseTabs.Root.Props, "className" | "orientation"> {
  className?: string;
}

/** Groups horizontal tabs and their panels, with manual keyboard activation.
 * Use when: switching between related views on one page. Avoid when: choosing an option; use ToggleGroup.
 */
export function Tabs({ className, ...props }: TabsProps) {
  return (
    <BaseTabs.Root {...props} data-slot="tabs" orientation="horizontal" className={cn("min-w-0 w-full", className)} />
  );
}

/** Props for the scrolling row of tabs.
 * Use when: naming or styling TabsList. Avoid when: styling an individual tab; use TabProps.
 */
export interface TabsListProps extends Omit<BaseTabs.List.Props, "className" | "activateOnFocus"> {
  className?: string;
}

/** A ruled tab row that scrolls inside its container; arrows move focus and Enter or Space selects.
 * Use when: grouping Tabs' controls. Avoid when: drawing a segmented selection tray; use ToggleGroup.
 */
export function TabsList({ className, ...props }: TabsListProps) {
  // The measured list spans its scrollable content, so Base UI's right-side offset works in RTL too.
  return (
    <div data-slot="tabs-scroll" className="tabs-scroll">
      <BaseTabs.List {...props} data-slot="tabs-list" activateOnFocus={false} className={cn("tabs-list", className)} />
    </div>
  );
}

/** Props for a tab, including Base UI's render element and nativeButton setting.
 * Use when: typing a tab or framework navigation tab. Avoid when: typing an ordinary navigation link; use LinkProps.
 */
export interface TabProps extends Omit<BaseTabs.Tab.Props, "className"> {
  className?: string;
}

/** A 48px tab with an inset keyboard ring and a sliding brand indicator when selected.
 * Use when: selecting a related panel. Avoid when: triggering an action; use Button.
 * Navigation tabs accept render={<NextLink href="/jobs" />} with nativeButton={false}.
 */
export function Tab({ className, render, ...props }: TabProps) {
  return (
    <BaseTabs.Tab
      {...props}
      data-slot="tab"
      className={cn("tabs-tab font-body text-label font-extrabold", className)}
      render={(elementProps, state) => {
        // Retain each bar's previous position for transitions; only the selected tab's indicator is visible.
        const tabProps = mergeProps(
          typeof render === "object" ? (render.props as Record<string, unknown>) : undefined,
          elementProps,
          {
            "data-slot": "tab",
            disabled: props.nativeButton !== false ? props.disabled : undefined,
            children: (
              <>
                {elementProps.children}
                <BaseTabs.Indicator
                  data-slot="tabs-indicator"
                  aria-hidden
                  renderBeforeHydration={state.active}
                  className="tabs-indicator invisible in-data-active:visible"
                />
              </>
            ),
          },
        );
        if (typeof render === "function") return render(tabProps, state);
        return render ? cloneElement(render, tabProps) : <button {...tabProps} />;
      }}
    />
  );
}

/** Props for a tab's corresponding panel.
 * Use when: typing TabsPanel's content or mounting behaviour. Avoid when: typing a modal; use DialogProps.
 */
export interface TabsPanelProps extends Omit<BaseTabs.Panel.Props, "className"> {
  className?: string;
}

/** The active tab's content, with a visible keyboard ring when the panel itself receives focus.
 * Use when: displaying a view selected by Tab. Avoid when: displaying a separate page; use navigation links.
 */
export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      {...props}
      data-slot="tabs-panel"
      className={cn(
        "min-w-0 wrap-anywhere p-4 font-body text-body text-ink rounded-control",
        "focus-visible:outline-(length:--kumiko-ring-width) focus-visible:outline-solid focus-visible:outline-focus focus-visible:-outline-offset-2",
        className,
      )}
    />
  );
}
