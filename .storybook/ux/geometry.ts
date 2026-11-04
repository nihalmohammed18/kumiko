/** An axis-aligned bounding rectangle in CSS pixels.
 * Use when: passing measured boxes to UX decisions. Avoid when: representing rotated geometry.
 */
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A coordinate in CSS pixels.
 * Use when: passing hit-test locations. Avoid when: describing a target's size.
 */
export interface Point {
  x: number;
  y: number;
}

/** Per-side amounts in CSS pixels.
 * Use when: growing or shrinking a rectangle. Avoid when: storing logical CSS declarations.
 */
export interface Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Whether the inner box lies within the outer box, allowing 0.5px by default.
 * Use when: checking clipping. Avoid when: checking overlap alone.
 */
export function inside(inner: Rect, outer: Rect, tolerance = 0.5): boolean {
  return (
    inner.left >= outer.left - tolerance &&
    inner.top >= outer.top - tolerance &&
    inner.left + inner.width <= outer.left + outer.width + tolerance &&
    inner.top + inner.height <= outer.top + outer.height + tolerance
  );
}

/** Grows a rectangle by per-side amounts; negative amounts shrink it.
 * Use when: including an edge or ring in a box. Avoid when: moving the box without resizing.
 */
export function outset(rect: Rect, by: Sides): Rect {
  return {
    left: rect.left - by.left,
    top: rect.top - by.top,
    width: rect.width + by.left + by.right,
    height: rect.height + by.top + by.bottom,
  };
}

/** Whether every edge matches within 0.5px by default.
 * Use when: detecting layout shifts. Avoid when: checking containment.
 */
export function sameBox(a: Rect, b: Rect, tolerance = 0.5): boolean {
  return (
    Math.abs(a.left - b.left) <= tolerance &&
    Math.abs(a.top - b.top) <= tolerance &&
    Math.abs(a.left + a.width - b.left - b.width) <= tolerance &&
    Math.abs(a.top + a.height - b.top - b.height) <= tolerance
  );
}

function centre(rect: Rect): Point {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** Five hit-test points: centre, then ±(size/2 − 0.5) along x and y.
 * Use when: measuring a centred hit target. Avoid when: approximating circular overlap.
 */
export function plusPoints(rect: Rect, size: number): Point[] {
  const { x, y } = centre(rect);
  const offset = size / 2 - 0.5;
  return [
    { x, y },
    { x: x + offset, y },
    { x: x - offset, y },
    { x, y: y + offset },
    { x, y: y - offset },
  ];
}

function distanceSquared(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

/** Indices of targets below the minimum (24px by default) that fail WCAG's spacing exception.
 * Use when: checking WCAG 2.5.8 target spacing. Avoid when: enforcing touch pressable sizes.
 */
export function undersized(targets: Rect[], min = 24): number[] {
  const centres = targets.map(centre);
  const small = targets.map((target) => target.width < min || target.height < min);
  return targets.flatMap((_, index) => {
    if (!small[index]) return [];
    const point = centres[index]!;
    const intersects = targets.some((other, otherIndex) => {
      if (otherIndex === index) return false;
      const nearest = {
        x: Math.max(other.left, Math.min(point.x, other.left + other.width)),
        y: Math.max(other.top, Math.min(point.y, other.top + other.height)),
      };
      return (
        distanceSquared(point, nearest) < (min / 2) ** 2 ||
        (small[otherIndex] && distanceSquared(point, centres[otherIndex]!) < min ** 2)
      );
    });
    return intersects ? [index] : [];
  });
}
