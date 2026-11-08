import type { ReactNode } from "react";
import "./fixture.css";

// Next 15's webpack build maps a client module shared by several root layouts (KumikoProvider, a shared stylesheet)
// to one layout's chunks, so a route here would load the job-board shell. This root shares nothing with the others,
// and Button falls back to English and left-to-right without a provider.
export default function FixtureLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
