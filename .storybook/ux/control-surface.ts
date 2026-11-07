interface SurfaceNode<T> {
  tagName: string;
  parentElement: T | null;
  getAttribute(name: string): string | null;
}

/** Finds the part that paints an input's boundary, interaction feedback and focus ring.
 * Use when: measuring a composite control. Avoid when: reading its native value, disabled state or text size.
 */
export function controlSurface<T extends SurfaceNode<T>>(element: T): T {
  const slot =
    element.tagName === "INPUT" && element.getAttribute("type") === "range"
      ? "slider-thumb"
      : element.getAttribute("data-slot") === "number-field-input"
        ? "number-field-group"
        : undefined;
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
