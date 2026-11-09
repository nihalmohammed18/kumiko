/// <reference types="vite/client" />
import fredoka from "@fontsource-variable/fredoka/files/fredoka-latin-wght-normal.woff2?url";
import nunito from "@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2?url";
import type { ReactElement } from "react";
import { renderEmail } from "../src/email/render-email.ts";

const faces = `@font-face{font-family:Fredoka;font-style:normal;font-weight:300 700;src:url("${fredoka}") format("woff2")}
@font-face{font-family:Nunito;font-style:normal;font-weight:200 1000;src:url("${nunito}") format("woff2")}`;

/** Local font aliases and a fitted iframe, kept out of the HTML sent to mail clients. */
export function EmailFrame({ email, title, height = 800 }: { email: ReactElement; title: string; height?: number }) {
  // Storybook's relative production base also works under GitHub Pages' /kumiko/ path.
  const artBase = new URL("email-art/", new URL(import.meta.env.BASE_URL, document.baseURI)).href;
  const html = renderEmail(email)
    .replaceAll('"/email-art/', `"${artBase}`)
    .replace("</head>", `<style>${faces}</style></head>`);
  return (
    <iframe
      title={title}
      srcDoc={html}
      sandbox="allow-same-origin"
      tabIndex={-1}
      onLoad={async (event) => {
        const frame = event.currentTarget;
        const document = frame.contentDocument;
        if (!document) return;
        await Promise.all([
          document.fonts.load("700 16px Fredoka", "Aa"),
          document.fonts.load("400 16px Nunito", "Aa"),
        ]);
        if (frame.contentDocument !== document) return;
        frame.style.height = "1px";
        frame.style.height = `${document.documentElement.scrollHeight}px`;
        frame.dataset.emailReady = "true";
      }}
      style={{ display: "block", width: 632, maxWidth: "100%", height, border: 0 }}
    />
  );
}
