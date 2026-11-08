import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Bookmark, Briefcase, Search, Settings } from "lucide-react";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { commands, page } from "vitest/browser";
import { labels } from "../labels.ts";
import { contrast, parseColor } from "../lib/color.ts";
import { useKumiko } from "../provider.tsx";
import { Badge } from "./badge.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarLayout,
  type SidebarLayoutProps,
  SidebarLink,
  SidebarTrigger,
} from "./sidebar.tsx";

function stayOnPage(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

function RouterLink(props: ComponentProps<"a">) {
  return <a {...props} data-router-link />;
}

function Navigation({ children }: { children: ReactNode }) {
  return (
    <Sidebar id="job-navigation">
      <SidebarHeader>
        <div id="job-logo" className="font-display text-title font-bold">
          First Jobby
        </div>
      </SidebarHeader>
      <SidebarContent>{children}</SidebarContent>
      <SidebarFooter>
        <p className="font-bold">Alex Morgan</p>
        <p className="text-body-sm text-ink-muted">Job seeker</p>
      </SidebarFooter>
    </Sidebar>
  );
}

function JobNavigation() {
  const { locale } = useKumiko();
  return (
    <Navigation>
      <SidebarGroup label="Jobs">
        <SidebarLink href="#jobs" onClick={stayOnPage} icon={<Briefcase aria-hidden />} current>
          Browse jobs
        </SidebarLink>
        <SidebarLink
          href="#alerts"
          onClick={stayOnPage}
          icon={<Bell aria-hidden />}
          badge={<Badge>{new Intl.NumberFormat(locale).format(3)}</Badge>}
        >
          Alerts
        </SidebarLink>
      </SidebarGroup>
      <SidebarGroup label="Your account">
        <SidebarLink href="#saved" onClick={stayOnPage} icon={<Bookmark aria-hidden />}>
          Saved jobs
        </SidebarLink>
        <SidebarLink render={<RouterLink href="#settings" onClick={stayOnPage} />} icon={<Settings aria-hidden />}>
          Settings
        </SidebarLink>
      </SidebarGroup>
    </Navigation>
  );
}

const searches = Array.from({ length: 30 }, (_, index) => index + 1);

function LongNavigation() {
  const { locale } = useKumiko();
  const numbers = new Intl.NumberFormat(locale);
  return (
    <Navigation>
      <SidebarGroup label="Saved searches">
        {searches.map((search) => (
          <SidebarLink
            key={search}
            href={`#search-${search}`}
            onClick={stayOnPage}
            icon={<Search aria-hidden />}
            current={search === 1}
          >
            Saved search {numbers.format(search)}
            {search === 30 && ": Remote roles with salary and flexible working hours"}
          </SidebarLink>
        ))}
      </SidebarGroup>
    </Navigation>
  );
}

function StateNavigation() {
  return (
    <Navigation>
      <SidebarGroup label="Link states">
        <SidebarLink href="#rest" onClick={stayOnPage}>
          Rest
        </SidebarLink>
        <SidebarLink href="#hover" onClick={stayOnPage} data-demo="hover">
          Hover
        </SidebarLink>
        <SidebarLink href="#pressed" onClick={stayOnPage} data-demo="active">
          Pressed
        </SidebarLink>
        <SidebarLink href="#focus" onClick={stayOnPage} data-demo="focus">
          Keyboard focus
        </SidebarLink>
        <SidebarLink href="#current" onClick={stayOnPage} current>
          Current
        </SidebarLink>
      </SidebarGroup>
    </Navigation>
  );
}

function JobBoard(props: SidebarLayoutProps) {
  return (
    <SidebarLayout {...props} className="-m-3">
      <header className="flex min-w-0 items-center gap-3 border-b-2 border-line bg-surface p-4">
        <SidebarTrigger />
        <span className="min-w-0 font-bold wrap-anywhere">Job board</span>
      </header>
      <main className="space-y-3 p-6 wrap-anywhere">
        <h1 className="font-display text-headline font-bold">Find your next role</h1>
        <p className="max-w-prose text-body text-ink-muted">
          Explore jobs that match your skills, save your favourites, and get alerts when the right opportunity appears.
        </p>
      </main>
    </SidebarLayout>
  );
}

const meta = {
  title: "Navigation/Sidebar",
  component: SidebarLayout,
  subcomponents: { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarLink, SidebarTrigger },
  parameters: { layout: "fullscreen", vrt: "page" },
  args: { sidebar: <JobNavigation />, onOpenChange: fn() },
  render: (args) => <JobBoard {...args} />,
} satisfies Meta<typeof SidebarLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    if (canvasElement.ownerDocument.defaultView!.innerWidth < 1024) return;
    const current = canvas.getByRole("link", { name: "Browse jobs" });
    await userEvent.tab();
    await waitFor(() => {
      expect(current).toHaveFocus();
      expect(current.matches(":focus-visible")).toBe(true);
      expect(current).toHaveAttribute("aria-current", "page");
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(current).toHaveFocus();
      expect(args.onOpenChange).not.toHaveBeenCalled();
    });
  },
};

