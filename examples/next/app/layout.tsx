import { KumikoProvider } from "kumiko-ui";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "Kumiko example" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <KumikoProvider direction="ltr" locale="en">
          {children}
        </KumikoProvider>
      </body>
    </html>
  );
}
