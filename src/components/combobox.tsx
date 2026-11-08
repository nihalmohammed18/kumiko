"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, XIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { buttonStyles } from "./button-styles.ts";
import { type FieldStyleProps, fieldStyles } from "./field-styles.ts";

/** Props for Combobox's items, selection, filter text, popup state and form submission.
 * Use when: typing a single searchable choice. Avoid when: typing multiple selections; chips come later.
 */
export type ComboboxProps<Value = string, Item = Value> = Omit<BaseCombobox.Root.Props<Value, false, Item>, "multiple">;

/** Shares a controlled or uncontrolled single selection and filters predefined items as the user types.
 * Use when: choosing a company, city or skill from a long list. Avoid when: accepting free text; use SearchField.
 * Multiple selection with chips comes later.
 *
 * @example
 * const companies = ["Cedar Labs", "Maple Studio", "Northstar"];
 * <Field name="company">
 *   <Combobox items={companies}>
 *     <FieldLabel>Company</FieldLabel>
 *     <ComboboxInput placeholder="Search companies" />
 *     <ComboboxPopup>{(company: string) => <ComboboxItem key={company} value={company}>{company}</ComboboxItem>}</ComboboxPopup>
 *   </Combobox>
 *   <FieldError />
 * </Field>
 */
export function Combobox<Value, Item = Value>(props: ComboboxProps<Value, Item>) {
  const { locale } = useKumiko();
  return <BaseCombobox.Root {...props} multiple={false} locale={props.locale ?? locale} />;
}

/** Props for the searchable input and its field-sized group of controls.
 * Use when: typing ComboboxInput. Avoid when: configuring selection or filtering; use ComboboxProps.
 */
export interface ComboboxInputProps extends Omit<BaseCombobox.Input.Props, "size" | "className"> {
  className?: string;
  size?: FieldStyleProps["size"];
}

/** Combines a searchable field, a localized clear button and a popup chevron in one focus-ringed group.
 * Use when: filtering Combobox's items, inside a labeled Field. Avoid when: entering free-form text; use Input.
 */
export function ComboboxInput({ size, className, ...props }: ComboboxInputProps) {
  const { labels, locale } = useKumiko();
  const iconButtonClassName = buttonStyles({ tone: "ghost", size: "sm", iconOnly: true });
  return (
    <BaseCombobox.InputGroup
      data-slot="combobox-input-group"
      className={fieldStyles({
        size,
        className: cn(
          "flex items-center gap-1 pe-1",
          "has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-(length:--kumiko-ring-width) has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
          "data-readonly:not-data-disabled:bg-transparent data-readonly:not-data-disabled:border-line",
          className,
        ),
      })}
      render={(groupProps, state) => (
        <div {...groupProps}>
          <BaseCombobox.Input
            {...props}
            data-slot="combobox-input"
            className="min-w-0 flex-1 bg-transparent py-1.5 focus-visible:outline-solid focus-visible:outline-0 cursor-text data-disabled:cursor-not-allowed placeholder:text-ink-muted data-disabled:placeholder:text-disabled-text"
          />
          {/* Clearing can't happen in a disabled or read-only field, so the button isn't offered there. */}
          {!state.disabled && !state.readOnly && (
            <BaseCombobox.Clear
              data-slot="combobox-clear"
              aria-label={formatLabel(labels.clear, locale)}
              className={iconButtonClassName}
            >
              <XIcon />
            </BaseCombobox.Clear>
          )}
          <BaseCombobox.Trigger data-slot="combobox-trigger" className={iconButtonClassName}>
            <BaseCombobox.Icon data-slot="combobox-icon" className="flex shrink-0 items-center">
              <ChevronDownIcon />
            </BaseCombobox.Icon>
          </BaseCombobox.Trigger>
        </div>
      )}
    />
  );
}

/** Props for Combobox's portalled popup and filtered item renderer.
 * Use when: typing ComboboxPopup. Avoid when: configuring the open state; use ComboboxProps.
 */
