import { type ComponentProps, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Link } from "./link.tsx";
import { LinkButton } from "./link-button.tsx";

function FakeRouterLink(props: Record<string, unknown>) {
  return createElement("a", { "data-router": "", ...props });
}

describe.each([
  { name: "LinkButton", component: LinkButton, slot: "link-button" },
  { name: "Link", component: Link, slot: "link" },
])("$name", ({ component, slot }) => {
  it("server-renders a native navigation anchor", () => {
    const html = renderToStaticMarkup(createElement(component, { href: "/jobs" }, "Browse jobs"));
    expect(html).toMatch(/^<a\b/);
    expect(html).toContain('href="/jobs"');
    expect(html).toContain(`data-slot="${slot}"`);
    expect(html).toContain("Browse jobs");
    expect(html).not.toContain('role="button"');
  });

  it("keeps framework props while merging classes and guaranteeing its slot and content", () => {
    const props = {
      href: "/consumer",
      title: "Consumer title",
      className: "m-1",
      "data-slot": "consumer-slot",
      render: createElement(
        FakeRouterLink,
        {
          href: "/router",
          title: "Router title",
          className: "p-3",
          "data-slot": "router-slot",
        },
        "Router content",
      ),
    };
    const html = renderToStaticMarkup(createElement(component, props, "Browse jobs"));
    expect(html).toContain('data-router=""');
    expect(html).toContain('href="/router"');
    expect(html).toContain('title="Router title"');
    expect(html).toContain(`data-slot="${slot}"`);
    const classes = /class="([^"]+)"/.exec(html)?.[1]?.split(" ");
    expect(classes).toContain("m-1");
    expect(classes).toContain("p-3");
    expect(html).toContain("Browse jobs");
    expect(html).not.toContain("Router content");
  });
});

it("adds new-tab protection using the framework link's effective target", () => {
  const html = renderToStaticMarkup(
    createElement(Link, {
      href: "/jobs",
      target: "_self",
      render: createElement(FakeRouterLink, { target: "_blank" }),
    }),
  );
  expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noopener noreferrer"');
});

it("preserves an explicitly supplied rel on new-tab links", () => {
  const props: ComponentProps<"a"> = { href: "/jobs", target: "_blank", rel: "author" };
  expect(renderToStaticMarkup(createElement(Link, props))).toContain('rel="author"');
});

it("leaves same-tab links without an added rel", () => {
  expect(renderToStaticMarkup(createElement(Link, { href: "/jobs" }))).not.toContain("rel=");
});
