import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table.tsx";

it("server-renders a named table while preserving native header scopes and spanning cells", () => {
  const html = renderToStaticMarkup(
    createElement(
      Table,
      { id: "applications", "aria-labelledby": "applications-caption" },
      createElement(TableCaption, { id: "applications-caption" }, "Job applications"),
      createElement(
        TableHeader,
        null,
        createElement(TableRow, null, createElement(TableHead, null, "Role"), createElement(TableHead, null, "Salary")),
      ),
      createElement(
        TableBody,
        null,
        createElement(
          TableRow,
          null,
          createElement(TableHead, { scope: "row" }, "Product designer"),
          createElement(TableCell, { align: "end" }, "$90,000"),
        ),
      ),
      createElement(
        TableFooter,
        null,
        createElement(TableRow, null, createElement(TableCell, { colSpan: 2 }, "1 application")),
      ),
    ),
  );
  // Server markup can't measure overflow, so the scroll area isn't a Tab stop until the client finds it scrolls.
  expect(html.match(/<div[^>]*data-slot="table-scroll"[^>]*>/)?.[0]).not.toContain("tabindex");
  expect(html).toMatch(/<table[^>]*id="applications"[^>]*aria-labelledby="applications-caption"/);
  expect(html).toMatch(/<caption[^>]*id="applications-caption"[^>]*>Job applications<\/caption>/);
  expect(html).toMatch(/<th[^>]*scope="col"/);
  expect(html).toMatch(/<th[^>]*scope="row"/);
  expect(html).toMatch(/<td[^>]*colSpan="2"[^>]*>1 application<\/td>/);
  expect(html).not.toMatch(/\salign=/);
});
