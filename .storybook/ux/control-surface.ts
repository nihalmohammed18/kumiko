interface SurfaceNode<T> {
  tagName: string;
  parentElement: T | null;
  getAttribute(name: string): string | null;
}

// Inputs drawn inside a field-styled group, keyed by data-slot: the group paints the boundary and the focus ring.
const GROUPS: Record<string, string> = {
  "number-field-input": "number-field-group",
  "combobox-input": "combobox-input-group",
};

/** Finds the part that paints an input's boundary, interaction feedback and focus ring.
 * Use when: measuring a composite control. Avoid when: reading its native value, disabled state or text size.
 */
export function controlSurface<T extends SurfaceNode<T>>(element: T): T {
  const slot =
    element.tagName === "INPUT" && element.getAttribute("type") === "range"
      ? "slider-thumb"
      : GROUPS[element.getAttribute("data-slot") ?? ""];
  if (!slot) return element;
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (parent.getAttribute("data-slot") === slot) return parent;
  }
  return element;
}

/** Finds the pointer target; a number field's group doesn't enlarge its input's hit area.
 * Use when: measuring pointer targets. Avoid when: measuring rings or borders; use controlSurface.
 */
export function controlHitTarget<T extends SurfaceNode<T>>(element: T): T {
  return element.tagName === "INPUT" && element.getAttribute("type") === "range" ? controlSurface(element) : element;
}
