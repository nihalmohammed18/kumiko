"use client";

import { SidebarGroup, SidebarLink } from "kumiko-ui";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { destinations } from "./destinations";

/** Marks the current destination after client navigation as well as on first render.
 * Use when: composing BoardShell. Avoid when: rendering the isolated button fixture.
 */
export function NavigationLinks({ arabic = false }: { arabic?: boolean }) {
  const pathname = usePathname();
  return (
    <SidebarGroup label={arabic ? "لوحة الوظائف" : "Job board"}>
      {destinations.map((destination) => (
        <SidebarLink
          key={destination.href}
          render={<NextLink href={destination.href} />}
          current={pathname === destination.href}
          lang={destination.href === "/ar" ? "ar" : undefined}
        >
          {arabic ? destination.ar : destination.title}
        </SidebarLink>
      ))}
    </SidebarGroup>
  );
}
