import type { EmailImageProps } from "./email-image.tsx";

/** English alternative text for the default-palette email PNGs.
 * Use when: preparing the art export script or emailArt. Avoid when: translating a product's email copy.
 */
export const emailArtDescriptions = {
  "pip-waving": "Pip waving hello",
  "pip-cheering": "Pip cheering",
  "pip-idle": "Pip smiling",
  "mori-cheering": "Mori cheering",
  "mori-thinking": "Mori thinking",
  "tuck-cheering": "Tuck cheering",
  "tuck-waving": "Tuck waving hello",
  envelope: "A friendly purple envelope",
  "sealed-envelope": "An envelope sealed with a star",
  trophy: "A golden trophy",
  star: "A golden star",
  calendar: "A colourful calendar",
  flame: "A bright golden flame",
} as const;

/** The shipped default-palette PNG names.
 * Use when: choosing emailArt. Avoid when: naming recoloured or product-specific images.
 */
export type EmailArtName = keyof typeof emailArtDescriptions;

/** Builds display metadata for a default-palette PNG hosted by the product.
 * Use when: passing art to a branded email or EmailImage. Avoid when: expecting package paths to be public URLs.
 *
 * @example
 * const art = emailArt("pip-waving", "https://jobs.example.com/email-art");
 */
export function emailArt(
  name: EmailArtName,
  baseUrl: string,
): Pick<EmailImageProps, "src" | "width" | "height" | "alt"> {
  return {
    src: `${baseUrl.replace(/\/+$/, "")}/${name}.png`,
    width: 160,
    height: 160,
    alt: emailArtDescriptions[name],
  };
}
