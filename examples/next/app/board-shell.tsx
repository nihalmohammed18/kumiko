import { Link, Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarLayout, SidebarTrigger } from "kumiko-ui";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { NavigationLinks } from "./navigation-links";

/** Shares the responsive navigation while keeping page children on the server.
 * Use when: laying out a job-board page. Avoid when: checking Button-only tree-shaking.
 */
export function BoardShell({ children, arabic = false }: { children: ReactNode; arabic?: boolean }) {
  return (
    <SidebarLayout
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <p className="font-display text-title font-bold">{arabic ? "وظائف كوميكو" : "Kumiko jobs"}</p>
          </SidebarHeader>
          <SidebarContent>
            <NavigationLinks arabic={arabic} />
          </SidebarContent>
          <SidebarFooter>
            <p className="text-body-sm text-ink-muted">{arabic ? "خطوة صغيرة كل يوم" : "One small step, every day."}</p>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <header className="flex min-w-0 items-center gap-3 border-b-2 border-line bg-surface p-4">
        <SidebarTrigger />
        <Link render={<NextLink href={arabic ? "/ar" : "/"} />}>{arabic ? "لوحة الوظائف" : "Your job board"}</Link>
      </header>
      <main className="@container mx-auto grid min-w-0 max-w-5xl gap-6 p-4 font-body text-body">{children}</main>
    </SidebarLayout>
  );
}
