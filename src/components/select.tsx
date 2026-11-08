"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "../icons.tsx";
import { cn } from "../lib/tv.ts";
import { type FieldStyleProps, fieldStyles } from "./field-styles.ts";

/** Props for Select's items, value, popup state and form submission.
 * Use when: typing Select. Avoid when: typing a searchable choice; use Combobox.
 */
export type SelectProps<Value = string, Multiple extends boolean | undefined = false> = BaseSelect.Root.Props<
  Value,
  Multiple
>;

/** Shares a controlled or uncontrolled value and popup state between select parts.
 * Use when: choosing from a predefined list. Avoid when: a form has fewer than five options that can all stay visible;
 * use RadioGroup. For searching options, use Combobox.
 *
 * @example
 * const departments = ["Engineering", "Design", "Operations", "Sales", "Marketing"];
 * <Field name="department">
 *   <FieldLabel>Department</FieldLabel>
 *   <Select items={departments.map((value) => ({ value, label: value }))} defaultValue="Engineering">
 *     <SelectTrigger><SelectValue /></SelectTrigger>
 *     <SelectPopup>{departments.map((department) => <SelectItem key={department} value={department}>{department}</SelectItem>)}</SelectPopup>
 *   </Select>
 *   <FieldError />
 * </Field>
 */
export function Select<Value, Multiple extends boolean | undefined = false>(props: SelectProps<Value, Multiple>) {
  return <BaseSelect.Root {...props} />;
}

/** Props for the field-sized button that opens Select.
 * Use when: typing SelectTrigger. Avoid when: typing the selected label; use SelectValueProps.
 */
export interface SelectTriggerProps extends Omit<BaseSelect.Trigger.Props, "className"> {
  className?: string;
  size?: FieldStyleProps["size"];
}

/** Opens Select with a field-sized button and a downward chevron.
 * Use when: opening a predefined choice list. Avoid when: entering search text; use Combobox.
 */
export function SelectTrigger({ size, className, children, ...props }: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger
      {...props}
      data-slot="select-trigger"
      className={fieldStyles({
        size,
        pressable: true,
        className: cn("inline-flex items-center justify-between gap-2 py-1.5 text-start cursor-pointer", className),
      })}
    >
      {children}
      <BaseSelect.Icon data-slot="select-icon" className="flex shrink-0 items-center">
        <ChevronDownIcon className="size-5" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

/** Props for Select's selected label or placeholder.
 * Use when: typing SelectValue. Avoid when: typing an option; use SelectItemProps.
 */
export interface SelectValueProps extends Omit<BaseSelect.Value.Props, "className"> {
  className?: string;
}

/** Displays the selected item's label, formatted value or placeholder.
 * Use when: showing a choice in SelectTrigger. Avoid when: labeling the field; use FieldLabel.
 */
export function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <BaseSelect.Value
      {...props}
      data-slot="select-value"
      className={cn(
        "min-w-0 flex-1 wrap-anywhere data-placeholder:text-ink-muted in-data-disabled:data-placeholder:text-disabled-text",
        className,
      )}
    />
  );
}

/** Props for Select's portalled popup and closing focus behavior.
 * Use when: typing SelectPopup. Avoid when: typing the select's open state; use SelectProps.
 */
export interface SelectPopupProps extends Omit<BaseSelect.Popup.Props, "className"> {
  className?: string;
}

/** Places a shared popup and list below SelectTrigger, with an eight-pixel gap.
 * Use when: containing SelectItem and grouped options. Avoid when: showing arbitrary floating content; use Popover.
 */
export function SelectPopup({ className, children, ...props }: SelectPopupProps) {
  return (
    <BaseSelect.Portal data-slot="select-portal">
      <BaseSelect.Positioner
        data-slot="select-positioner"
        className="z-popup"
        sideOffset={8}
        alignItemWithTrigger={false}
        style={{ minInlineSize: "var(--anchor-width)", maxInlineSize: "var(--available-width)" }}
      >
        <BaseSelect.Popup {...props} data-slot="select-popup" className={cn("popup font-body text-body", className)}>
          <BaseSelect.List data-slot="select-list">{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

/** Props for one Select option's value, label and disabled state.
 * Use when: typing SelectItem. Avoid when: typing a section heading; use SelectGroupLabelProps.
 */
export interface SelectItemProps extends Omit<BaseSelect.Item.Props, "className"> {
  className?: string;
}

/** Renders a wrapping option label and a check mark at its inline end when selected.
 * Use when: presenting a predefined choice. Avoid when: running an action; use a menu item.
 */
export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <BaseSelect.Item {...props} data-slot="select-item" className={cn("popup-item py-1.5", className)}>
      <BaseSelect.ItemText data-slot="select-item-text" className="min-w-0 flex-1 wrap-anywhere">
        {children}
      </BaseSelect.ItemText>
      <BaseSelect.ItemIndicator
        data-slot="select-item-indicator"
        keepMounted
        className={(state) =>
          cn("ms-auto flex size-5 shrink-0 items-center justify-center", !state.selected && "invisible")
        }
      >
        <CheckIcon className="size-5" />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

/** Props for a labeled section of Select options.
 * Use when: typing SelectGroup. Avoid when: typing the entire option list; use SelectPopupProps.
 */
export interface SelectGroupProps extends Omit<BaseSelect.Group.Props, "className"> {
  className?: string;
}

/** Groups related SelectItem options under an accessible section label.
 * Use when: organizing a choice list into sections. Avoid when: the options need no grouping.
 */
export function SelectGroup({ className, ...props }: SelectGroupProps) {
  return <BaseSelect.Group {...props} data-slot="select-group" className={cn("min-w-0", className)} />;
}

/** Props for an accessible SelectGroup heading.
 * Use when: typing SelectGroupLabel. Avoid when: typing a selectable option; use SelectItemProps.
 */
export interface SelectGroupLabelProps extends Omit<BaseSelect.GroupLabel.Props, "className"> {
  className?: string;
}

/** Names its SelectGroup with a wrapping, muted section heading.
 * Use when: labeling related options. Avoid when: labeling the trigger; use FieldLabel.
 */
export function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  return (
    <BaseSelect.GroupLabel
      {...props}
      data-slot="select-group-label"
      className={cn("min-w-0 wrap-anywhere px-3 py-1.5 text-label font-bold text-ink-muted", className)}
    />
  );
}

/** Props for a visual divider in Select's list.
 * Use when: typing SelectSeparator. Avoid when: naming a section; use SelectGroupLabelProps.
 */
export interface SelectSeparatorProps extends Omit<BaseSelect.Separator.Props, "className"> {
  className?: string;
}

/** Draws a token-colored divider between Select options or groups.
 * Use when: separating related sections. Avoid when: a group label alone is enough.
 */
export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <BaseSelect.Separator
      {...props}
      data-slot="select-separator"
      className={cn("mx-3 my-1.5 border-0 border-bs-2 border-line", className)}
    />
  );
}
