import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Renders an email element to static HTML with a doctype.
 * Use when: preparing an Email for a mail provider or srcDoc preview. Avoid when: hydrating an interactive page.
 */
export function renderEmail(element: ReactElement): string {
  return `<!doctype html>${renderToStaticMarkup(element)}`;
}
