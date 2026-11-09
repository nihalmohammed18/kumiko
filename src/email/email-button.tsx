import type { CSSProperties } from "react";
import { border, email } from "../tokens.ts";
import { emailAlignment, emailJoinedScript, emailTypeStyle } from "./email-styles.ts";
import { EmailTable } from "./email-table.tsx";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native link props and an explicit theme for an email call to action.
 * Use when: typing EmailButton. Avoid when: adding script-driven button actions to email.
 */
export interface EmailButtonProps extends EmailPartProps<"a"> {
  href: string;
  children?: string;
  variant?: "primary" | "secondary";
  align?: "center" | "start";
  fullWidth?: boolean;
}

/** A chunky table-backed link with a solid primary or bordered secondary face and a darker lower edge.
 * Use when: offering an email destination. Avoid when: linking a phrase within a paragraph; use EmailLink.
 *
 * @example
 * <EmailButton href="https://jobs.example.com/jobs/frontend">View frontend role</EmailButton>
 */
export function EmailButton({
  variant = "primary",
  align = "center",
  fullWidth = false,
  theme,
  dir,
  lang,
  children,
  ...props
}: EmailButtonProps) {
  const colors = resolveEmailTheme(theme);
  const primary = variant === "primary";
  const background = primary ? colors.brand : colors.surface;
  const foreground = primary ? colors["brand-fg"] : colors.ink;
  const alignment = align === "center" ? "center" : emailAlignment(dir);
  // Word-based Outlook ignores link padding; the cell preserves spacing even without radii or the edge.
  const cellStyle: CSSProperties & { msoPaddingAlt: string } = {
    backgroundColor: background,
    color: foreground,
    borderRadius: email.radii.control,
    border: primary ? undefined : `${border} solid ${colors.line}`,
    borderBottom: `${email.edges.button} solid ${primary ? colors.edge : colors["edge-neutral"]}`,
    msoPaddingAlt: "16px 32px",
  };
  return (
    <EmailTable dir={dir} lang={lang} cell={{ align: alignment }}>
      <EmailTable
        dir={dir}
        lang={lang}
        width={fullWidth ? "100%" : "auto"}
        align={alignment}
        data-full-width={fullWidth || undefined}
        style={{
          width: fullWidth ? "100%" : "auto",
          maxWidth: "100%",
          marginInlineStart: align === "center" ? "auto" : 0,
          marginInlineEnd: "auto",
        }}
        cell={{ bgcolor: background, style: cellStyle }}
      >
        <a
          {...props}
          dir={dir}
          lang={lang}
          data-slot="email-button"
          data-full-width={fullWidth || undefined}
          style={{
            display: "block",
            padding: "16px 32px",
            backgroundColor: background,
            color: foreground,
            borderRadius: email.radii.control,
            ...emailTypeStyle("button"),
            letterSpacing: emailJoinedScript(lang) ? "normal" : "0.04em",
            textDecoration: "none",
            textAlign: "center",
            overflowWrap: "anywhere",
            boxSizing: "border-box",
            cursor: "pointer",
          }}
        >
          {emailJoinedScript(lang) ? children : children?.toLocaleUpperCase(lang ?? "en")}
        </a>
      </EmailTable>
    </EmailTable>
  );
}
