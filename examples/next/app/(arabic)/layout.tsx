import { KumikoProvider } from "kumiko-ui";
import type { ReactNode } from "react";
import "kumiko-ui/fonts.css";
import "../globals.css";
import { BoardShell } from "../board-shell";

export const metadata = { title: "مثال Kumiko" };

export default function ArabicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="app-root">
          <KumikoProvider direction="rtl" locale="ar-u-nu-arab">
            <BoardShell arabic>{children}</BoardShell>
          </KumikoProvider>
        </div>
      </body>
    </html>
  );
}
