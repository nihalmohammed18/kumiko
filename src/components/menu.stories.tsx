import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, Ellipsis, Pencil, Share2, Trash2 } from "lucide-react";
import { type ComponentProps, type MouseEvent, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { IconButton } from "./button.tsx";
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  type MenuProps,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuTrigger,
} from "./menu.tsx";

interface ExampleProps extends MenuProps {
  onAction?: (event: MouseEvent<HTMLElement>) => void;
}

interface ActionMenuProps extends ExampleProps {
  label?: string;
  demo?: string;
  decorated?: boolean;
  highlighted?: boolean;
  disabledItem?: boolean;
}

function ActionMenu({
  onAction,
  label = "More actions",
  demo,
  decorated,
  highlighted,
  disabledItem,
  ...props
}: ActionMenuProps) {
  return (
    <Menu {...props}>
      <MenuTrigger data-demo={demo} render={<IconButton aria-label={label} />}>
        <Ellipsis aria-hidden />
      </MenuTrigger>
      <MenuPopup>
        <MenuItem
          onClick={onAction}
          icon={decorated ? <Pencil /> : undefined}
          shortcut={decorated ? "Ctrl E" : undefined}
          {...(highlighted ? { "data-highlighted": "" } : {})}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={onAction}
          icon={decorated ? <Copy /> : undefined}
          shortcut={decorated ? "Ctrl D" : undefined}
        >
          Duplicate
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          tone="danger"
          onClick={onAction}
          disabled={disabledItem}
          icon={decorated ? <Trash2 /> : undefined}
          shortcut={decorated ? "Del" : undefined}
        >
          Delete
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}

const meta = {
  title: "Overlays/Menu",
  component: Menu,
  subcomponents: {
    MenuTrigger,
    MenuPopup,
    MenuItem,
    MenuLinkItem,
    MenuCheckboxItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuGroup,
    MenuGroupLabel,
    MenuSeparator,
    MenuSubmenu,
    MenuSubmenuTrigger,
  },
  args: { onAction: fn(), onOpenChange: fn() },
  render: (args) => <ActionMenu {...args} />,
} satisfies Meta<ExampleProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "More actions" });
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
    // A pointer open may focus the popup; Home establishes the first item before moving to the next.
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Edit" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => {
      const duplicate = body.getByRole("menuitem", { name: "Duplicate" });
      expect(duplicate).toHaveFocus();
      expect(duplicate).toHaveAttribute("data-highlighted");
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(args.onAction).toHaveBeenCalledOnce();
      expect(document.querySelector("[data-slot=menu-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
    });
  },
};

function ViewMenu({ onAction, ...props }: ExampleProps) {
  const [sort, setSort] = useState("newest");
  return (
    <Menu {...props}>
      <MenuTrigger>View</MenuTrigger>
      <MenuPopup>
        <MenuGroup>
          <MenuGroupLabel>Visibility</MenuGroupLabel>
          <MenuCheckboxItem defaultChecked onClick={onAction}>
            Show salary
          </MenuCheckboxItem>
          <MenuCheckboxItem>Show remote only</MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuRadioGroup value={sort} onValueChange={setSort}>
          <MenuGroupLabel>Sort</MenuGroupLabel>
          <MenuRadioItem value="newest">Newest</MenuRadioItem>
          <MenuRadioItem value="salary">Salary</MenuRadioItem>
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  );
}

export const CheckboxAndRadio: Story = {
  name: "Checkbox and radio",
  render: (args) => <ViewMenu {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "View" }));
    await waitFor(() =>
      expect(body.getByRole("menuitemcheckbox", { name: "Show salary" })).toHaveAttribute("aria-checked", "true"),
    );
    await userEvent.click(body.getByRole("menuitemcheckbox", { name: "Show salary" }));
    await waitFor(() => {
      expect(body.getByRole("menu")).toBeVisible();
      expect(body.getByRole("menuitemcheckbox", { name: "Show salary" })).toHaveAttribute("aria-checked", "false");
    });
    await userEvent.click(body.getByRole("menuitemradio", { name: "Salary" }));
    await waitFor(() => {
      expect(body.getByRole("menuitemradio", { name: "Salary" })).toHaveAttribute("aria-checked", "true");
      expect(body.getByRole("menuitemradio", { name: "Newest" })).toHaveAttribute("aria-checked", "false");
    });
    // End at rest: the harness measures the trigger, and an open menu would close under its probe.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvasElement.ownerDocument.querySelector("[data-slot=menu-popup]")).toBeNull());
  },
};

