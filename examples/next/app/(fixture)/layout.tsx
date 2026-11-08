import { KumikoProvider } from "kumiko-ui";
import type { ReactNode } from "react";
import "kumiko-ui/fonts.css";
import "../globals.css";

// Keep this root free of the job-board shell so the existing bundle check stays isolated.
export default function FixtureLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <div className="app-root">
          <KumikoProvider direction="ltr" locale="en">
            {children}
          </KumikoProvider>
        </div>
      </body>
    </html>
  );
}
