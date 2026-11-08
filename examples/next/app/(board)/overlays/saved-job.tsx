"use client";

import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardTitle,
  CheckIcon,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
  IconButton,
  LinkButton,
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuTrigger,
  Popover,
  PopoverClose,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
  toast,
} from "kumiko-ui";
import NextLink from "next/link";
import { useRef, useState } from "react";

/** Reviews a saved role, changes reminder settings and offers a real Undo action.
 * Use when: exploring the overlay controls. Avoid when: persisting a shortlist across sessions.
 */
export function SavedJob() {
  const [saved, setSaved] = useState(true);
  const [reviewed, setReviewed] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [cadence, setCadence] = useState("weekly");
  const roleActions = useRef<HTMLButtonElement>(null);
  return (
    <TooltipProvider>
      <Card>
        <CardTitle level={2}>Product designer at Maple Studio</CardTitle>
        <CardDescription>Remote · A small team with a dedicated mentor.</CardDescription>
        <div className="flex flex-wrap gap-2">
          <Badge>{saved ? "Saved" : "Removed from saved"}</Badge>
          <Badge>{reviewed ? "Reviewed" : "Ready to review"}</Badge>
        </div>
        <p className="text-body-sm text-ink-muted">{reminders ? `Reminders: ${cadence}` : "Reminders are off"}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            disabled={!saved}
            onClick={() => {
              setSaved(false);
              toast("Role removed from saved jobs", { action: { label: "Undo", onClick: () => setSaved(true) } });
              // Keep keyboard focus on an enabled action after this button becomes disabled.
              roleActions.current?.focus();
            }}
          >
            Remove saved role
          </Button>
          <Tooltip>
            <TooltipTrigger
              render={
                <IconButton
                  aria-label="Mark as reviewed"
                  onClick={() => {
                    setReviewed(true);
                    toast.success("Role marked as reviewed");
                  }}
                />
              }
            >
              <CheckIcon />
            </TooltipTrigger>
            <TooltipPopup>Mark as reviewed</TooltipPopup>
          </Tooltip>
          <Menu>
            <MenuTrigger ref={roleActions}>Role actions</MenuTrigger>
            <MenuPopup>
              <MenuItem
                disabled={saved}
                onClick={() => {
                  setSaved(true);
                  toast.success("Role saved");
                }}
              >
                Restore saved role
              </MenuItem>
              <MenuGroup>
                <MenuGroupLabel>Notifications</MenuGroupLabel>
                <MenuCheckboxItem checked={reminders} onCheckedChange={setReminders}>
                  Job reminders
                </MenuCheckboxItem>
              </MenuGroup>
              <MenuRadioGroup value={cadence} onValueChange={setCadence}>
                <MenuGroupLabel>Reminder frequency</MenuGroupLabel>
                <MenuRadioItem value="daily">Daily</MenuRadioItem>
                <MenuRadioItem value="weekly">Weekly</MenuRadioItem>
              </MenuRadioGroup>
              <MenuSeparator />
              <MenuSubmenu>
                <MenuSubmenuTrigger>Next steps</MenuSubmenuTrigger>
                <MenuPopup>
                  <MenuLinkItem render={<NextLink href="/forms" />}>Prepare your profile</MenuLinkItem>
                  <MenuLinkItem render={<NextLink href="/email" />}>Preview your job digest</MenuLinkItem>
                </MenuPopup>
              </MenuSubmenu>
            </MenuPopup>
          </Menu>
          <Popover>
            <PopoverTrigger>About the team</PopoverTrigger>
            <PopoverPopup arrow>
              <PopoverTitle>Hiring at Maple Studio</PopoverTitle>
              <PopoverDescription>
                You will pair with a senior designer and help improve the first-time customer experience.
              </PopoverDescription>
              <PopoverClose className="mt-4">Got it</PopoverClose>
            </PopoverPopup>
          </Popover>
          <Drawer side="end">
            <DrawerTrigger>Review shortlist</DrawerTrigger>
            <DrawerPopup>
              <DrawerTitle>Your shortlist</DrawerTitle>
              <DrawerDescription>Keep good opportunities close while you prepare.</DrawerDescription>
              <DrawerBody>
                <p>{saved ? "Product designer at Maple Studio, remote" : "Your shortlist is empty."}</p>
                <LinkButton render={<NextLink href="/navigation" />} className="mt-4">
                  Browse jobs
                </LinkButton>
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose>Keep browsing</DrawerClose>
              </DrawerFooter>
            </DrawerPopup>
          </Drawer>
          <Button
            disabled={!saved}
            onClick={() =>
              toast.achievement("Your first shortlist", { description: "One thoughtful choice is a good start." })
            }
          >
            Celebrate this step
          </Button>
        </div>
      </Card>
    </TooltipProvider>
  );
}
