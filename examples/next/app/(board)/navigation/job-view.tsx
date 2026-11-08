"use client";

import { Card, CardDescription, CardLink, CardTitle, Toggle, ToggleGroup } from "kumiko-ui";
import NextLink from "next/link";
import { useState } from "react";
import type { Job } from "../../jobs";

/** Applies local display and remote-work preferences to the current URL page.
 * Use when: browsing a page of opportunities. Avoid when: tracking submitted applications.
 */
export function JobView({ jobs }: { jobs: Job[] }) {
  const [view, setView] = useState(["details"]);
  const [remote, setRemote] = useState(false);
  const visible = jobs.filter((job) => !remote || job.location === "Remote");
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          aria-label="Result display"
          value={view}
          onValueChange={(next) => {
            if (next.length) setView(next);
          }}
        >
          <Toggle value="compact">Compact</Toggle>
          <Toggle value="details">With details</Toggle>
        </ToggleGroup>
        <Toggle pressed={remote} onPressedChange={setRemote}>
          Only remote
        </Toggle>
      </div>
      {visible.map((job) => (
        <Card key={job.id}>
          <CardTitle level={2}>
            <CardLink render={<NextLink href="/forms" />}>
              {job.role} at {job.company}
            </CardLink>
          </CardTitle>
          {view.includes("details") && <CardDescription>{job.location} · Mentorship and room to grow.</CardDescription>}
        </Card>
      ))}
      {visible.length === 0 && <p>No remote roles on this page. Try another page or turn off the filter.</p>}
    </div>
  );
}
