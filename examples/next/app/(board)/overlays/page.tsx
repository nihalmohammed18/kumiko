import { Toaster } from "kumiko-ui";
import { AlertActions } from "./alert-actions";
import { SavedJob } from "./saved-job";

export default function OverlaysPage() {
  return (
    <>
      <h1 className="font-display text-headline font-bold">Make the next move</h1>
      <p className="text-ink-muted">Review a saved role, refine your alerts and try Undo after removing it.</p>
      <SavedJob />
      <AlertActions />
      <Toaster />
    </>
  );
}
