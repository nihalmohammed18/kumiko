import { KumikoProvider } from "kumiko-ui";
import type { ReactNode } from "react";
import "kumiko-ui/fonts.css";
import "../globals.css";
import { BoardShell } from "../board-shell";

export const metadata = { title: "Kumiko example, dark" };

export default function DarkLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-theme="dark">
      <body>
        <div className="app-root">
          <KumikoProvider direction="ltr" locale="en">
            <BoardShell>{children}</BoardShell>
          </KumikoProvider>
        </div>
      </body>
    </html>
  );
}
