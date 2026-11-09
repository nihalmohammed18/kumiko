"use client";

import { Card, CardDescription, CardLink, CardTitle, Toggle, ToggleGroup } from "kumiko-ui";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Job } from "../../jobs";

/** Applies local display preferences and navigates the URL's remote-work filter.
 * Use when: browsing a page of opportunities. Avoid when: tracking submitted applications.
 */
export function JobView({ jobs, remote }: { jobs: Job[]; remote: boolean }) {
  const router = useRouter();
  const [view, setView] = useState(["details"]);
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
        <Toggle
          pressed={remote}
          onPressedChange={(next) => router.push(`/navigation?page=1${next ? "&remote=1" : ""}`)}
        >
          Only remote
        </Toggle>
      </div>
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardTitle level={2}>
            <CardLink render={<NextLink href="/forms" />}>
              {job.role} at {job.company}
            </CardLink>
          </CardTitle>
          {view.includes("details") && <CardDescription>{job.location} · Mentorship and room to grow.</CardDescription>}
        </Card>
      ))}
      {jobs.length === 0 && <p>No remote roles right now.</p>}
    </div>
  );
}
