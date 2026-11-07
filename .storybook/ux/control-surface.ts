interface SurfaceNode<T> {
  tagName: string;
  parentElement: T | null;
  getAttribute(name: string): string | null;
}

// Controls whose look is painted by an ancestor, keyed by data-slot: a field-styled group paints its input's boundary
// and focus ring, and a linked card paints its stretched link's press, edge and ring.
const SURFACES: Record<string, string> = {
  "number-field-input": "number-field-group",
  "combobox-input": "combobox-input-group",
  "card-link": "card",
};

/** Finds the part that paints an input's boundary, interaction feedback and focus ring.
 * Use when: measuring a composite control. Avoid when: reading its native value, disabled state or text size.
 */
export function controlSurface<T extends SurfaceNode<T>>(element: T): T {
  const slot =
    element.tagName === "INPUT" && element.getAttribute("type") === "range"
      ? "slider-thumb"
      : SURFACES[element.getAttribute("data-slot") ?? ""];
  if (!slot) return element;
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (parent.getAttribute("data-slot") === slot) return parent;
  }
  return element;
}

/** Finds the pointer target, including stretched card links; a number field's group doesn't enlarge its input.
 * Use when: measuring pointer targets. Avoid when: measuring rings or borders; use controlSurface.
 */
export function controlHitTarget<T extends SurfaceNode<T>>(element: T): T {
  return (element.tagName === "INPUT" && element.getAttribute("type") === "range") ||
    element.getAttribute("data-slot") === "card-link"
    ? controlSurface(element)
    : element;
}
