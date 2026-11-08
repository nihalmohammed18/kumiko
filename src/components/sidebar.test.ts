import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Sidebar, SidebarContent, SidebarGroup, SidebarLayout, SidebarLink, SidebarTrigger } from "./sidebar.tsx";

it("renders a current page as a native navigation link", () => {
  const html = renderToStaticMarkup(createElement(SidebarLink, { href: "/jobs", current: true }, "Browse jobs"));
  expect(html).toMatch(/^<a\b/);
  expect(html).toContain('href="/jobs"');
  expect(html).toContain('aria-current="page"');
  expect(html).not.toContain('role="button"');
});

it("preserves framework link props while guaranteeing the current page, slot and content", () => {
  const html = renderToStaticMarkup(
    createElement(
      SidebarLink,
      {
        href: "/consumer",
        current: true,
        className: "m-1",
        render: createElement(
          "a",
          {
            href: "/router",
            target: "_blank",
            className: "p-3",
            "aria-current": "false",
            "data-slot": "consumer-slot",
          },
          "Router content",
        ),
      },
      "Browse jobs",
    ),
  );
  expect(html).toContain('href="/router"');
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain('aria-current="page"');
  expect(html).toContain('data-slot="sidebar-link"');
  expect(html).toContain("m-1");
  expect(html).toContain("p-3");
  expect(html).toContain("Browse jobs");
  expect(html).not.toContain("Router content");
});

it("server-renders one sidebar copy with a named navigation landmark and labelled link list", () => {
  const html = renderToStaticMarkup(
    createElement(
      SidebarLayout,
      {
        sidebar: createElement(
          Sidebar,
          { id: "consumer-navigation" },
          createElement(
            SidebarContent,
            null,
            createElement(
              SidebarGroup,
              { label: "Jobs" },
              createElement(SidebarLink, { href: "/jobs" }, "Browse jobs"),
            ),
          ),
        ),
      },
      createElement("main", null, "Find your next role"),
    ),
  );
  expect(html.match(/id="consumer-navigation"/g)).toHaveLength(1);
  expect(html).toContain('aria-label="Navigation"');
  const labelId = /<fieldset[^>]+aria-labelledby="([^"]+)"/.exec(html)?.[1];
  expect(labelId).toBeTruthy();
  expect(html).toContain(`id="${labelId}"`);
  expect(html).toContain("Jobs</div><ul");
});

it("composes the menu IconButton and drawer trigger as one named native button", () => {
  const html = renderToStaticMarkup(createElement(SidebarLayout, { sidebar: null }, createElement(SidebarTrigger)));
  expect(html.match(/<button\b/g)).toHaveLength(1);
  expect(html).toContain('aria-label="Open navigation"');
  expect(html).toContain('aria-haspopup="dialog"');
  expect(html).toContain('data-slot="sidebar-trigger"');
});
