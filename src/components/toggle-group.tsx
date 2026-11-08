"use client";

import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { cn } from "../lib/tv.ts";
import { ToggleGroupSizeContext } from "./toggle.tsx";

/** Props for a segmented selection tray and its Toggles' shared size.
 * Use when: typing ToggleGroup's selection or layout. Avoid when: typing a standalone pressable; use ToggleProps.
 */
export interface ToggleGroupProps extends Omit<BaseToggleGroup.Props, "className"> {
  /** The Toggles' default size; an explicit size on a Toggle wins. Defaults to sm. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** A tray of Toggles sharing one selection, or several with multiple.
 * Use when: choosing a view, period or related formatting options.
 * Avoid when: switching panels; use Tabs.
 * Single selection cancels changes to an empty value without calling onValueChange; multiple may be cleared.
 *
 * @example
 * <ToggleGroup defaultValue={["cards"]} aria-label="Jobs view">
 *   <Toggle value="cards">Cards</Toggle><Toggle value="list">List</Toggle>
 * </ToggleGroup>
 */
export function ToggleGroup({
  size = "sm",
  orientation = "horizontal",
  multiple = false,
  onValueChange,
  className,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupSizeContext value={size}>
      <BaseToggleGroup
        {...props}
        data-slot="toggle-group"
        multiple={multiple}
        orientation={orientation}
        onValueChange={(value, eventDetails) => {
          if (!multiple && value.length === 0) {
            eventDetails.cancel();
            return;
          }
          onValueChange?.(value, eventDetails);
        }}
        className={cn(
          "inline-flex flex-wrap items-center gap-2 p-2 border-2 border-line rounded-card bg-field",
          orientation === "vertical" && "flex-col",
          className,
        )}
      />
    </ToggleGroupSizeContext>
  );
}
