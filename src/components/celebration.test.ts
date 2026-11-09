import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { formatLabel, labels } from "../labels.ts";
import { KumikoProvider, type KumikoProviderProps } from "../provider.tsx";
import { Celebration } from "./celebration.tsx";

it("server-renders a named section in its final frame, with localized values and no announcement", () => {
  const settings: KumikoProviderProps = {
    locale: "ar-u-nu-arab",
    children: createElement(Celebration, {
      title: "Application sent!",
      character: "pip",
      stats: [{ label: "Applications", value: 12, from: 11 }],
      progress: { label: "Weekly goal", value: 60, from: 40 },
      streak: { count: 5, today: "2026-11-08", done: ["2026-11-08"], gained: true },
      onContinue: vi.fn(),
    }),
  };
  const html = renderToStaticMarkup(createElement(KumikoProvider, settings));
  const headingId = html.match(/<h2[^>]*id="([^"]+)"/)?.[1];
  expect(headingId).toBeTruthy();
  expect(html).toContain(`aria-labelledby="${headingId}"`);
  expect(html).toMatch(/<section[^>]*data-slot="celebration"[^>]*data-finished=""/);
  expect(html).toContain('data-pose="cheering"');
  expect(html).toMatch(/data-slot="celebration-number-final"[^>]*>١٢<\/span>/);
  expect(html).toContain('aria-valuenow="60"');
  expect(html).toContain(formatLabel(labels.ar.streak, "ar-u-nu-arab", 5));
  expect(html).toContain('data-slot="streak-increment"');
  expect(html).toContain("متابعة");
  expect(html).toMatch(/role="status" aria-live="polite" aria-atomic="true"><\/div>/);
});

it("shows the final zero streak without claiming a gain by default", () => {
  const html = renderToStaticMarkup(
    createElement(Celebration, {
      title: "Profile complete!",
      streak: { count: 0, today: "2026-11-08", done: [] },
    }),
  );
  expect(html).toMatch(/data-slot="count-up-value"[^>]*>0<\/span>/);
  expect(html).not.toContain('data-slot="streak-increment"');
  expect(html).not.toMatch(/<span[^>]*data-popping=/);
});