export const Phone: Story = {
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const names = globals.dir === "rtl" ? labels.ar : labels.en;
    const trigger = canvasElement.querySelector<HTMLButtonElement>("[data-slot=sidebar-trigger]")!;
    if (document.defaultView!.innerWidth >= 1024) {
      await waitFor(() => expect(trigger).not.toBeVisible());
      return;
    }
    await waitFor(() => {
      expect(trigger).toBeVisible();
      expect(canvas.queryByRole("navigation")).toBeNull();
      expect(document.querySelector("[data-slot=sidebar-column]")).not.toBeVisible();
    });
    await userEvent.click(trigger);
    await waitFor(() => {
      const popup = body.getByRole("dialog", { name: names.navigation });
      expect(popup).toBeVisible();
      expect(popup.getAnimations().filter((animation) => animation.playState === "running")).toHaveLength(0);
      expect(body.getAllByRole("navigation")).toHaveLength(1);
      expect(document.querySelectorAll("#job-navigation")).toHaveLength(1);
      expect(document.querySelectorAll("#job-logo")).toHaveLength(1);
      expect(within(popup).getAllByRole("link")).toHaveLength(4);
    });
    await userEvent.click(body.getByRole("link", { name: "Settings" }));
    await waitFor(() => {
      expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      const popup = body.getByRole("dialog", { name: names.navigation });
      expect(popup).toBeVisible();
      expect(popup.contains(document.activeElement)).toBe(true);
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull();
      expect(trigger).toHaveFocus();
    });
    const { innerWidth, innerHeight } = document.defaultView!;
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
    try {
      await page.viewport(1024, innerHeight);
      await waitFor(() => {
        expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull();
        expect(trigger).not.toBeVisible();
        expect(body.getByRole("navigation", { name: names.navigation })).toBeVisible();
        expect(document.querySelectorAll("#job-navigation")).toHaveLength(1);
      });
    } finally {
      await page.viewport(innerWidth, innerHeight);
    }
    await waitFor(() => {
      expect(trigger).toBeVisible();
      expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull();
      expect(body.queryByRole("navigation")).toBeNull();
    });
  },
};

export const LongList: Story = {
  name: "Long list",
  args: { sidebar: <LongNavigation /> },
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const window = document.defaultView!;
    const names = globals.dir === "rtl" ? labels.ar : labels.en;
    const phone = window.innerWidth < 1024;
    if (phone) {
      await userEvent.click(canvas.getByRole("button", { name: names.openNavigation }));
      await waitFor(() => {
        const popup = within(document.body).getByRole("dialog", { name: names.navigation });
        expect(popup).toBeVisible();
        expect(popup.getAnimations().filter((animation) => animation.playState === "running")).toHaveLength(0);
      });
    }
    const nav = within(document.body).getByRole("navigation", { name: names.navigation });
    const content = nav.querySelector<HTMLElement>("[data-slot=sidebar-content]")!;
    const header = nav.querySelector<HTMLElement>("[data-slot=sidebar-header]")!;
    const footer = nav.querySelector<HTMLElement>("[data-slot=sidebar-footer]")!;
    await waitFor(() => {
      expect(within(nav).getAllByRole("link")).toHaveLength(30);
      expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
      expect(
        nav.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running"),
      ).toHaveLength(0);
      expect(document.documentElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight + 1);
    });
    const headerTop = header.getBoundingClientRect().top;
    const footerTop = footer.getBoundingClientRect().top;
    const pageTop = window.scrollY;
    await commands.uxWheel("[data-slot=sidebar-content]", 5000);
    await waitFor(() => expect(content.scrollTop).toBeGreaterThan(0));
    await commands.uxWheel("[data-slot=sidebar-content]", 700);
    await waitFor(() => {
      expect(window.scrollY).toBe(pageTop);
      expect(header.getBoundingClientRect().top).toBeCloseTo(headerTop);
      expect(footer.getBoundingClientRect().top).toBeCloseTo(footerTop);
    });
    content.scrollTop = 0;
    if (phone) {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(document.querySelector("[data-slot=drawer-popup]")).toBeNull());
    }
  },
};

export const States: Story = {
  args: { sidebar: <StateNavigation />, defaultOpen: true },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const pressed = within(canvasElement.ownerDocument.body).getByRole("link", { name: "Pressed" });
      const style = getComputedStyle(pressed);
      const ink = parseColor(style.color);
      const fill = parseColor(style.backgroundColor);
      expect(ink).not.toBeNull();
      expect(fill).not.toBeNull();
      expect(contrast(ink!, fill!)).toBeGreaterThanOrEqual(4.5);
    });
  },
};
