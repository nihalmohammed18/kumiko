import type { EmailLogoProps } from "./email-logo.tsx";
import { emailAlignment } from "./email-styles.ts";
import { EmailTable } from "./email-table.tsx";

/** Required image metadata and a logical alignment for email artwork.
 * Use when: typing EmailImage. Avoid when: passing SVG or omitting display dimensions.
 */
export interface EmailImageProps extends EmailLogoProps {
  align?: "center" | "start";
}

/** A centred, responsive raster image with explicit display dimensions and alternative text.
 * Use when: showing a PNG exported at twice its display size. Avoid when: embedding browser SVG components in mail.
 *
 * @example
 * <EmailImage src="https://jobs.example.com/email-art/pip-waving.png" width={160} height={160} alt="Pip waving hello" />
 */
export function EmailImage({ align = "center", dir, lang, width, height, alt, ...props }: EmailImageProps) {
  return (
    <EmailTable dir={dir} lang={lang} cell={{ align: align === "center" ? "center" : emailAlignment(dir) }}>
      <img
        {...props}
        dir={dir}
        lang={lang}
        width={width}
        height={height}
        alt={alt}
        data-slot="email-image"
        style={{
          display: "block",
          maxWidth: "100%",
          height: "auto",
          border: 0,
          marginInlineStart: align === "center" ? "auto" : 0,
          marginInlineEnd: "auto",
        }}
      />
    </EmailTable>
  );
}
