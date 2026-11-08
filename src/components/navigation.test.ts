import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { labels } from "../labels.ts";
import { KumikoProvider } from "../provider.tsx";
import { BreadcrumbItem, Breadcrumbs } from "./breadcrumbs.tsx";
import { Pagination } from "./pagination.tsx";
import { Tab, Tabs, TabsList, TabsPanel } from "./tabs.tsx";

it("server-renders the indicator script with the provider nonce and a natively disabled tab", () => {
  const settings = {
    nonce: "test-nonce",
    children: createElement(
      Tabs,
      { defaultValue: "home" },
      createElement(
        TabsList,
        { "aria-label": "Views" },
        createElement(Tab, { value: "home" }, "Home"),
        createElement(Tab, { value: "disabled", disabled: true }, "Unavailable"),
      ),
      createElement(TabsPanel, { value: "home" }, "Home content"),
    ),
  };
  const markup = renderToStaticMarkup(createElement(KumikoProvider, settings));
  expect(markup.match(/<script\b[^>]*>/g)).toEqual(['<script nonce="test-nonce">']);
  expect(markup.match(/<button\b[^>]*aria-disabled="true"[^>]*>/)?.[0]).toContain('disabled=""');
});

it("server-renders localized page links with generated hrefs overriding a framework element's placeholder", () => {
  const markup = renderToStaticMarkup(
    createElement(Pagination, {
      page: 1,
      pageCount: 20,
      labels: labels.ar,
      locale: "ar-u-nu-arab",
      href: (page) => `/jobs?page=${page}`,
      render: createElement<Record<string, unknown>>("a", { href: "/placeholder", "data-router-link": "" }),
    }),
  );
  expect(markup).toContain('aria-label="ترقيم الصفحات"');
  expect(markup).toContain('aria-label="الصفحة ١" aria-current="page"');
  expect(markup).toContain('href="/jobs?page=1"');
  expect(markup).not.toContain("/placeholder");
  expect(markup.match(/<button\b[^>]*data-slot="pagination-previous"[^>]*>/)?.[0]).toContain('disabled=""');
});

it("server-renders a framework breadcrumb link and turns the final link into current-page text", () => {
  const markup = renderToStaticMarkup(
    createElement(
      Breadcrumbs,
      { labels: labels.ur },
      createElement(
        BreadcrumbItem,
        { render: createElement<Record<string, unknown>>("a", { href: "/jobs", "data-router-link": "" }) },
        "Jobs",
      ),
      createElement(BreadcrumbItem, { href: "/jobs/designer" }, "Product designer"),
    ),
  );
  expect(markup).toContain('aria-label="راستہ"');
  expect(markup).toContain('href="/jobs"');
  expect(markup).toContain('data-router-link=""');
  expect(markup).not.toContain("/jobs/designer");
  expect(markup).toContain('data-slot="breadcrumb-current" aria-current="page"');
});
