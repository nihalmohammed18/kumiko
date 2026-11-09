import { Children, type CSSProperties, cloneElement, isValidElement, type ReactNode } from "react";
import { EmailDocument, type EmailProps } from "../email.tsx";
import { defaultEmailTheme } from "../email-theme.ts";

/** A personal note's body, signature and optional translated document metadata.
 * Use when: typing PlainEmail. Avoid when: adding a logo or call to action; use a branded template.
 */
export interface PlainEmailProps extends Omit<EmailProps, "children" | "title" | "preview"> {
  children: ReactNode;
  signature?: string;
  title?: string;
  preview?: string;
}

function plainContent(content: ReactNode, ink: string): ReactNode {
  return Children.map(content, (node) => {
    if (!isValidElement<{ children?: ReactNode; style?: CSSProperties }>(node)) return node;
    const style =
      node.type === "a"
        ? { color: ink, textDecoration: "underline" }
        : node.type === "p"
          ? { margin: "0 0 16px" }
          : undefined;
    return cloneElement(node, {
      ...(style && { style: { ...node.props.style, ...style } }),
      children: plainContent(node.props.children, ink),
    });
  });
}

/** A personally written Arial note with inline underlined ink links and an optional signature.
 * Use when: sending body text without template decoration. Avoid when: needing branding; only theme.ink is used.
 *
 * @example
 * <PlainEmail title="Your application update" preview="The team would like to meet you." signature="Aisha at Cedar Labs">
 *   <p>Thanks for applying. We would love to hear about your recent work.</p>
 * </PlainEmail>
 */
export function PlainEmail({
  children,
  signature,
  title = "",
  preview = "",
  dir = "ltr",
  lang = "en",
  theme,
  fontHref,
}: PlainEmailProps) {
  const ink = theme?.ink ?? defaultEmailTheme.ink;
  const plainTheme = { ink, canvas: defaultEmailTheme.surface, surface: defaultEmailTheme.surface };
  return (
    <EmailDocument dir={dir} lang={lang} theme={plainTheme} title={title} preview={preview} fontHref={fontHref} plain>
      {plainContent(children, ink)}
      {signature !== undefined && <p style={{ margin: "0 0 16px" }}>{signature}</p>}
    </EmailDocument>
  );
}
