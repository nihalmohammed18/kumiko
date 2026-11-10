import type { ComponentProps } from "react";
import { cn } from "../lib/tv.ts";

/** Native div props for an article's container.
 * Use when: typing Prose. Avoid when: typing a single paragraph or heading; style those directly.
 */
export type ProseProps = ComponentProps<"div">;

/** Server-safe article typography for rendered Markdown or MDX: headings, paragraphs, links, lists, quotes, code,
 * images and small tables, with a readable line length. Elements with a `data-slot`, and everything inside them, keep
 * their own styling, so Kumiko components can sit in the flow.
 * Use when: showing long-form content you don't write element by element, like a blog post or a guide.
 * Avoid when: laying out an interface, or showing a wide comparison table; use Table or DataTable for that.
 *
 * @example
 * <Prose><h2>Where to start</h2><p>Pick one course and finish it.</p></Prose>
 */
export function Prose({ className, ...props }: ProseProps) {
  return <div {...props} data-slot="prose" className={cn("kumiko-prose", className)} />;
}
