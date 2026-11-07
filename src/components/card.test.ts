import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Card, CardDescription, CardLink, CardTitle } from "./card.tsx";

it("server-renders a linked card with the heading text as its link content", () => {
  const html = renderToStaticMarkup(
    createElement(
      Card,
      null,
      createElement(CardTitle, { level: 2 }, createElement(CardLink, { href: "/jobs/42" }, "Product designer")),
      createElement(CardDescription, null, "Remote role at Kumiko"),
    ),
  );
  expect(html).toContain('data-slot="card"');
  expect(html).toMatch(/<h2\b/);
  expect(html).toMatch(/<a[^>]*href="\/jobs\/42"[^>]*data-slot="card-link"[^>]*>Product designer<\/a>/);
  expect(html).toContain("Remote role at Kumiko");
  expect(html).not.toContain('role="button"');
});

it("server-renders a framework card link while preserving its props and Kumiko's slot and content", () => {
  function RouterLink(props: Record<string, unknown>) {
    return createElement("a", { "data-router": "", ...props });
  }
  const html = renderToStaticMarkup(
    createElement(
      Card,
      null,
      createElement(
        CardTitle,
        null,
        createElement(
          CardLink,
          {
            href: "/consumer",
            className: "font-bold",
            render: createElement(RouterLink, { href: "/jobs/42", className: "text-ink", target: "_blank" }),
          },
          "Product designer",
        ),
      ),
    ),
  );
  expect(html).toContain('data-router=""');
  expect(html).toContain('href="/jobs/42"');
  expect(html).toContain('data-slot="card-link"');
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain("font-bold");
  expect(html).toContain("text-ink");
  expect(html).toContain(">Product designer</a>");
});
