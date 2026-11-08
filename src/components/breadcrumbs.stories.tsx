import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, MouseEvent } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { useKumiko } from "../provider.tsx";
import { BreadcrumbItem, Breadcrumbs, type BreadcrumbsProps } from "./breadcrumbs.tsx";

function DemoLink(props: ComponentProps<"a">) {
  return <a {...props} data-router-link />;
}
function LocalizedBreadcrumbs(props: BreadcrumbsProps) {
  const settings = useKumiko();
  return <Breadcrumbs {...props} labels={props.labels ?? settings.labels} locale={props.locale ?? settings.locale} />;
}

const meta = {
  title: "Navigation/Breadcrumbs",
  component: Breadcrumbs,
  subcomponents: { BreadcrumbItem },
  args: {
    onClick: fn((event: MouseEvent<HTMLElement>) => event.preventDefault()),
    children: [
      <BreadcrumbItem key="home" href="/">
        Home
      </BreadcrumbItem>,
      <BreadcrumbItem key="jobs" render={<DemoLink href="/jobs" />}>
        Jobs
      </BreadcrumbItem>,
      <BreadcrumbItem key="current" href="/jobs/designer">
        Product designer
      </BreadcrumbItem>,
    ],
  },
  render: (args) => <LocalizedBreadcrumbs {...args} />,
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const home = canvas.getByRole("link", { name: "Home" });
    const jobs = canvas.getByRole("link", { name: "Jobs" });
    await waitFor(() => {
      expect(home).toHaveAttribute("href", "/");
      expect(jobs).toHaveAttribute("href", "/jobs");
      expect(jobs).toHaveAttribute("data-router-link");
      expect(canvas.getByText("Product designer")).toHaveAttribute("aria-current", "page");
      expect(canvas.getAllByRole("link")).toHaveLength(2);
    });
    await userEvent.tab();
    await waitFor(() => expect(home).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await userEvent.click(jobs);
    await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(2));
  },
};

export const Long: Story = {
  render: (args) => (
    <div className="w-80 max-w-full">
      <LocalizedBreadcrumbs {...args}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/jobs">Jobs</BreadcrumbItem>
        <BreadcrumbItem href="/jobs/design">Design and creative opportunities</BreadcrumbItem>
        <BreadcrumbItem href="/jobs/design/product">
          Product-design-abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789
        </BreadcrumbItem>
        <BreadcrumbItem>Senior product designer for international accessibility and localization</BreadcrumbItem>
      </LocalizedBreadcrumbs>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const nav = canvas.getByRole("navigation");
    await waitFor(() => {
      expect(nav.getBoundingClientRect().height).toBeGreaterThan(40);
      expect(nav.scrollWidth - nav.clientWidth).toBeLessThanOrEqual(1);
      for (const item of canvasElement.querySelectorAll<HTMLElement>("[data-slot=breadcrumb-item]")) {
        expect(item.scrollWidth - item.clientWidth).toBeLessThanOrEqual(1);
      }
    });
  },
};

export const States: Story = {
  render: (args) => (
    <LocalizedBreadcrumbs {...args}>
      <BreadcrumbItem href="/">Rest</BreadcrumbItem>
      <BreadcrumbItem render={<DemoLink href="/hover" data-demo="hover" />}>Hover</BreadcrumbItem>
      <BreadcrumbItem render={<DemoLink href="/press" data-demo="active" />}>Press</BreadcrumbItem>
      <BreadcrumbItem render={<DemoLink href="/focus" data-demo="focus" />}>Focus</BreadcrumbItem>
      <BreadcrumbItem>Current</BreadcrumbItem>
    </LocalizedBreadcrumbs>
  ),
};
