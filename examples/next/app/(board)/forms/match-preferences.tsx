"use client";

import { Chip, ChipGroup, Switch } from "kumiko-ui";
import { useState } from "react";

/** Includes chip selections in the form and toggles immediate matching guidance.
 * Use when: refining job preferences. Avoid when: choosing a single exclusive option.
 */
export function MatchPreferences() {
  const [filters, setFilters] = useState(["remote"]);
  const [tips, setTips] = useState(true);
  return (
    <div className="grid gap-3">
      <ChipGroup aria-label="Job preferences" value={filters} onValueChange={setFilters}>
        <Chip value="remote">Remote</Chip>
        <Chip value="paid" accent="leaf">
          Paid internships
        </Chip>
        <Chip value="flexible" accent="sun">
          Flexible hours
        </Chip>
      </ChipGroup>
      <input type="hidden" name="preferences" value={filters.join(",")} />
      <Switch checked={tips} onCheckedChange={setTips} aria-controls="match-tips">
        Show matching tips
      </Switch>
      <p id="match-tips" hidden={!tips} className="text-body-sm text-ink-muted">
        A wider commute range can help you find more entry-level roles.
      </p>
    </div>
  );
}
