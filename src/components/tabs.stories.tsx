import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { Tab, Tabs, TabsList, TabsPanel } from "./tabs.tsx";

const views = ["Overview", "Projects", "Account"];
const sections = Array.from({ length: 12 }, (_, i) => `Section ${i + 1}`);
function DemoLink(props: ComponentProps<"a">) {
  return <a {...props} data-router-link />;
}

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  subcomponents: { TabsList, Tab, TabsPanel },
  args: { defaultValue: "Overview", onValueChange: fn() },
  render: (args) => (
    <Tabs {...args} className="w-full max-w-lg">
      <TabsList aria-label="Workspace views">
        {views.map((view) => (
          <Tab key={view} value={view}>
            {view}
          </Tab>
        ))}
      </TabsList>
      {views.map((view) => (
        <TabsPanel key={view} value={view}>
          {view} content
        </TabsPanel>
      ))}
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, globals, userEvent }) => {
    const [overview, projects, account] = views.map((name) => canvas.getByRole("tab", { name }));
    await userEvent.click(projects!);
    await waitFor(() => expect(canvas.getByRole("tabpanel", { name: "Projects" })).toBeVisible());
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() => {
      expect(account).toHaveFocus();
      expect(account).toHaveAttribute("aria-selected", "false");
      expect(projects).toHaveAttribute("aria-selected", "true");
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("tabpanel", { name: "Account" })).toBeVisible());
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(overview).toHaveFocus());
    await userEvent.keyboard(" ");
    await waitFor(() => expect(canvas.getByRole("tabpanel", { name: "Overview" })).toBeVisible());
    await userEvent.keyboard("{End}");
    await waitFor(() => {
      expect(account).toHaveFocus();
      expect(overview).toHaveAttribute("aria-selected", "true");
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(account).toHaveAttribute("aria-selected", "true"));
    await userEvent.tab();
    const panel = canvas.getByRole("tabpanel", { name: "Account" });
    await waitFor(() => {
      expect(panel).toHaveFocus();
      expect(getComputedStyle(panel).outlineStyle).toBe("solid");
    });
    panel.blur();
  },
};

export const ManyTabs: Story = {
  name: "Many tabs",
  render: (args) => (
    <Tabs {...args} defaultValue={sections[0]} className="w-80 max-w-full">
      <TabsList aria-label="Sections">
        {sections.map((section) => (
          <Tab key={section} value={section}>
            {section}
          </Tab>
        ))}
      </TabsList>
      {sections.map((section) => (
        <TabsPanel key={section} value={section}>
          {section} content
        </TabsPanel>
      ))}
    </Tabs>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const scroll = canvasElement.querySelector<HTMLElement>("[data-slot=tabs-scroll]")!;
    await waitFor(() => {
      expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    });
    await userEvent.tab();
    await userEvent.keyboard("{End}{Enter}");
    const last = canvas.getByRole("tab", { name: "Section 12" });
    await waitFor(() => {
      expect(last).toHaveFocus();
      expect(last).toHaveAttribute("aria-selected", "true");
      const bar = last.querySelector<HTMLElement>("[data-slot=tabs-indicator]")!;
      expect(bar).toBeVisible();
      expect(bar.getBoundingClientRect().left).toBeCloseTo(last.getBoundingClientRect().left, 0);
      expect(bar.getBoundingClientRect().width).toBeCloseTo(last.getBoundingClientRect().width, 0);
      expect(last.getBoundingClientRect().left).toBeGreaterThanOrEqual(scroll.getBoundingClientRect().left - 1);
      expect(last.getBoundingClientRect().right).toBeLessThanOrEqual(scroll.getBoundingClientRect().right + 1);
    });
  },
};

export const Links: Story = {
  render: (args) => (
    <Tabs {...args} className="w-full max-w-lg">
      <TabsList aria-label="Workspace pages">
        {views.map((view) => (
          <Tab
            key={view}
            value={view}
            nativeButton={false}
            render={<DemoLink href={`/${view.toLowerCase()}`} onClick={(event) => event.preventDefault()} />}
          >
            {view}
          </Tab>
        ))}
      </TabsList>
      {views.map((view) => (
        <TabsPanel key={view} value={view}>
          {view} content
        </TabsPanel>
      ))}
    </Tabs>
  ),
  play: async ({ canvas, userEvent }) => {
    const projects = canvas.getByRole("tab", { name: "Projects" });
    await waitFor(() => {
      expect(projects.tagName).toBe("A");
      expect(projects).toHaveAttribute("href", "/projects");
      expect(projects).toHaveAttribute("data-router-link");
    });
    await userEvent.click(projects);
    await waitFor(() => expect(canvas.getByRole("tabpanel", { name: "Projects" })).toBeVisible());
  },
};

export const States: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="Selected">
      <TabsList aria-label="Tab states">
        <Tab value="Rest">Rest</Tab>
        <Tab value="Hover" data-demo="hover">
          Hover
        </Tab>
        <Tab value="Active" data-demo="active">
          Press
        </Tab>
        <Tab value="Focus" data-demo="focus">
          Focus
        </Tab>
        <Tab value="Selected">Selected</Tab>
        <Tab value="Disabled" disabled>
          Disabled
        </Tab>
      </TabsList>
      {["Rest", "Hover", "Active", "Focus", "Selected"].map((value) => (
        <TabsPanel key={value} value={value}>
          {value} content
        </TabsPanel>
      ))}
    </Tabs>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const disabled = canvas.getByRole("tab", { name: "Disabled" });
    await userEvent.click(disabled);
    await waitFor(() => {
      expect(disabled).toHaveAttribute("aria-disabled", "true");
      expect(canvas.getByRole("tab", { name: "Selected" })).toHaveAttribute("aria-selected", "true");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  },
};
