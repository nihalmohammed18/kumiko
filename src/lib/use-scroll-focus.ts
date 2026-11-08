"use client";

import { type Ref, useCallback, useState } from "react";

/** Makes a scroll container a Tab stop while its content overflows, so keyboard users can scroll it in every browser
 * (Chrome and Firefox do this on their own; Safari doesn't). Returns a ref, which also sets `forwarded`, and the tabIndex.
 * Use when: a dialog or drawer body may scroll with no focusable content. Avoid when: the region never scrolls.
 */
export function useScrollFocus<T extends HTMLElement>(forwarded?: Ref<T>) {
  const [scrollable, setScrollable] = useState(false);
  const ref = useCallback(
    (node: T | null) => {
      assign(forwarded, node);
      if (!node) return;
      const update = () =>
        setScrollable(node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1);
      const resize = new ResizeObserver(update);
      const mutation = new MutationObserver(update);
      resize.observe(node);
      mutation.observe(node, { childList: true, subtree: true, characterData: true });
      update();
      return () => {
        resize.disconnect();
        mutation.disconnect();
        assign(forwarded, null);
      };
    },
    [forwarded],
  );
  return [ref, scrollable ? 0 : undefined] as const;
}

function assign<T>(target: Ref<T> | undefined, value: T | null) {
  if (typeof target === "function") target(value);
  else if (target) target.current = value;
}