export const Submenu: Story = {
  render: ({ onAction, ...args }) => (
    <Menu {...args}>
      <MenuTrigger>Alert actions</MenuTrigger>
      <MenuPopup>
        <MenuItem onClick={onAction}>Edit alert</MenuItem>
        <MenuSubmenu>
          <MenuSubmenuTrigger icon={<Share2 />}>Share</MenuSubmenuTrigger>
          <MenuPopup>
            <MenuItem onClick={onAction}>Copy link</MenuItem>
            <MenuItem onClick={onAction}>Email</MenuItem>
          </MenuPopup>
        </MenuSubmenu>
      </MenuPopup>
    </Menu>
  ),
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Alert actions" });
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Edit alert" })).toHaveFocus());
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Share" })).toHaveFocus());
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Copy link" })).toHaveFocus());
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowRight}" : "{ArrowLeft}");
    await waitFor(() => {
      expect(document.querySelectorAll("[data-slot=menu-popup]")).toHaveLength(1);
      expect(body.getByRole("menuitem", { name: "Share" })).toHaveFocus();
    });
    if (matchMedia("(hover: hover)").matches) {
      await userEvent.hover(body.getByRole("menuitem", { name: "Share" }));
      await waitFor(() => expect(body.getByRole("menu", { name: "Share" })).toBeVisible());
      await userEvent.hover(body.getByRole("menuitem", { name: "Edit alert" }));
      await waitFor(() => expect(document.querySelectorAll("[data-slot=menu-popup]")).toHaveLength(1));
    }
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.querySelector("[data-slot=menu-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
    });
  },
};

export const WithShortcutsAndIcons: Story = {
  name: "With shortcuts and icons",
  args: { open: true },
  parameters: { vrt: "page" },
  render: (args) => <ActionMenu {...args} decorated />,
  play: async ({ args, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Edit" })).toHaveAccessibleName("Edit"));
    const edit = body.getByRole("menuitem", { name: "Edit" });
    await waitFor(() => {
      expect(edit.querySelector("kbd")).toHaveAttribute("aria-hidden", "true");
      expect(edit).not.toHaveAttribute("aria-keyshortcuts");
    });
    body.getByRole("menu").focus();
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(edit).toHaveFocus());
    await userEvent.keyboard(" ");
    await waitFor(() => expect(args.onAction).toHaveBeenCalledOnce());
    await userEvent.keyboard("du");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus());
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Delete" })).toHaveFocus());
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(edit).toHaveFocus());
  },
};

// A framework link must pass the received props, including React 19's ref, to its anchor.
function AppLink(props: ComponentProps<"a">) {
  return <a {...props} />;
}

export const Links: Story = {
  args: { open: true, onAction: fn((event: MouseEvent<HTMLElement>) => event.preventDefault()) },
  parameters: { vrt: "page" },
  render: ({ onAction, ...args }) => (
    <Menu {...args}>
      <MenuTrigger>Go to</MenuTrigger>
      <MenuPopup>
        <MenuLinkItem href="#saved-alerts" onClick={onAction}>
          Saved alerts
        </MenuLinkItem>
        <MenuLinkItem render={<AppLink href="#all-alerts" />} onClick={onAction}>
          All alerts
        </MenuLinkItem>
      </MenuPopup>
    </Menu>
  ),
  play: async ({ args, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() =>
      expect(body.getByRole("menuitem", { name: "Saved alerts" })).toHaveAttribute("href", "#saved-alerts"),
    );
    const saved = body.getByRole("menuitem", { name: "Saved alerts" });
    const all = body.getByRole("menuitem", { name: "All alerts" });
    await waitFor(() => {
      expect(saved.tagName).toBe("A");
      expect(all.tagName).toBe("A");
      expect(all).toHaveAttribute("href", "#all-alerts");
    });
    await userEvent.click(saved);
    await waitFor(() => expect(args.onAction).toHaveBeenCalledOnce());
    body.getByRole("menu").focus();
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(all).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(args.onAction).toHaveBeenCalledTimes(2));
  },
};

export const Open: Story = {
  // Base UI's trigger focus guards call each other without end in WebKit when Tab reaches a menu held open with
  // `open`, so the nightly WebKit run skips this story; Chromium runs it.
  tags: ["no-webkit"],
  args: { open: true },
  parameters: { vrt: "page" },
  render: (args) => <ActionMenu {...args} highlighted disabledItem />,
  play: async ({ args, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() =>
      expect(body.getByRole("menuitem", { name: "Delete" })).toHaveAttribute("aria-disabled", "true"),
    );
    await userEvent.click(body.getByRole("menuitem", { name: "Delete" }));
    await waitFor(() => {
      expect(args.onAction).not.toHaveBeenCalled();
      expect(body.getByRole("menu")).toBeVisible();
    });
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "More actions" });
    await waitFor(() => expect(trigger).toBeDisabled());
    await userEvent.click(trigger);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(trigger).not.toHaveFocus();
      expect(canvasElement.ownerDocument.querySelector("[data-slot=menu-popup]")).toBeNull();
      expect(args.onAction).not.toHaveBeenCalled();
      expect(args.onOpenChange).not.toHaveBeenCalled();
    });
  },
};

