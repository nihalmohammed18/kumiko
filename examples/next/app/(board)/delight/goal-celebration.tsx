"use client";

import { Celebration, Dialog, DialogBody, DialogDescription, DialogPopup, DialogTitle, DialogTrigger } from "kumiko-ui";
import { useState } from "react";

/** Mounts the celebration after a button press and contains its focus in a dialog.
 * Use when: marking a rare job-search milestone. Avoid when: confirming a routine edit.
 */
export function GoalCelebration() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger tone="primary">Complete my weekly goal</DialogTrigger>
      <DialogPopup>
        <DialogTitle>A week of small steps</DialogTitle>
        <DialogDescription>You made time for your next role.</DialogDescription>
        <DialogBody>
          <Celebration
            title="Weekly goal complete!"
            description="Five thoughtful applications. That is progress."
            character="pip"
            stats={[{ label: "Applications this week", value: 5, from: 4 }]}
            progress={{ label: "Weekly goal", value: 100, from: 80 }}
            onContinue={() => setOpen(false)}
            continueLabel="Keep exploring"
          />
        </DialogBody>
      </DialogPopup>
    </Dialog>
  );
}
