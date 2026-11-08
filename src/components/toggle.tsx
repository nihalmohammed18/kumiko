"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { createContext, use } from "react";
import { cn } from "../lib/tv.ts";
import { buttonStyles } from "./button-styles.ts";

/** Props for a persistent pressable's state and size.
 * Use when: typing a filter, formatting toggle or segment. Avoid when: typing an immediate on/off setting; use Switch.
 */
export interface ToggleProps extends Omit<BaseToggle.Props, "className"> {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Shares a group's size with its Toggles.
 * Use when: implementing ToggleGroup's size inheritance. Avoid when: sizing an individual Toggle; pass size.
 */
export const ToggleGroupSizeContext = /*#__PURE__*/ createContext<ToggleProps["size"]>(undefined);

/** A tactile button that stays pressed for a filter, formatting option or segment.
 * Use when: a button represents a persistent selection, such as "Remote only".
 * Avoid when: an on/off setting applies immediately; use Switch (coming in M3).
 *
 * @example
 * <Toggle defaultPressed>Remote jobs only</Toggle>
 */
export function Toggle({ size, className, ...props }: ToggleProps) {
  const groupSize = use(ToggleGroupSizeContext);
  const resolvedSize = size ?? groupSize ?? "md";
  return (
    <BaseToggle
      {...props}
      data-slot="toggle"
      data-size={resolvedSize}
      className={cn(buttonStyles({ tone: "secondary", size: resolvedSize, className }), "data-pressed:press-primary")}
    />
  );
}
