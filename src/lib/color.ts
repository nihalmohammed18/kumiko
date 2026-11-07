/** sRGB channels in 0–255 (unrounded) and alpha in 0–1.
 * Use when: passing computed colours to UX decisions. Avoid when: retaining a wide-gamut colour.
 */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Opaque sRGB white.
 * Use when: supplying a default backdrop. Avoid when: representing transparency.
 */
export const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

/** Opaque sRGB black.
 * Use when: supplying an initial text colour. Avoid when: representing transparency.
 */
export const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };

const NUMBER = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?)(%)?$/i;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
type Vector = [number, number, number];

function component(value: string, percentScale: number | null = 1): number | null {
  if (value === "none") return 0;
  const match = NUMBER.exec(value);
  if (!match || (match[2] && percentScale === null)) return null;
  const number = Number(match[1]);
  if (!Number.isFinite(number)) return null;
  return match[2] ? (number / 100) * (percentScale ?? 1) : number;
}

function angle(value: string): number | null {
  if (value === "none") return 0;
  const token = value.replace(/deg$/, "");
  return token === "none" ? null : component(token, null);
}

function linear(value: number): number {
  const magnitude = Math.abs(value);
  return Math.sign(value) * (magnitude <= 0.04045 ? magnitude / 12.92 : ((magnitude + 0.055) / 1.055) ** 2.4);
}

function gamma(value: number): number {
  const magnitude = Math.abs(value);
  return Math.sign(value) * (magnitude <= 0.0031308 ? 12.92 * magnitude : 1.055 * magnitude ** (1 / 2.4) - 0.055);
}

function rgba(channels: Vector, alpha: number): Rgba | null {
  if (!channels.every(Number.isFinite)) return null;
  return { r: clamp(channels[0]) * 255, g: clamp(channels[1]) * 255, b: clamp(channels[2]) * 255, a: clamp(alpha) };
}

function fromLinear(channels: Vector, alpha: number): Rgba | null {
  return rgba([gamma(channels[0]), gamma(channels[1]), gamma(channels[2])], alpha);
}

function oklabToLinear([L, a, b]: Vector): Vector {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function p3ToLinear([r, g, b]: Vector): Vector {
  const x = 0.4865709486482162 * r + 0.2656676931690931 * g + 0.1982172852343625 * b;
  const y = 0.2289745640697488 * r + 0.6917385218365064 * g + 0.079286914093745 * b;
  const z = 0.0451133818589026 * g + 1.043944368900976 * b;
  return [
    3.2409699419045226 * x - 1.537383177570094 * y - 0.4986107602930034 * z,
    -0.9692436362808796 * x + 1.8759675015077202 * y + 0.0415550574071756 * z,
    0.0556300796969937 * x - 0.2039769588889765 * y + 1.0569715142428786 * z,
  ];
}

/** Parses hex tokens and Chrome's computed CSS colours; unsupported or malformed values return null.
 * Use when: reading theme or snapshot colours. Avoid when: parsing arbitrary CSS declarations.
 */
export function parseColor(value: string): Rgba | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  if (text === "transparent") return { ...BLACK, a: 0 };
  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.exec(text)?.[1];
  if (hex) {
    const channels = hex.length < 5 ? Array.from(hex, (channel) => channel + channel).join("") : hex;
    return {
      r: Number.parseInt(channels.slice(0, 2), 16),
      g: Number.parseInt(channels.slice(2, 4), 16),
      b: Number.parseInt(channels.slice(4, 6), 16),
      a: channels.length === 8 ? Number.parseInt(channels.slice(6, 8), 16) / 255 : 1,
    };
  }
  const match = /^(rgb|rgba|color|oklab|oklch)\(([^()]*)\)$/.exec(text);
  if (!match) return null;
  const name = match[1]!;
  const body = match[2]!;
  let parts: string[];
  let alphaToken: string | undefined;
  if ((name === "rgb" || name === "rgba") && body.includes(",")) {
    if (body.includes("/")) return null;
    const tokens = body.split(",").map((token) => token.trim());
    if (tokens.length !== 3 && tokens.length !== 4) return null;
    parts = tokens.slice(0, 3);
    alphaToken = tokens[3];
  } else {
    if (body.includes(",")) return null;
    const tokens = body.split("/");
    if (tokens.length > 2) return null;
    parts = tokens[0]!.trim().split(/\s+/);
    alphaToken = tokens[1]?.trim();
  }
  const alpha = alphaToken === undefined ? 1 : component(alphaToken);
  const space = name === "color" ? parts.shift() : name;
  if (alpha === null || parts.length !== 3) return null;
  if (name === "color" && !["srgb", "srgb-linear", "display-p3"].includes(space ?? "")) return null;
  if (space === "rgb" || space === "rgba") {
    const channels = parts.map((part) => component(part, 255));
    if (channels.some((channel) => channel === null)) return null;
    return rgba([channels[0]! / 255, channels[1]! / 255, channels[2]! / 255], alpha);
  }
  if (space === "srgb" || space === "srgb-linear" || space === "display-p3") {
    const channels = parts.map((part) => component(part));
    if (channels.some((channel) => channel === null)) return null;
    const rgb: Vector = [channels[0]!, channels[1]!, channels[2]!];
    if (space === "srgb") return rgba(rgb, alpha);
    if (space === "srgb-linear") return fromLinear(rgb, alpha);
    return fromLinear(p3ToLinear([linear(rgb[0]), linear(rgb[1]), linear(rgb[2])]), alpha);
  }
  if (space === "oklab" || space === "oklch") {
    const L = component(parts[0]!);
    const a = component(parts[1]!, 0.4);
    const b = space === "oklch" ? angle(parts[2]!) : component(parts[2]!, 0.4);
    if (L === null || a === null || b === null) return null;
    const lab: Vector =
      space === "oklab"
        ? [clamp(L), a, b]
        : [clamp(L), Math.max(0, a) * Math.cos((b * Math.PI) / 180), Math.max(0, a) * Math.sin((b * Math.PI) / 180)];
    return fromLinear(oklabToLinear(lab), alpha);
  }
  return null;
}

