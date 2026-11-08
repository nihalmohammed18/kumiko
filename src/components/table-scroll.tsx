"use client";

import type { ReactNode } from "react";
import { useScrollFocus } from "../lib/use-scroll-focus.ts";

/** Table's sideways scroll area: a Tab stop only while the table overflows, so keyboard users can scroll it.
 * Use when: Table renders it. Avoid when: building another scroll area; use useScrollFocus.
 */
export function TableScroll({ children }: { children: ReactNode }) {
  const [ref, tabIndex] = useScrollFocus<HTMLDivElement>();
  return (
    <div ref={ref} tabIndex={tabIndex} data-slot="table-scroll" className="min-w-0 max-w-full overflow-x-auto pb-2">
      {children}
    </div>
  );
}
