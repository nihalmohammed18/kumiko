"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ReactNode } from "react";
import { CheckIcon, ChevronRightIcon } from "../icons.tsx";
import { cn } from "../lib/tv.ts";
import { buttonStyles } from "./button-styles.ts";
import { Kbd } from "./kbd.tsx";

/** Props for Menu's controlled or uncontrolled open state and trigger payload.
 * Use when: typing Menu. Avoid when: typing a choice field; use SelectProps.
 */
export type MenuProps<Payload = unknown> = BaseMenu.Root.Props<Payload>;

/** Shares open state and keyboard navigation between an action menu's parts.
 * Use when: offering a list of actions. Avoid when: choosing a form value; use Select or Combobox.
 *
 * @example
 * <Menu>
 *   <MenuTrigger>Application actions</MenuTrigger>
 *   <MenuPopup>
 *     <MenuItem onClick={() => navigator.clipboard.writeText("https://jobs.example.com/applications/a1")}>Copy application link</MenuItem>
 *     <MenuLinkItem href="/applications/a1">View application</MenuLinkItem>
 *   </MenuPopup>
 * </Menu>
 */
export function Menu<Payload = unknown>(props: MenuProps<Payload>) {
  return <BaseMenu.Root {...props} />;
}

/** Props for the button that opens Menu, including a composed Button or IconButton.
 * Use when: typing MenuTrigger. Avoid when: typing a nested trigger; use MenuSubmenuTriggerProps.
 */
export interface MenuTriggerProps<Payload = unknown> extends Omit<BaseMenu.Trigger.Props<Payload>, "className"> {
  className?: string;
}

/** Opens Menu with a button, or a consumer's button supplied through render.
 * Use when: revealing actions by pointer or keyboard. Avoid when: navigating; use Link or LinkButton.
 */
export function MenuTrigger<Payload = unknown>({ className, ...props }: MenuTriggerProps<Payload>) {
  return (
    <BaseMenu.Trigger
      {...props}
      data-slot="menu-trigger"
      className={props.render ? className : buttonStyles({ className: cn("max-w-full wrap-anywhere", className) })}
    />
  );
}

/** Props for Menu's portalled popup and closing focus behavior.
 * Use when: typing MenuPopup. Avoid when: configuring open state; use MenuProps.
 */
export interface MenuPopupProps extends Omit<BaseMenu.Popup.Props, "className"> {
  className?: string;
}

/** Positions a scrolling menu with an eight-pixel gap and at least its trigger's width.
 * Use when: containing menu items; submenus default to the inline end. Avoid when: showing arbitrary content; use Popover.
 */
