"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { mergeProps } from "@base-ui/react/merge-props";
import {
  Children,
  type ComponentProps,
  cloneElement,
  createContext,
  type ReactNode,
  type RefObject,
  use,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { MenuIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { buttonStyles } from "./button-styles.ts";
import { Drawer, DrawerPopup, type DrawerProps, DrawerTitle } from "./drawer.tsx";
import type { LinkProps } from "./link.tsx";

const SidebarActions = createContext<RefObject<BaseDrawer.Root.Actions | null> | null>(null);
const desktopQuery = "(min-width: 64rem)";

function subscribeToDesktop(onChange: () => void) {
  const media = matchMedia(desktopQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isDesktop() {
  return matchMedia(desktopQuery).matches;
}

/** App-shell props with sidebar content and controlled or uncontrolled phone drawer state.
 * Use when: typing SidebarLayout. Avoid when: typing navigation content alone; use SidebarProps.
 */
export interface SidebarLayoutProps
  extends ComponentProps<"div">,
    Pick<DrawerProps, "open" | "defaultOpen" | "onOpenChange"> {
  sidebar: ReactNode;
}

/** Places navigation at the inline start on desktop and in a start-side Drawer on phones.
 * Use when: composing an app shell with SidebarTrigger in its main header. Sidebar content mounts in one place
 * at a time, preserving consumer ID uniqueness; changing between desktop and phone remounts that content.
 * Avoid when: building navigation within a small container; this shell follows the viewport's lg breakpoint.
 */
export function SidebarLayout({
  sidebar,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: SidebarLayoutProps) {
  const desktop = useSyncExternalStore(subscribeToDesktop, isDesktop, () => true);
  const actions = useRef<BaseDrawer.Root.Actions | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const { labels, locale } = useKumiko();

  useEffect(() => {
    if (desktop && open) actions.current?.close();
  }, [desktop, open]);

  return (
    <SidebarActions value={desktop ? null : actions}>
      <Drawer
        side="start"
        open={open && !desktop}
        actionsRef={actions}
        onOpenChange={(nextOpen, details) => {
          onOpenChange?.(nextOpen, details);
          if (!details.isCanceled) setUncontrolledOpen(nextOpen);
        }}
      >
        <div
          {...props}
          data-slot="sidebar-layout"
          className={cn("grid min-h-dvh min-w-0 lg:grid-cols-[16rem_minmax(0,1fr)]", className)}
        >
          {/* Mutually exclusive content also avoids duplicate IDs during the drawer's closing animation. */}
          <div data-slot="sidebar-column" className="sidebar-column hidden lg:block">
            {desktop && sidebar}
          </div>
          <div data-slot="sidebar-main" className="min-w-0">
            {children}
          </div>
        </div>
        {/* The popup stays mounted so Base UI can finish closing it when the viewport widens; unmounting it
            mid-close left a closing popup behind when the viewport narrowed again. Only its content follows the
            breakpoint, so the column and the drawer never hold the sidebar at once. */}
        <DrawerPopup className="sidebar-drawer gap-0 p-0">
          <DrawerTitle className="px-4 pt-6 pb-4 pe-20">{formatLabel(labels.navigation, locale)}</DrawerTitle>
          <BaseDrawer.Content data-slot="sidebar-drawer-content" className="min-h-0 flex-1 touch-auto">
            {!desktop && sidebar}
          </BaseDrawer.Content>
        </DrawerPopup>
      </Drawer>
    </SidebarActions>
  );
}

/** Native props for the sidebar's navigation landmark.
 * Use when: typing Sidebar. Avoid when: typing the surrounding page; use SidebarLayoutProps.
 */
export interface SidebarProps extends ComponentProps<"nav"> {}

/** A named navigation landmark with a fixed header and footer around scrolling content.
 * Use when: containing SidebarHeader, SidebarContent and SidebarFooter. Avoid when: displaying a menu of actions.
 */
export function Sidebar({ className, ...props }: SidebarProps) {
  const { labels, locale } = useKumiko();
  return (
    <nav
      {...props}
      data-slot="sidebar"
      aria-label={props["aria-label"] ?? formatLabel(labels.navigation, locale)}
      className={cn("flex h-full min-h-0 min-w-0 flex-col bg-surface font-body text-body text-ink", className)}
    />
  );
}

/** Native props for the sidebar's fixed header.
 * Use when: typing SidebarHeader. Avoid when: typing its scrolling middle; use SidebarContentProps.
 */
export interface SidebarHeaderProps extends ComponentProps<"div"> {}

/** Keeps a logo or product name above the navigation's scroll area.
 * Use when: identifying the app. Avoid when: placing links that belong in SidebarContent.
 */
export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return <div {...props} data-slot="sidebar-header" className={cn("min-w-0 shrink-0 p-4 wrap-anywhere", className)} />;
}

/** Native props for the sidebar's scrolling link area.
 * Use when: typing SidebarContent. Avoid when: typing fixed account information; use SidebarFooterProps.
 */
export interface SidebarContentProps extends ComponentProps<"div"> {}

/** Scrolls navigation inside the sidebar, containing overscroll and keeping focus rings inset.
 * Use when: containing groups or long lists of links. Avoid when: placing the app's main page content.
 */
export function SidebarContent({ className, ...props }: SidebarContentProps) {
  // Not a Tab stop of its own: it always holds links, and focusing one scrolls it into view. scroll-padding keeps
  // that scroll from pushing the first link's top edge, and its ring, out past the padding.
  return (
    <div
      {...props}
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-3 scroll-py-3 touch-auto",
        className,
      )}
    />
  );
}

/** Native props for the sidebar's fixed footer.
 * Use when: typing SidebarFooter. Avoid when: typing a group of navigation links; use SidebarGroupProps.
 */
export interface SidebarFooterProps extends ComponentProps<"div"> {}

/** Keeps account information below the navigation's scroll area.
 * Use when: showing the signed-in account or workspace. Avoid when: placing content that should scroll.
 */
export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return <div {...props} data-slot="sidebar-footer" className={cn("min-w-0 shrink-0 p-4 wrap-anywhere", className)} />;
}

/** Native group props with an optional visible label naming its link list.
 * Use when: typing SidebarGroup. Avoid when: typing an individual destination; use SidebarLinkProps.
 */
export interface SidebarGroupProps extends Omit<ComponentProps<"fieldset">, "disabled" | "role"> {
  label?: string;
}

/** Groups sidebar links in a semantic list, optionally named by a visible label.
 * Use when: separating destinations by purpose. Avoid when: offering an action menu; use MenuGroup.
 */
export function SidebarGroup({ label, className, children, ...props }: SidebarGroupProps) {
  const labelId = useId();
  return (
    <fieldset
      {...props}
      data-slot="sidebar-group"
      aria-labelledby={label === undefined ? props["aria-labelledby"] : labelId}
      className={cn("min-w-0 shrink-0", className)}
    >
      {label !== undefined && (
        <div
          id={labelId}
          data-slot="sidebar-group-label"
          className="mb-2 px-3 text-label font-bold text-ink-muted wrap-anywhere"
        >
          {label}
        </div>
      )}
      <ul className="grid gap-1.5">
        {Children.map(children, (child) => (child === null ? null : <li className="min-w-0">{child}</li>))}
      </ul>
    </fieldset>
  );
}

/** Native or framework navigation props with a leading icon, trailing badge and current-page marker.
 * Use when: typing SidebarLink. Avoid when: disabling an action; sidebar destinations are links.
 */
export interface SidebarLinkProps extends LinkProps {
  icon?: ReactNode;
  badge?: ReactNode;
  current?: boolean;
}

/** A wrapping navigation link with inset keyboard focus and a bordered current-page marker.
 * Use when: linking to an app destination; ordinary same-tab activation closes the phone drawer.
 * Avoid when: running an action or presenting a disabled destination; use Button for actions.
 */
export function SidebarLink({ icon, badge, current = false, className, render, children, ...props }: SidebarLinkProps) {
  const actions = use(SidebarActions);
  const anchorProps = mergeProps<"a">(
    {
      onClick(event) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.currentTarget.target === "_blank" || event.currentTarget.hasAttribute("download")) return;
        actions?.current?.close();
      },
    },
    props,
    render?.props,
  );
  if (anchorProps.target === "_blank" && anchorProps.rel === undefined) anchorProps.rel = "noopener noreferrer";
  const linkProps = {
    ...anchorProps,
    "data-slot": "sidebar-link",
    "aria-current": current ? ("page" as const) : anchorProps["aria-current"],
    className: cn(
      "sidebar-link w-full min-w-0 select-text font-body text-body font-bold wrap-anywhere",
      render?.props.className as string | undefined,
      className,
    ),
    children: (
      <>
        {icon && (
          <span
            data-slot="sidebar-link-icon"
            aria-hidden
            className="flex size-6 shrink-0 items-center justify-center [&>svg]:size-6"
          >
            {icon}
          </span>
        )}
        <span data-slot="sidebar-link-label" className="min-w-0 flex-1">
          {children}
        </span>
        {badge && (
          <span data-slot="sidebar-link-badge" className="ms-auto min-w-0 shrink-0">
            {badge}
          </span>
        )}
      </>
    ),
  };
  return render ? cloneElement(render, linkProps) : <a {...linkProps} />;
}

/** Drawer trigger props; the name, icon and look are built in.
 * Use when: typing SidebarTrigger. Avoid when: typing a link inside the sidebar; use SidebarLinkProps.
 */
export interface SidebarTriggerProps extends Omit<BaseDrawer.Trigger.Props, "aria-label" | "children" | "className"> {
  className?: string;
}

/** Opens phone navigation with a localized menu icon button, hidden at the lg breakpoint.
 * Use when: placing the opener in SidebarLayout's main header. Avoid when: placing it outside SidebarLayout.
 */
export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { labels, locale } = useKumiko();
  // One Base UI part with the icon-button look, as DrawerTrigger does; composing IconButton through render nested two.
  return (
    <BaseDrawer.Trigger
      {...props}
      data-slot="sidebar-trigger"
      aria-label={formatLabel(labels.openNavigation, locale)}
      className={buttonStyles({ tone: "ghost", iconOnly: true, className: cn("lg:hidden", className) })}
    >
      <MenuIcon />
    </BaseDrawer.Trigger>
  );
}
