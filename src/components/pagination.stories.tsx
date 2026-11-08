import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ComponentProps, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { formatLabel, labels } from "../labels.ts";
import { useKumiko } from "../provider.tsx";
import { Pagination, type PaginationProps } from "./pagination.tsx";

const href = (page: number) => `/jobs?page=${page}`;
const edgeChange = fn();
function DemoLink(props: ComponentProps<"a">) {
  return <a {...props} data-router-link />;
}
function LocalizedPagination(props: PaginationProps) {
  const settings = useKumiko();
  return <Pagination {...props} labels={props.labels ?? settings.labels} locale={props.locale ?? settings.locale} />;
}
function ButtonsExample({ page: initialPage, ...props }: PaginationProps) {
  const [page, setPage] = useState(initialPage);
  return (
    <LocalizedPagination
      {...props}
      page={page}
      href={undefined}
      render={undefined}
      onPageChange={(value) => {
        setPage(value);
        props.onPageChange?.(value);
      }}
    />
  );
}

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  args: {
    page: 5,
    pageCount: 20,
    href,
    render: <DemoLink href="/placeholder" onClick={(event) => event.preventDefault()} />,
  },
  render: (args) => <LocalizedPagination {...args} />,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Links: Story = {
  play: async ({ canvas, globals }) => {
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const current = canvas.getByRole("link", { name: formatLabel(catalog.page, locale, 5) });
    await waitFor(() => {
      expect(current).toHaveAttribute("aria-current", "page");
      expect(current).toHaveAttribute("href", "/jobs?page=5");
      expect(current).toHaveAttribute("data-router-link");
      expect(canvas.getByRole("link", { name: catalog.previousPage })).toHaveAttribute("href", "/jobs?page=4");
      expect(canvas.getByRole("link", { name: catalog.nextPage })).toHaveAttribute("href", "/jobs?page=6");
    });
  },
};

export const Buttons: Story = {
  args: { href: undefined, render: undefined, onPageChange: fn() },
  render: (args) => <ButtonsExample {...args} href={undefined} render={undefined} onPageChange={args.onPageChange!} />,
  play: async ({ args, canvas, globals, userEvent }) => {
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    await userEvent.click(canvas.getByRole("button", { name: catalog.nextPage }));
    await waitFor(() => {
      expect(args.onPageChange).toHaveBeenCalledWith(6);
      expect(canvas.getByRole("button", { name: formatLabel(catalog.page, locale, 6) })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(args.onPageChange).toHaveBeenCalledWith(7);
      expect(canvas.getByRole("button", { name: formatLabel(catalog.page, locale, 7) })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  },
};

export const Edges: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <LocalizedPagination {...args} href={href} onPageChange={undefined} page={1} aria-label="First page" />
      <LocalizedPagination
        {...args}
        page={20}
        href={undefined}
        render={undefined}
        onPageChange={edgeChange}
        aria-label="Last page"
      />
    </div>
  ),
  play: async ({ canvas, globals, userEvent }) => {
    edgeChange.mockClear();
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const previous = within(canvas.getByRole("navigation", { name: "First page" })).getByRole("button", {
      name: catalog.previousPage,
    });
    const next = within(canvas.getByRole("navigation", { name: "Last page" })).getByRole("button", {
      name: catalog.nextPage,
    });
    await userEvent.click(previous);
    await userEvent.click(next);
    await userEvent.tab();
    await waitFor(() => {
      expect(previous).toBeDisabled();
      expect(previous).not.toHaveAttribute("href");
      expect(next).toBeDisabled();
      expect(next).not.toHaveFocus();
      expect(edgeChange).not.toHaveBeenCalled();
    });
  },
};

export const ArabicDigits: Story = {
  name: "Arabic digits",
  args: { labels: labels.ar, locale: "ar-u-nu-arab" },
  render: (args) => (
    <div lang="ar" dir="rtl">
      <LocalizedPagination {...args} href={href} onPageChange={undefined} />
    </div>
  ),
  play: async ({ canvas }) => {
    await waitFor(() => {
      expect(canvas.getByRole("navigation")).toHaveAccessibleName("ترقيم الصفحات");
      expect(canvas.getByRole("link", { name: "الصفحة ٥" })).toHaveTextContent("٥");
      expect(canvas.getByRole("link", { name: "الصفحة ٥" })).toHaveAttribute("href", "/jobs?page=5");
    });
  },
};

export const Narrow: Story = {
  render: (args) => (
    <div className="w-80 max-w-full">
      <LocalizedPagination {...args} href={href} onPageChange={undefined} />
    </div>
  ),
  play: async ({ canvas, globals }) => {
    const catalog = globals.dir === "rtl" ? labels.ar : labels.en;
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const nav = canvas.getByRole("navigation");
    await waitFor(() => {
      expect(nav.scrollWidth - nav.clientWidth).toBeLessThanOrEqual(1);
      expect(canvas.queryByRole("link", { name: formatLabel(catalog.page, locale, 1) })).toBeNull();
      expect(canvas.queryByRole("link", { name: formatLabel(catalog.page, locale, 20) })).toBeNull();
    });
  },
};

export const States: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {["Rest", "Hover", "Press", "Focus", "Disabled"].map((state) => (
        <LocalizedPagination
          key={state}
          {...args}
          href={href}
          onPageChange={undefined}
          page={state === "Disabled" ? 1 : 5}
          pageCount={state === "Disabled" ? 1 : 20}
          aria-label={`${state} pagination`}
          render={
            <DemoLink
              href="/placeholder"
              data-demo={state === "Press" ? "active" : state.toLowerCase()}
              onClick={(event) => event.preventDefault()}
            />
          }
        />
      ))}
    </div>
  ),
};