export interface ComboboxPopupProps extends Omit<BaseCombobox.Popup.Props, "className" | "children"> {
  className?: string;
  children?: BaseCombobox.List.Props["children"];
}

/** Places a shared popup, a polite empty announcement and a filtered list below the input group.
 * Use when: rendering ComboboxItem or groups from the root's items with a function child.
 * Avoid when: showing arbitrary floating content; use Popover.
 */
export function ComboboxPopup({ className, children, ...props }: ComboboxPopupProps) {
  const { labels, locale } = useKumiko();
  return (
    <BaseCombobox.Portal data-slot="combobox-portal">
      <BaseCombobox.Positioner
        data-slot="combobox-positioner"
        className="z-popup"
        sideOffset={8}
        align="start"
        style={{ minInlineSize: "var(--anchor-width)", maxInlineSize: "var(--available-width)" }}
      >
        <BaseCombobox.Popup
          {...props}
          data-slot="combobox-popup"
          className={cn("popup font-body text-body", className)}
        >
          <BaseCombobox.Empty data-slot="combobox-empty">
            <div className="min-w-0 wrap-anywhere px-3 py-2 text-ink-muted">
              {formatLabel(labels.noMatches, locale)}
            </div>
          </BaseCombobox.Empty>
          <BaseCombobox.List data-slot="combobox-list">{children}</BaseCombobox.List>
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

/** Props for one searchable option's value, label and disabled state.
 * Use when: typing ComboboxItem. Avoid when: typing a section heading; use ComboboxGroupLabelProps.
 */
export interface ComboboxItemProps extends Omit<BaseCombobox.Item.Props, "className"> {
  className?: string;
}

/** Renders a wrapping option label and a check mark at its inline end when selected.
 * Use when: presenting a predefined searchable choice. Avoid when: running an action; use a menu item.
 */
export function ComboboxItem({ className, children, ...props }: ComboboxItemProps) {
  return (
    <BaseCombobox.Item {...props} data-slot="combobox-item" className={cn("popup-item py-1.5", className)}>
      <span data-slot="combobox-item-text" className="min-w-0 flex-1 wrap-anywhere">
        {children}
      </span>
      <BaseCombobox.ItemIndicator
        data-slot="combobox-item-indicator"
        keepMounted
        className={(state) =>
          cn("ms-auto flex size-5 shrink-0 items-center justify-center", !state.selected && "invisible")
        }
      >
        <CheckIcon className="size-5" />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

/** Props for a labeled section of searchable options.
 * Use when: typing ComboboxGroup. Avoid when: typing the entire list; use ComboboxPopupProps.
 */
export interface ComboboxGroupProps extends Omit<BaseCombobox.Group.Props, "className"> {
  className?: string;
}

/** Groups related ComboboxItem options under an accessible section label.
 * Use when: rendering a filtered group's items inside ComboboxPopup. Avoid when: options need no grouping.
 */
export function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return <BaseCombobox.Group {...props} data-slot="combobox-group" className={cn("min-w-0", className)} />;
}

/** Props for an accessible ComboboxGroup heading.
 * Use when: typing ComboboxGroupLabel. Avoid when: typing a selectable option; use ComboboxItemProps.
 */
export interface ComboboxGroupLabelProps extends Omit<BaseCombobox.GroupLabel.Props, "className"> {
  className?: string;
}

/** Names its ComboboxGroup with a wrapping, muted section heading.
 * Use when: labeling related options. Avoid when: labeling the searchable input; use FieldLabel.
 */
export function ComboboxGroupLabel({ className, ...props }: ComboboxGroupLabelProps) {
  return (
    <BaseCombobox.GroupLabel
      {...props}
      data-slot="combobox-group-label"
      className={cn("min-w-0 wrap-anywhere px-3 py-1.5 text-label font-bold text-ink-muted", className)}
    />
  );
}
