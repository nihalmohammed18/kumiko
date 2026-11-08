import type { ComponentProps } from "react";

/** An email image's native props with required source, pixel dimensions and alternative text.
 * Use when: typing EmailLogo. Avoid when: omitting dimensions or meaningful alternative text.
 */
export interface EmailLogoProps
  extends Omit<ComponentProps<"img">, "className" | "style" | "src" | "width" | "height" | "alt"> {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** A responsive email logo with explicit dimensions and alternative text.
 * Use when: showing a product's image mark. Avoid when: relying on CSS or an icon font to draw a logo.
 */
export function EmailLogo({ width, height, alt, ...props }: EmailLogoProps) {
  return (
    <img
      {...props}
      width={width}
      height={height}
      alt={alt}
      data-slot="email-logo"
      style={{ display: "block", maxWidth: "100%", height: "auto", border: 0 }}
    />
  );
}
