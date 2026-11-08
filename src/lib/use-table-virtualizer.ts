"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import type { TableProps } from "../components/table.tsx";
import { controls } from "../tokens.ts";

/** Measures DataTable's scroll area and wrapping rows without replacing its native table layout.
 * Use when: virtualizing DataTable's final row model. Avoid when: virtualizing a non-table list.
 */
export function useTableVirtualizer({
  enabled,
  size = "md",
  count,
  getItemKey,
}: {
  enabled: boolean;
  size?: TableProps["size"];
  count: number;
  getItemKey: (index: number) => string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const [layout, setLayout] = useState({ rem: 16, margin: 0, header: 0 });
  const estimate = Number.parseFloat(controls[size]) * layout.rem;
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    enabled,
    count,
    getScrollElement: () => rootRef.current?.querySelector<HTMLDivElement>("[data-slot=table-scroll]") ?? null,
    estimateSize: () => estimate,
    getItemKey,
    overscan: 5,
    // A bounded initial page also renders during SSR, before the CSS length can be measured.
    initialRect: { width: 0, height: estimate * 10 },
    scrollMargin: layout.margin,
    scrollPaddingStart: layout.header,
    // Cards include their inter-row margin; table rows and wrapped translations are measured too.
    measureElement: (row) =>
      row.getBoundingClientRect().height + (Number.parseFloat(getComputedStyle(row).marginBlockEnd) || 0),
  });
  useEffect(() => {
    if (!enabled) return;
    const scroller = rootRef.current?.querySelector<HTMLDivElement>("[data-slot=table-scroll]");
    const body = bodyRef.current;
    const table = body?.closest("table");
    if (!scroller || !body || !table) return;
    const update = () => {
      const rem = Number.parseFloat(getComputedStyle(scroller.ownerDocument.documentElement).fontSize);
      const margin =
        body.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop +
        (Number.parseFloat(getComputedStyle(body).paddingBlockStart) || 0);
      const style = getComputedStyle(scroller);
      const focusSpace =
        Number.parseFloat(style.getPropertyValue("--kumiko-ring-width")) +
        Number.parseFloat(style.getPropertyValue("--kumiko-ring-gap"));
      const header = (table.tHead?.getBoundingClientRect().height ?? 0) + focusSpace;
      scroller.style.scrollPaddingBlockStart = `${header}px`;
      setLayout((old) =>
        old.rem === rem && old.margin === margin && old.header === header ? old : { rem, margin, header },
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    observer.observe(table);
    update();
    return () => {
      observer.disconnect();
      scroller.style.removeProperty("scroll-padding-block-start");
    };
  }, [enabled]);
  return { rootRef, bodyRef, virtualizer };
}