/** Source-over compositing in gamma-encoded sRGB, including alpha.
 * Use when: stacking browser colour layers. Avoid when: blending light in linear sRGB.
 */
export function over(top: Rgba, bottom: Rgba): Rgba {
  const remaining = bottom.a * (1 - top.a);
  const a = top.a + remaining;
  if (a === 0) return { ...BLACK, a: 0 };
  return {
    r: (top.r * top.a + bottom.r * remaining) / a,
    g: (top.g * top.a + bottom.g * remaining) / a,
    b: (top.b * top.a + bottom.b * remaining) / a,
    a,
  };
}

/** Flattens topmost-first layers onto an opaque base, defaulting to white.
 * Use when: measuring rendered colours. Avoid when: retaining layer transparency.
 */
export function flatten(layers: Rgba[], base: Rgba = WHITE): Rgba {
  return layers.reduceRight((bottom, top) => over(top, bottom), { ...base, a: 1 });
}

/** WCAG 2 relative luminance, treating the colour as opaque.
 * Use when: calculating contrast. Avoid when: passing uncomposited transparency.
 */
export function luminance(c: Rgba): number {
  return 0.2126 * linear(c.r / 255) + 0.7152 * linear(c.g / 255) + 0.0722 * linear(c.b / 255);
}

/** WCAG 2 contrast ratio from 1 to 21, treating both colours as opaque.
 * Use when: checking accessibility thresholds. Avoid when: comparing subtle colour changes.
 */
export function contrast(a: Rgba, b: Rgba): number {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/** OKLab coordinates of an opaque sRGB colour.
 * Use when: measuring perceptual colour distance. Avoid when: retaining alpha.
 */
export function toOklab(c: Rgba): Vector {
  const r = linear(c.r / 255);
  const g = linear(c.g / 255);
  const b = linear(c.b / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** Euclidean OKLab distance; about 0.02 is just noticeable.
 * Use when: checking visible colour feedback. Avoid when: enforcing contrast ratios.
 */
export function deltaE(a: Rgba, b: Rgba): number {
  const first = toOklab(a);
  const second = toOklab(b);
  return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
}
