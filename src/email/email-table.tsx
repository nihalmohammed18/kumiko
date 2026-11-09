import type { ComponentProps } from "react";
import { emailAlignment } from "./email-styles.ts";

/** The shared presentation table and cell for internal email layouts.
 * Use when: implementing table-backed email parts. Avoid when: exposing arbitrary styles on public parts.
 */
export function EmailTable({
  children,
  cell,
  width = "100%",
  dir,
  lang,
  style,
  ...props
}: ComponentProps<"table"> & {
  bgcolor?: string;
  cell?: ComponentProps<"td"> & { bgcolor?: string; "data-slot"?: string };
}) {
  return (
    <table
      {...props}
      role="presentation"
      width={width}
      cellPadding="0"
      cellSpacing="0"
      dir={dir}
      lang={lang}
      style={{ borderCollapse: "separate", tableLayout: "fixed", ...style }}
    >
      <tbody>
        <tr>
          <td {...cell} dir={dir} lang={lang} align={cell?.align ?? emailAlignment(dir)}>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