export const LongLabels: Story = {
  name: "Long labels",
  args: { open: true },
  parameters: { vrt: "page" },
  render: ({ onAction, ...args }) => (
    <Menu {...args}>
      <MenuTrigger>Translations</MenuTrigger>
      <MenuPopup className="w-56">
        <MenuItem onClick={onAction} icon={<Copy />} shortcut="Ctrl D">
          Duplicate this alert and include every saved salary and remote-work preference
        </MenuItem>
        <MenuItem onClick={onAction}>
          <span lang="ar">مشاركة هذا التنبيه مع جميع أعضاء الفريق والاحتفاظ بتفضيلات البحث</span>
        </MenuItem>
        <MenuItem onClick={onAction}>
          <span lang="ur">اس اطلاع کو ٹیم کے تمام ارکان کے ساتھ بانٹیں اور تلاش کی ترجیحات برقرار رکھیں</span>
        </MenuItem>
        <MenuItem tone="danger" onClick={onAction}>
          DeleteAlertAndAllSavedPreferencesWithoutAbbreviatingTheLabel
        </MenuItem>
      </MenuPopup>
    </Menu>
  ),
};

/** Applicable trigger and item states side by side, held open through the UX harness's focus reset. */
/** The open menu's action states, short enough to fit a phone screen; closed trigger states live in States. */
export const ItemStates: Story = {
  name: "Item states",
  parameters: { vrt: "page" },
  render: ({ onAction, ...args }) => (
    <Menu {...args} open modal={false}>
      <MenuTrigger>Item states</MenuTrigger>
      <MenuPopup>
        <MenuGroup>
          <MenuGroupLabel>Actions</MenuGroupLabel>
          <MenuItem onClick={onAction}>Rest</MenuItem>
          <MenuItem onClick={onAction} data-demo="hover">
            Hover
          </MenuItem>
          <MenuItem onClick={onAction} data-demo="active">
            Pressed
          </MenuItem>
          <MenuItem onClick={onAction} data-demo="focus">
            Keyboard focus
          </MenuItem>
          <MenuItem onClick={onAction} data-highlighted="">
            Highlighted
          </MenuItem>
          <MenuItem disabled onClick={onAction}>
            Disabled
          </MenuItem>
          <MenuItem tone="danger" icon={<Trash2 />} shortcut="Del" onClick={onAction}>
            Delete alert
          </MenuItem>
          <MenuItem tone="danger" data-highlighted="" onClick={onAction}>
            Highlighted danger
          </MenuItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
};

/** Checkable items and submenu triggers in an open menu. */
export const ChoiceStates: Story = {
  name: "Choice states",
  parameters: { vrt: "page" },
  render: ({ onAction, ...args }) => (
    <Menu {...args} open modal={false}>
      <MenuTrigger>Choice states</MenuTrigger>
      <MenuPopup>
        <MenuCheckboxItem checked>Checked</MenuCheckboxItem>
        <MenuCheckboxItem checked={false}>Unchecked</MenuCheckboxItem>
        <MenuCheckboxItem checked disabled>
          Disabled checked
        </MenuCheckboxItem>
        <MenuRadioGroup value="selected">
          <MenuGroupLabel>Choices</MenuGroupLabel>
          <MenuRadioItem value="selected">Selected</MenuRadioItem>
          <MenuRadioItem value="unselected">Unselected</MenuRadioItem>
          <MenuRadioItem value="disabled" disabled>
            Disabled choice
          </MenuRadioItem>
        </MenuRadioGroup>
        <MenuSubmenu>
          <MenuSubmenuTrigger>Share</MenuSubmenuTrigger>
          <MenuPopup>
            <MenuItem onClick={onAction}>Copy link</MenuItem>
          </MenuPopup>
        </MenuSubmenu>
        <MenuSubmenu disabled>
          <MenuSubmenuTrigger>Disabled submenu</MenuSubmenuTrigger>
          <MenuPopup>
            <MenuItem onClick={onAction}>Copy link</MenuItem>
          </MenuPopup>
        </MenuSubmenu>
      </MenuPopup>
    </Menu>
  ),
};

export const States: Story = {
  render: ({ onAction, ...args }) => (
    <div className="grid w-full max-w-4xl grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] items-start gap-8">
      {[
        { label: "Rest" },
        { label: "Hover", demo: "hover" },
        { label: "Pressed", demo: "active" },
        { label: "Keyboard focus", demo: "focus" },
        { label: "Disabled", disabled: true },
      ].map((state) => (
        <div key={state.label}>
          <p className="mb-3 text-label font-bold text-ink-muted">{state.label}</p>
          <ActionMenu {...args} onAction={onAction} {...state} />
        </div>
      ))}
    </div>
  ),
};
