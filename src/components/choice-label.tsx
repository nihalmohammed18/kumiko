"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { choiceLabelStyles } from "./choice-styles.ts";

interface ChoiceLabelProps<State> {
  controlProps: useRender.ElementProps<"span">;
  render?: useRender.RenderProp<State>;
  state: State;
  children: ReactNode;
  textFirst?: boolean;
}

/** Wraps a native choice button without enclosing Base UI's sibling hidden input.
 * Use when: composing a labeled native choice in its render callback. Avoid when: the choice uses the default span.
 */
export function ChoiceLabel<State>({ controlProps, render, state, children, textFirst }: ChoiceLabelProps<State>) {
  const control = useRender({
    defaultTagName: "button",
    props: { ...controlProps },
    render: typeof render === "function" ? (props) => render(props, state) : render,
  });
  const text = <span className="min-w-0 wrap-break-word">{children}</span>;
  return (
    <label htmlFor={controlProps.id} className={choiceLabelStyles}>
      {textFirst && text}
      {control}
      {!textFirst && text}
    </label>
  );
}