export function MenuPopup({ className, ...props }: MenuPopupProps) {
  return (
    <BaseMenu.Portal data-slot="menu-portal">
      <BaseMenu.Positioner
        data-slot="menu-positioner"
        className="z-popup"
        sideOffset={8}
        style={{ minInlineSize: "var(--anchor-width)", maxInlineSize: "var(--available-width)" }}
      >
        <BaseMenu.Popup {...props} data-slot="menu-popup" className={cn("popup font-body text-body", className)} />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

interface ItemOptions {
  className?: string;
  /** A decorative leading icon, sized to twenty pixels. */
  icon?: ReactNode;
  /** A visual keycap hint; this does not register a keyboard shortcut. */
  shortcut?: ReactNode;
  tone?: "default" | "danger";
}

function ItemContent({ icon, shortcut, children }: Pick<ItemOptions, "icon" | "shortcut"> & { children?: ReactNode }) {
  return (
    <>
      {icon != null && (
        <span
          data-slot="menu-item-icon"
          aria-hidden
          className="flex size-5 shrink-0 items-center justify-center [&_svg]:size-5"
        >
          {icon}
        </span>
      )}
      <span data-slot="menu-item-text" className="min-w-0 flex-1 wrap-anywhere">
        {children}
      </span>
      {shortcut != null && (
        <Kbd aria-hidden className="ms-auto shrink-0">
          {shortcut}
        </Kbd>
      )}
    </>
  );
}

/** Props for a menu action, its decorative slots, tone and disabled state.
 * Use when: typing MenuItem. Avoid when: typing navigation; use MenuLinkItemProps.
 */
export interface MenuItemProps extends Omit<BaseMenu.Item.Props, "className">, ItemOptions {}

/** Runs an action and closes Menu by default, with a wrapping label and optional icon and shortcut hint.
 * Use when: editing, duplicating or deleting an alert; use danger for destructive actions.
 * Avoid when: navigating; use MenuLinkItem. To open a dialog, set its controlled open state in onClick.
 */
export function MenuItem({ className, icon, shortcut, tone = "default", children, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item
      {...props}
      data-slot="menu-item"
      data-tone={tone}
      className={cn("popup-item py-1.5", tone === "danger" && "menu-item-danger", className)}
    >
      <ItemContent icon={icon} shortcut={shortcut}>
        {children}
      </ItemContent>
    </BaseMenu.Item>
  );
}

/** Props for a native or framework navigation link inside Menu.
 * Use when: typing MenuLinkItem, including render={<NextLink href="/alerts" />}. Avoid when: typing an action; use MenuItemProps.
 */
export interface MenuLinkItemProps extends Omit<BaseMenu.LinkItem.Props, "className">, ItemOptions {}

/** Navigates through an anchor or framework link, preserving Base UI's link keyboard behavior.
 * Use when: an item has a destination href. Avoid when: changing this page's state; use MenuItem.
 */
export function MenuLinkItem({ className, icon, shortcut, tone = "default", children, ...props }: MenuLinkItemProps) {
  return (
    <BaseMenu.LinkItem
      {...props}
      data-slot="menu-link-item"
      data-tone={tone}
      rel={props.rel ?? (props.target === "_blank" ? "noopener noreferrer" : undefined)}
      className={cn("popup-item py-1.5", tone === "danger" && "menu-item-danger", className)}
    >
      <ItemContent icon={icon} shortcut={shortcut}>
        {children}
      </ItemContent>
    </BaseMenu.LinkItem>
  );
}

/** Props for a controlled or uncontrolled checkbox menu item.
 * Use when: typing MenuCheckboxItem. Avoid when: requiring one exclusive choice; use MenuRadioItemProps.
 */
export interface MenuCheckboxItemProps extends Omit<BaseMenu.CheckboxItem.Props, "className">, ItemOptions {}

/** Toggles a setting without closing Menu by default and reserves its inline-end check mark slot.
 * Use when: independently showing salary or remote roles. Avoid when: collecting form data; use Checkbox.
 */
export function MenuCheckboxItem({
  className,
  icon,
  shortcut,
  tone = "default",
  children,
  ...props
}: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      {...props}
      data-slot="menu-checkbox-item"
      data-tone={tone}
      className={cn("popup-item py-1.5", tone === "danger" && "menu-item-danger", className)}
    >
      <ItemContent icon={icon} shortcut={shortcut}>
        {children}
      </ItemContent>
      <BaseMenu.CheckboxItemIndicator
        data-slot="menu-checkbox-item-indicator"
        aria-hidden
        keepMounted
        className={(state) =>
          cn("ms-auto flex size-5 shrink-0 items-center justify-center", !state.checked && "invisible")
        }
      >
        <CheckIcon className="size-5" />
      </BaseMenu.CheckboxItemIndicator>
    </BaseMenu.CheckboxItem>
  );
}

/** Props for a controlled or uncontrolled group of exclusive menu choices.
 * Use when: typing MenuRadioGroup. Avoid when: grouping independent actions; use MenuGroupProps.
 */
export interface MenuRadioGroupProps extends Omit<BaseMenu.RadioGroup.Props, "className"> {
  className?: string;
}

/** Shares a value between exclusive menu choices and associates their group label.
 * Use when: choosing a sort order inside Menu. Avoid when: collecting form data; use RadioGroup.
 */
export function MenuRadioGroup({ className, ...props }: MenuRadioGroupProps) {
  return <BaseMenu.RadioGroup {...props} data-slot="menu-radio-group" className={cn("min-w-0", className)} />;
}

/** Props for one exclusive menu choice and its decorative slots.
 * Use when: typing MenuRadioItem. Avoid when: toggling an independent setting; use MenuCheckboxItemProps.
 */
export interface MenuRadioItemProps extends Omit<BaseMenu.RadioItem.Props, "className">, ItemOptions {}

/** Selects a MenuRadioGroup value without closing by default and reserves its inline-end dot slot.
 * Use when: offering exclusive sort or view settings. Avoid when: running an action; use MenuItem.
 */
export function MenuRadioItem({ className, icon, shortcut, tone = "default", children, ...props }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem
      {...props}
      data-slot="menu-radio-item"
      data-tone={tone}
      className={cn("popup-item py-1.5", tone === "danger" && "menu-item-danger", className)}
    >
      <ItemContent icon={icon} shortcut={shortcut}>
        {children}
      </ItemContent>
      <BaseMenu.RadioItemIndicator
        data-slot="menu-radio-item-indicator"
        aria-hidden
        keepMounted
        className={(state) =>
          cn("ms-auto flex size-5 shrink-0 items-center justify-center", !state.checked && "invisible")
        }
      >
        <span className="size-2 rounded-pill bg-current forced-color-adjust-none" />
      </BaseMenu.RadioItemIndicator>
    </BaseMenu.RadioItem>
  );
}

