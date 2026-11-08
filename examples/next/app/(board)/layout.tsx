import { KumikoProvider } from "kumiko-ui";
import type { ReactNode } from "react";
import "kumiko-ui/fonts.css";
import "../globals.css";
import { BoardShell } from "../board-shell";

export const metadata = { title: "Kumiko example" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
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