/** Props for an accessible section of related menu items.
 * Use when: typing MenuGroup. Avoid when: sharing an exclusive value; use MenuRadioGroupProps.
 */
export interface MenuGroupProps extends Omit<BaseMenu.Group.Props, "className"> {
  className?: string;
}

/** Groups related actions under an accessible MenuGroupLabel.
 * Use when: organizing a menu into sections. Avoid when: a separator alone makes the relationship clear.
 */
export function MenuGroup({ className, ...props }: MenuGroupProps) {
  return <BaseMenu.Group {...props} data-slot="menu-group" className={cn("min-w-0", className)} />;
}

/** Props for a menu section's accessible heading.
 * Use when: typing MenuGroupLabel. Avoid when: typing an actionable label; use MenuItemProps.
 */
export interface MenuGroupLabelProps extends Omit<BaseMenu.GroupLabel.Props, "className"> {
  className?: string;
}

/** Names its MenuGroup or MenuRadioGroup with a wrapping, muted heading.
 * Use when: labeling related actions or choices. Avoid when: labeling the trigger; use its visible text or aria-label.
 */
export function MenuGroupLabel({ className, ...props }: MenuGroupLabelProps) {
  return (
    <BaseMenu.GroupLabel
      {...props}
      data-slot="menu-group-label"
      className={cn("min-w-0 wrap-anywhere px-3 py-1.5 text-label font-bold text-ink-muted", className)}
    />
  );
}

/** Props for a horizontal divider between menu sections.
 * Use when: typing MenuSeparator. Avoid when: naming a section; use MenuGroupLabelProps.
 */
export interface MenuSeparatorProps extends Omit<BaseMenu.Separator.Props, "className" | "orientation"> {
  className?: string;
}

/** Draws a two-pixel token-colored rule with four-pixel margins.
 * Use when: separating related menu sections. Avoid when: a group label alone is enough.
 */
export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return (
    <BaseMenu.Separator
      {...props}
      data-slot="menu-separator"
      orientation="horizontal"
      className={cn("m-1 border-0 border-bs-2 border-line", className)}
    />
  );
}

/** Props for a controlled or uncontrolled nested menu.
 * Use when: typing MenuSubmenu. Avoid when: typing a top-level menu; use MenuProps.
 */
export type MenuSubmenuProps = BaseMenu.SubmenuRoot.Props;

/** Shares a nested menu's state and reading-direction keyboard navigation with its parent.
 * Use when: offering a short secondary action list. Avoid when: deeply nesting actions that can stay visible.
 */
export function MenuSubmenu(props: MenuSubmenuProps) {
  return <BaseMenu.SubmenuRoot {...props} />;
}

/** Props for the item that opens a submenu by hover, pointer or keyboard.
 * Use when: typing MenuSubmenuTrigger. Avoid when: typing a top-level trigger; use MenuTriggerProps.
 */
export interface MenuSubmenuTriggerProps extends Omit<BaseMenu.SubmenuTrigger.Props, "className">, ItemOptions {}

/** Opens a submenu on hover by default and ends with a chevron mirrored in right-to-left layouts.
 * Use when: revealing nested actions such as Share. Avoid when: running an immediate action; use MenuItem.
 */
export function MenuSubmenuTrigger({
  className,
  icon,
  shortcut,
  tone = "default",
  children,
  ...props
}: MenuSubmenuTriggerProps) {
  return (
    <BaseMenu.SubmenuTrigger
      {...props}
      data-slot="menu-submenu-trigger"
      data-tone={tone}
      className={cn("popup-item py-1.5", tone === "danger" && "menu-item-danger", className)}
    >
      <ItemContent icon={icon} shortcut={shortcut}>
        {children}
      </ItemContent>
      <ChevronRightIcon className="ms-auto size-5 shrink-0" />
    </BaseMenu.SubmenuTrigger>
  );
}
